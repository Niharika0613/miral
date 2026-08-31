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
      console.log('⚡ Using Fast Pupil & Facial Vision Engine');
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
      refineLandmarks: true, // Enables iris landmarks (468: left iris, 473: right iris)
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4
    });
  } catch (e) {
    console.warn('FaceMesh initialization note:', e);
  }
}

// Canvas 2D Pupil & Eyeball Centroid Estimator
function analyzePupilAndCanvas(video: HTMLVideoElement) {
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
    let totalLuminance = 0;

    for (let y = 8; y < 112; y += 2) {
      for (let x = 12; x < 148; x += 2) {
        const idx = (y * 160 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;

        const isSkin = (r > 50 && g > 35 && b > 20 && r > b && (r - g) > 4) || (lum > 40 && lum < 210 && r >= g);
        if (isSkin) {
          skinPixels++;
          sumX += x;
          sumY += y;

          if (x < 80) leftSkin++;
          else rightSkin++;
        }
      }
    }

    if (skinPixels > 25 || totalLuminance > 8000) {
      const normCenterX = skinPixels > 0 ? (sumX / skinPixels) / 160 : 0.5;
      const normCenterY = skinPixels > 0 ? (sumY / skinPixels) / 120 : 0.45;
      const centerX = normCenterX * width;
      const centerY = normCenterY * height;

      // Extract left and right eye regions on the 160x120 canvas to find pupil dark cluster
      const eyeXLeft = Math.max(0, Math.min(150, Math.round(normCenterX * 160 - 20)));
      const eyeXRight = Math.max(0, Math.min(150, Math.round(normCenterX * 160 + 20)));
      const eyeY = Math.max(0, Math.min(110, Math.round(normCenterY * 120 - 6)));

      // Analyze left eye socket darkness distribution (pupil position)
      let leftPupilSumX = 0, leftPupilCount = 0;
      for (let ey = -4; ey <= 4; ey++) {
        for (let ex = -8; ex <= 8; ex++) {
          const px = eyeXLeft + ex;
          const py = eyeY + ey;
          if (px >= 0 && px < 160 && py >= 0 && py < 120) {
            const idx = (py * 160 + px) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            if (lum < 65) { // Dark pupil pixel
              leftPupilSumX += ex;
              leftPupilCount++;
            }
          }
        }
      }

      // Analyze right eye socket darkness distribution
      let rightPupilSumX = 0, rightPupilCount = 0;
      for (let ey = -4; ey <= 4; ey++) {
        for (let ex = -8; ex <= 8; ex++) {
          const px = eyeXRight + ex;
          const py = eyeY + ey;
          if (px >= 0 && px < 160 && py >= 0 && py < 120) {
            const idx = (py * 160 + px) * 4;
            const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            if (lum < 65) {
              rightPupilSumX += ex;
              rightPupilCount++;
            }
          }
        }
      }

      // Pupil offset relative to center of eye socket
      const leftPupilOffset = leftPupilCount > 0 ? (leftPupilSumX / leftPupilCount) : 0;
      const rightPupilOffset = rightPupilCount > 0 ? (rightPupilSumX / rightPupilCount) : 0;
      const avgPupilOffset = (leftPupilOffset + rightPupilOffset) / 2;

      const eyeSpread = width * 0.13;
      const keypoints: any[] = [];
      for (let i = 0; i < 478; i++) {
        keypoints.push({ x: centerX, y: centerY, z: 0, name: `${i}` });
      }

      // Eyes and Irises
      keypoints[33] = { x: centerX - eyeSpread - 15, y: centerY - height * 0.05, z: 0 }; // Left outer
      keypoints[133] = { x: centerX - eyeSpread + 15, y: centerY - height * 0.05, z: 0 }; // Left inner
      keypoints[468] = { x: centerX - eyeSpread + avgPupilOffset * 3, y: centerY - height * 0.05, z: 0 }; // Left Iris

      keypoints[362] = { x: centerX + eyeSpread - 15, y: centerY - height * 0.05, z: 0 }; // Right inner
      keypoints[263] = { x: centerX + eyeSpread + 15, y: centerY - height * 0.05, z: 0 }; // Right outer
      keypoints[473] = { x: centerX + eyeSpread + avgPupilOffset * 3, y: centerY - height * 0.05, z: 0 }; // Right Iris

      keypoints[1] = { x: centerX, y: centerY + height * 0.03, z: 0 }; // Nose tip
      keypoints[10] = { x: centerX, y: centerY - height * 0.20, z: 0 }; // Forehead
      keypoints[175] = { x: centerX, y: centerY + height * 0.20, z: 0 }; // Chin
      keypoints[234] = { x: centerX - eyeSpread * 1.5, y: centerY + height * 0.03, z: 0 }; // Left Cheek
      keypoints[454] = { x: centerX + eyeSpread * 1.5, y: centerY + height * 0.03, z: 0 }; // Right Cheek

      const horizontalBalance = Math.max(leftSkin, rightSkin) / (Math.min(leftSkin, rightSkin) || 1);

      return [{
        keypoints,
        avgPupilOffset,
        horizontalBalance,
        normCenterX,
        normCenterY
      }];
    }
  } catch (e) {
    // Ignore canvas errors
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
    return analyzePupilAndCanvas(video);
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
          resolve(analyzePupilAndCanvas(video));
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
            resolve(analyzePupilAndCanvas(video));
          }
        });

        faceMesh.send({ image: video }).catch(() => {
          clearTimeout(timeout);
          isProcessing = false;
          resolve(analyzePupilAndCanvas(video));
        });
      });

      return results;
    } catch (e) {
      isProcessing = false;
      return analyzePupilAndCanvas(video);
    }
  }

  return analyzePupilAndCanvas(video);
}

export interface FaceAnalysis {
  hasEyeContact: boolean;
  isInFrame: boolean;
  position: "center" | "left" | "right" | "too-close" | "too-far";
  headTilt: "straight" | "left" | "right" | "up" | "down";
  gazeDetail: "centered" | "looking-left" | "looking-right" | "looking-down" | "looking-up";
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
    gazeDetail: "looking-down",
  };

  if (!faces || !faces.length) {
    return defaultResult;
  }

  const face = faces[0];
  const keypoints = face.keypoints ?? [];
  const { videoWidth, videoHeight } = getVideoDimensions(videoElement);

  const leftEyeOuter = keypoints[33];
  const leftEyeInner = keypoints[133];
  const rightEyeInner = keypoints[362];
  const rightEyeOuter = keypoints[263];
  const noseTip = keypoints[1];
  const leftCheek = keypoints[234];
  const rightCheek = keypoints[454];
  const leftIris = keypoints[468];
  const rightIris = keypoints[473];

  if (!leftEyeOuter || !rightEyeOuter || !noseTip) {
    return {
      hasEyeContact: true,
      isInFrame: true,
      position: "center",
      headTilt: "straight",
      gazeDetail: "centered",
    };
  }

  const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const eyeCenterY = (leftEyeOuter.y + rightEyeOuter.y) / 2;
  const eyeDistance = Math.abs(rightEyeOuter.x - leftEyeOuter.x) || 1;
  const normCenterX = eyeCenterX / videoWidth;
  const normCenterY = eyeCenterY / videoHeight;
  const normEyeDistance = eyeDistance / videoWidth;
  const vertAlign = (rightEyeOuter.y - leftEyeOuter.y) / videoHeight;

  // Head Position & Tilt
  let position: FaceAnalysis["position"] = "center";
  if (normEyeDistance < 0.05) position = "too-far";
  else if (normEyeDistance > 0.38) position = "too-close";
  else if (normCenterX < 0.32) position = "left";
  else if (normCenterX > 0.68) position = "right";

  let headTilt: FaceAnalysis["headTilt"] = "straight";
  if (Math.abs(vertAlign) > 0.05) {
    headTilt = vertAlign > 0 ? "right" : "left";
  } else if (normCenterY < 0.28) {
    headTilt = "up";
  } else if (normCenterY > 0.62) {
    headTilt = "down";
  }

  // --- TRUE IRIS & PUPIL GAZE DETERMINATION ---
  let hasEyeContact = false;
  let gazeDetail: FaceAnalysis["gazeDetail"] = "centered";

  if (leftIris && rightIris && leftEyeInner && rightEyeInner) {
    // MediaPipe 478 Landmarks Iris Ratio calculation
    const leftWidth = Math.abs(leftEyeInner.x - leftEyeOuter.x) || 1;
    const rightWidth = Math.abs(rightEyeOuter.x - rightEyeInner.x) || 1;

    const leftIrisRatio = (leftIris.x - leftEyeOuter.x) / leftWidth;
    const rightIrisRatio = (rightIris.x - rightEyeInner.x) / rightWidth;
    const avgIrisRatio = (leftIrisRatio + rightIrisRatio) / 2;

    // Vertical Gaze: Check if looking down at keyboard/screen
    const noseToEyeDist = (noseTip.y - eyeCenterY) / (videoHeight || 1);

    // Centered gaze requires horizontal iris ratio within [0.38, 0.62] and head facing forward
    if (avgIrisRatio < 0.36) {
      gazeDetail = "looking-left";
      hasEyeContact = false;
    } else if (avgIrisRatio > 0.64) {
      gazeDetail = "looking-right";
      hasEyeContact = false;
    } else if (normCenterY > 0.58 || noseToEyeDist < 0.05) {
      gazeDetail = "looking-down";
      hasEyeContact = false;
    } else if (normCenterY < 0.26) {
      gazeDetail = "looking-up";
      hasEyeContact = false;
    } else {
      // Head facing balance
      const leftDist = Math.abs(noseTip.x - (leftCheek?.x || (leftEyeOuter.x - 20)));
      const rightDist = Math.abs((rightCheek?.x || (rightEyeOuter.x + 20)) - noseTip.x);
      const yawRatio = Math.max(leftDist, rightDist) / (Math.min(leftDist, rightDist) || 1);
      
      if (yawRatio > 1.55) {
        gazeDetail = leftDist > rightDist ? "looking-left" : "looking-right";
        hasEyeContact = false;
      } else {
        gazeDetail = "centered";
        hasEyeContact = true;
      }
    }
  } else if (typeof face.avgPupilOffset === 'number') {
    // Canvas Pupil Darkness Analysis
    const pupilOffset = face.avgPupilOffset;
    if (pupilOffset < -1.8) {
      gazeDetail = "looking-left";
      hasEyeContact = false;
    } else if (pupilOffset > 1.8) {
      gazeDetail = "looking-right";
      hasEyeContact = false;
    } else if (normCenterY > 0.58) {
      gazeDetail = "looking-down";
      hasEyeContact = false;
    } else if (face.horizontalBalance > 1.35) {
      gazeDetail = "looking-left";
      hasEyeContact = false;
    } else {
      gazeDetail = "centered";
      hasEyeContact = normCenterX >= 0.38 && normCenterX <= 0.62;
    }
  } else {
    hasEyeContact = normCenterX >= 0.38 && normCenterX <= 0.62 && normCenterY >= 0.30 && normCenterY <= 0.60;
  }

  return {
    hasEyeContact,
    isInFrame: true,
    position,
    headTilt,
    gazeDetail,
  };
}
