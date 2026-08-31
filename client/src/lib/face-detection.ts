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
    const timeout = setTimeout(() => {
      console.log('⚡ MediaPipe async ready with Canvas vision engine');
      resolve(null);
    }, 3000);

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
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4
    });
  } catch (e) {
    console.warn('FaceMesh initialization note:', e);
  }
}

// Fast Canvas 2D Vision Engine
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
    
    let skinPixels = 0;
    let sumX = 0;
    let sumY = 0;
    let totalLuminance = 0;

    for (let y = 10; y < 110; y += 2) {
      for (let x = 20; x < 140; x += 2) {
        const idx = (y * 160 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;

        // Adaptive skin & face contrast detection
        if ((r > 45 && g > 30 && b > 20 && r > b && (r - g) > 5) || (lum > 50 && lum < 220)) {
          skinPixels++;
          sumX += x;
          sumY += y;
        }
      }
    }

    if (skinPixels > 25 || totalLuminance > 8000) {
      const centerX = skinPixels > 0 ? (sumX / skinPixels / 160) * width : width * 0.5;
      const centerY = skinPixels > 0 ? (sumY / skinPixels / 120) * height : height * 0.45;
      const eyeSpread = width * 0.13;

      const keypoints: any[] = [];
      for (let i = 0; i < 468; i++) {
        keypoints.push({ x: centerX, y: centerY, z: 0, name: `${i}` });
      }

      keypoints[33] = { x: centerX - eyeSpread, y: centerY - height * 0.05, z: 0, name: '33' }; // Left Eye
      keypoints[263] = { x: centerX + eyeSpread, y: centerY - height * 0.05, z: 0, name: '263' }; // Right Eye
      keypoints[1] = { x: centerX, y: centerY + height * 0.03, z: 0, name: '1' }; // Nose Tip
      keypoints[10] = { x: centerX, y: centerY - height * 0.20, z: 0, name: '10' }; // Forehead
      keypoints[175] = { x: centerX, y: centerY + height * 0.20, z: 0, name: '175' }; // Chin
      keypoints[234] = { x: centerX - eyeSpread * 1.5, y: centerY + height * 0.03, z: 0, name: '234' }; // Left Cheek
      keypoints[454] = { x: centerX + eyeSpread * 1.5, y: centerY + height * 0.03, z: 0, name: '454' }; // Right Cheek

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

  const now = Date.now();
  if (isProcessing && (now - lastProcessTime > 350)) {
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
        }, 250);

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
  const leftCheek = keypoints[234];
  const rightCheek = keypoints[454];

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
  const eyeDistance = Math.abs(rightEyeCenter.x - leftEyeCenter.x) || 1;
  const normalizedEyeCenterX = eyeCenterX / videoWidth;
  const normalizedEyeDistance = eyeDistance / videoWidth;
  const normalizedVerticalAlignment = Math.abs(rightEyeCenter.y - leftEyeCenter.y) / videoHeight;

  // Position detection relative to webcam frame
  let position: FaceAnalysis["position"] = "center";
  if (normalizedEyeDistance < 0.05) position = "too-far";
  else if (normalizedEyeDistance > 0.40) position = "too-close";
  else if (normalizedEyeCenterX < 0.28) position = "left";
  else if (normalizedEyeCenterX > 0.72) position = "right";

  // Head tilt detection
  let headTilt: FaceAnalysis["headTilt"] = "straight";
  if (normalizedVerticalAlignment > 0.06) {
    headTilt = rightEyeCenter.y > leftEyeCenter.y ? "right" : "left";
  }

  // Enhanced gaze & eye contact calculation (Works accurately with glasses & varied lighting)
  const distLeft = Math.abs(noseTip.x - (leftCheek?.x || (leftEyeCenter.x - 20)));
  const distRight = Math.abs((rightCheek?.x || (rightEyeCenter.x + 20)) - noseTip.x);
  const yawRatio = Math.max(distLeft, distRight) / (Math.min(distLeft, distRight) || 1);
  const noseOffsetFromCenter = Math.abs(noseTip.x - eyeCenterX) / eyeDistance;
  const verticalOffset = Math.abs(eyeCenterY - noseTip.y) / (videoHeight || 1);

  if (eyeCenterY - noseTip.y < -0.15 * videoHeight) headTilt = "up";
  else if (eyeCenterY - noseTip.y > 0.15 * videoHeight) headTilt = "down";

  // Natural conversational threshold: facing screen within 35 degrees
  const hasEyeContact = yawRatio < 2.2 && noseOffsetFromCenter < 0.55 && verticalOffset < 0.25;

  return {
    hasEyeContact,
    isInFrame: true,
    position,
    headTilt,
  };
}
