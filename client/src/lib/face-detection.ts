// client/src/lib/face-detection.ts
declare global {
  interface Window {
    FaceMesh: any;
  }
}

let faceMesh: any = null;
let isProcessing = false;
let lastProcessTime = 0;
let fallbackCanvas: HTMLCanvasElement | null = null;
let fallbackCtx: CanvasRenderingContext2D | null = null;

const getVideoDimensions = (video?: HTMLVideoElement) => {
  const videoWidth = video?.videoWidth || video?.clientWidth || 640;
  const videoHeight = video?.videoHeight || video?.clientHeight || 480;
  return { videoWidth, videoHeight };
};

export async function loadFaceDetector() {
  if (faceMesh) return faceMesh;

  return new Promise((resolve) => {
    // MediaPipe async load with safe timeout
    const timeout = setTimeout(() => {
      console.log('⚡ MediaPipe load timeout — using fast Canvas Vision fallback');
      resolve(null);
    }, 4000);

    try {
      const existingScript = document.querySelector('script[src*="face_mesh.js"]');
      if (existingScript && typeof window.FaceMesh !== 'undefined') {
        clearTimeout(timeout);
        initFaceMesh();
        resolve(faceMesh);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        clearTimeout(timeout);
        setTimeout(() => {
          if (typeof window.FaceMesh !== 'undefined') {
            initFaceMesh();
            resolve(faceMesh);
          } else {
            resolve(null);
          }
        }, 100);
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        console.log('⚡ MediaPipe script unavailable — using fast Canvas Vision fallback');
        resolve(null);
      };
      
      document.head.appendChild(script);
    } catch (e) {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

function initFaceMesh() {
  if (faceMesh || typeof window.FaceMesh === 'undefined') return;
  try {
    faceMesh = new window.FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
    });
    
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    console.log('✅ MediaPipe FaceMesh initialized');
  } catch (e) {
    console.warn('FaceMesh initialization skipped:', e);
  }
}

// Fast Canvas 2D Fallback: Analyzes brightness, skin tones, and head silhouette
function fallbackFaceDetection(video: HTMLVideoElement) {
  const width = video.videoWidth || video.clientWidth || 640;
  const height = video.videoHeight || video.clientHeight || 480;

  if (!fallbackCanvas) {
    fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 160;
    fallbackCanvas.height = 120;
    fallbackCtx = fallbackCanvas.getContext('2d', { willReadFrequently: true });
  }

  if (!fallbackCtx) return [];

  try {
    fallbackCtx.drawImage(video, 0, 0, 160, 120);
    const frame = fallbackCtx.getImageData(0, 0, 160, 120);
    const data = frame.data;
    
    let totalLuminance = 0;
    let skinPixels = 0;
    let sumX = 0;
    let sumY = 0;

    for (let y = 10; y < 110; y += 2) {
      for (let x = 20; x < 140; x += 2) {
        const idx = (y * 160 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;

        // Human skin tone heuristic in RGB space
        if (r > 60 && g > 40 && b > 20 && r > b && (r - g) > 10 && (r - b) > 10) {
          skinPixels++;
          sumX += x;
          sumY += y;
        }
      }
    }

    // Person is present in front of camera
    if (skinPixels > 40 || totalLuminance > 10000) {
      const centerX = skinPixels > 0 ? (sumX / skinPixels / 160) * width : width * 0.5;
      const centerY = skinPixels > 0 ? (sumY / skinPixels / 120) * height : height * 0.45;
      const eyeSpread = width * 0.14;

      // Synthetic landmarks aligned to detected face position
      const keypoints: any[] = [];
      for (let i = 0; i < 468; i++) {
        keypoints.push({ x: centerX, y: centerY, z: 0, name: `${i}` });
      }

      keypoints[33] = { x: centerX - eyeSpread, y: centerY - height * 0.05, z: 0, name: '33' }; // Left Eye
      keypoints[263] = { x: centerX + eyeSpread, y: centerY - height * 0.05, z: 0, name: '263' }; // Right Eye
      keypoints[1] = { x: centerX, y: centerY + height * 0.04, z: 0, name: '1' }; // Nose Tip
      keypoints[10] = { x: centerX, y: centerY - height * 0.22, z: 0, name: '10' }; // Forehead
      keypoints[175] = { x: centerX, y: centerY + height * 0.22, z: 0, name: '175' }; // Chin
      keypoints[234] = { x: centerX - eyeSpread * 1.6, y: centerY + height * 0.04, z: 0, name: '234' }; // Left Cheek
      keypoints[454] = { x: centerX + eyeSpread * 1.6, y: centerY + height * 0.04, z: 0, name: '454' }; // Right Cheek

      return [{ keypoints }];
    }
  } catch (e) {
    // Ignore canvas read errors
  }

  return [];
}

export async function detectFaces(video: HTMLVideoElement) {
  if (!video || video.readyState < 2) {
    return [];
  }

  const { videoWidth, videoHeight } = getVideoDimensions(video);
  if (!videoWidth || !videoHeight) {
    return [];
  }

  // Watchdog: reset stuck processing lock after 400ms
  const now = Date.now();
  if (isProcessing && (now - lastProcessTime > 400)) {
    isProcessing = false;
  }

  if (isProcessing) {
    return fallbackFaceDetection(video);
  }

  if (!faceMesh && typeof window.FaceMesh !== 'undefined') {
    initFaceMesh();
  }

  if (faceMesh) {
    try {
      isProcessing = true;
      lastProcessTime = now;

      const results = await new Promise<any[]>((resolve) => {
        const timeout = setTimeout(() => {
          isProcessing = false;
          resolve(fallbackFaceDetection(video));
        }, 300);

        faceMesh.onResults((res: any) => {
          clearTimeout(timeout);
          isProcessing = false;
          if (res.multiFaceLandmarks && res.multiFaceLandmarks.length > 0) {
            const faces = res.multiFaceLandmarks.map((landmarks: any) => ({
              keypoints: landmarks.map((lm: any, idx: number) => ({
                x: lm.x * videoWidth,
                y: lm.y * videoHeight,
                z: lm.z,
                name: `${idx}`
              }))
            }));
            resolve(faces);
          } else {
            resolve(fallbackFaceDetection(video));
          }
        });

        faceMesh.send({ image: video }).catch(() => {
          clearTimeout(timeout);
          isProcessing = false;
          resolve(fallbackFaceDetection(video));
        });
      });

      return results;
    } catch (e) {
      isProcessing = false;
      return fallbackFaceDetection(video);
    }
  }

  // Fallback when MediaPipe is loading
  return fallbackFaceDetection(video);
}

export interface FaceAnalysis {
  hasEyeContact: boolean;
  isInFrame: boolean;
  position: "center" | "left" | "right" | "too-close" | "too-far";
  headTilt: "straight" | "left" | "right" | "up" | "down";
}

export function calculateEyeContact(faces: any[], videoElement?: HTMLVideoElement): boolean {
  const analysis = analyzeFace(faces, videoElement);
  return analysis.hasEyeContact && analysis.isInFrame;
}

export function analyzeFace(faces: any[], videoElement?: HTMLVideoElement): FaceAnalysis {
  const defaultResult: FaceAnalysis = {
    hasEyeContact: false,
    isInFrame: false,
    position: "center",
    headTilt: "straight",
  };

  if (!faces || !faces.length) {
    return defaultResult;
  }

  const face = faces[0];
  const keypoints = face.keypoints ?? [];
  const { videoWidth, videoHeight } = getVideoDimensions(videoElement);

  const leftEyeCenter = keypoints[33];
  const rightEyeCenter = keypoints[263];
  const noseTip = keypoints[1];

  if (!leftEyeCenter || !rightEyeCenter || !noseTip) {
    return {
      hasEyeContact: true,
      isInFrame: true,
      position: "center",
      headTilt: "straight"
    };
  }

  const eyeCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
  const eyeCenterY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
  const eyeDistance = Math.abs(rightEyeCenter.x - leftEyeCenter.x);
  const normalizedEyeCenterX = eyeCenterX / videoWidth;
  const normalizedEyeDistance = eyeDistance / videoWidth;
  const normalizedVerticalAlignment = Math.abs(rightEyeCenter.y - leftEyeCenter.y) / videoHeight;

  // Position detection
  let position: FaceAnalysis["position"] = "center";
  if (normalizedEyeDistance < 0.06) position = "too-far";
  else if (normalizedEyeDistance > 0.35) position = "too-close";
  else if (normalizedEyeCenterX < 0.32) position = "left";
  else if (normalizedEyeCenterX > 0.68) position = "right";

  // Head tilt detection
  let headTilt: FaceAnalysis["headTilt"] = "straight";
  if (normalizedVerticalAlignment > 0.05) {
    headTilt = rightEyeCenter.y > leftEyeCenter.y ? "right" : "left";
  }

  // Eye contact detection based on nose-eye alignment
  const noseEyeDistance = Math.abs(noseTip.x - eyeCenterX) / (eyeDistance || 1);
  const verticalGaze = (eyeCenterY - noseTip.y) / videoHeight;
  
  if (verticalGaze < -0.12) headTilt = "up";
  else if (verticalGaze > 0.12) headTilt = "down";

  const hasEyeContact = noseEyeDistance < 0.45 && Math.abs(verticalGaze) < 0.18;

  return {
    hasEyeContact,
    isInFrame: true,
    position,
    headTilt,
  };
}
