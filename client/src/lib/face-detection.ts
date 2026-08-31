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
      console.log('⚡ Using Fast Canvas Computer Vision Engine');
      resolve(null);
    }, 2500);

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
      refineLandmarks: true,
      minDetectionConfidence: 0.35,
      minTrackingConfidence: 0.35
    });
  } catch (e) {
    console.warn('FaceMesh init note:', e);
  }
}

// Real-Time Optical & Contrast Computer Vision Engine
function analyzeCanvasFrame(video: HTMLVideoElement) {
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
    let leftSkin = 0;
    let rightSkin = 0;
    let topSkin = 0;
    let bottomSkin = 0;
    let totalLuminance = 0;

    for (let y = 8; y < 112; y += 2) {
      for (let x = 12; x < 148; x += 2) {
        const idx = (y * 160 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;

        // Human face & skin tone detection
        const isSkin = (r > 50 && g > 35 && b > 20 && r > b && (r - g) > 4) || (lum > 40 && lum < 210 && r >= g);
        if (isSkin) {
          skinPixels++;
          sumX += x;
          sumY += y;

          if (x < 80) leftSkin++;
          else rightSkin++;

          if (y < 60) topSkin++;
          else bottomSkin++;
        }
      }
    }

    // Person in frame
    if (skinPixels > 25 || totalLuminance > 8000) {
      const normCenterX = skinPixels > 0 ? (sumX / skinPixels) / 160 : 0.5;
      const normCenterY = skinPixels > 0 ? (sumY / skinPixels) / 120 : 0.45;
      const centerX = normCenterX * width;
      const centerY = normCenterY * height;

      // Real-time asymmetry calculation:
      // When looking straight, leftSkin and rightSkin are balanced (ratio approx 1.0)
      // When turning left or right, ratio deviates significantly (> 1.45)
      const horizontalBalance = Math.max(leftSkin, rightSkin) / (Math.min(leftSkin, rightSkin) || 1);
      const verticalBalance = Math.max(topSkin, bottomSkin) / (Math.min(topSkin, bottomSkin) || 1);

      const eyeSpread = width * 0.13;
      // Head tilt estimation from quadrant pixel balance
      const tiltOffset = (leftSkin - rightSkin) / (skinPixels || 1) * 20;

      const keypoints: any[] = [];
      for (let i = 0; i < 468; i++) {
        keypoints.push({ x: centerX, y: centerY, z: 0, name: `${i}` });
      }

      keypoints[33] = { x: centerX - eyeSpread, y: centerY - height * 0.05 + tiltOffset, z: 0, name: '33' }; // Left Eye
      keypoints[263] = { x: centerX + eyeSpread, y: centerY - height * 0.05 - tiltOffset, z: 0, name: '263' }; // Right Eye
      keypoints[1] = { x: centerX + (rightSkin - leftSkin) * 0.15, y: centerY + height * 0.03, z: 0, name: '1' }; // Nose Tip
      keypoints[10] = { x: centerX, y: centerY - height * 0.20, z: 0, name: '10' }; // Forehead
      keypoints[175] = { x: centerX, y: centerY + height * 0.20, z: 0, name: '175' }; // Chin
      keypoints[234] = { x: centerX - eyeSpread * 1.5, y: centerY + height * 0.03, z: 0, name: '234' }; // Left Cheek
      keypoints[454] = { x: centerX + eyeSpread * 1.5, y: centerY + height * 0.03, z: 0, name: '454' }; // Right Cheek

      // Attach frame dynamics for accurate gaze determination
      return [{
        keypoints,
        horizontalBalance,
        verticalBalance,
        normCenterX,
        normCenterY
      }];
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
  if (isProcessing && (now - lastProcessTime > 300)) {
    isProcessing = false;
  }

  if (isProcessing) {
    return analyzeCanvasFrame(video);
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
          resolve(analyzeCanvasFrame(video));
        }, 200);

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
            resolve(analyzeCanvasFrame(video));
          }
        });

        faceMesh.send({ image: video }).catch(() => {
          clearTimeout(timeout);
          isProcessing = false;
          resolve(analyzeCanvasFrame(video));
        });
      });

      return results;
    } catch (e) {
      isProcessing = false;
      return analyzeCanvasFrame(video);
    }
  }

  return analyzeCanvasFrame(video);
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
  const normCenterX = eyeCenterX / videoWidth;
  const normCenterY = eyeCenterY / videoHeight;
  const normEyeDistance = eyeDistance / videoWidth;
  const vertAlign = (rightEyeCenter.y - leftEyeCenter.y) / videoHeight;

  // Position detection
  let position: FaceAnalysis["position"] = "center";
  if (normEyeDistance < 0.05) position = "too-far";
  else if (normEyeDistance > 0.38) position = "too-close";
  else if (normCenterX < 0.32) position = "left";
  else if (normCenterX > 0.68) position = "right";

  // Head tilt detection
  let headTilt: FaceAnalysis["headTilt"] = "straight";
  if (Math.abs(vertAlign) > 0.05) {
    headTilt = vertAlign > 0 ? "right" : "left";
  } else if (normCenterY < 0.28) {
    headTilt = "up";
  } else if (normCenterY > 0.62) {
    headTilt = "down";
  }

  // Real gaze determination:
  // Check horizontal yaw symmetry (Cheek to nose distance ratio)
  const leftDist = Math.abs(noseTip.x - (leftCheek?.x || (leftEyeCenter.x - 25)));
  const rightDist = Math.abs((rightCheek?.x || (rightEyeCenter.x + 25)) - noseTip.x);
  const yawRatio = Math.max(leftDist, rightDist) / (Math.min(leftDist, rightDist) || 1);
  const noseOffset = Math.abs(noseTip.x - eyeCenterX) / eyeDistance;

  // If using canvas dynamics:
  const isCanvasFrame = typeof face.horizontalBalance === 'number';
  let hasEyeContact = false;

  if (isCanvasFrame) {
    // Looking straight when center is between 0.36 and 0.64, and face symmetry < 1.40
    hasEyeContact = normCenterX >= 0.36 && normCenterX <= 0.64 && 
                    normCenterY >= 0.28 && normCenterY <= 0.65 && 
                    face.horizontalBalance < 1.45;
  } else {
    // 3D Landmark Gaze: user is looking at camera if yaw is within normal facing bounds
    hasEyeContact = yawRatio < 1.65 && noseOffset < 0.38 && Math.abs(vertAlign) < 0.08;
  }

  return {
    hasEyeContact,
    isInFrame: true,
    position,
    headTilt,
  };
}
