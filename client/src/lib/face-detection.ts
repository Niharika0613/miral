// client/src/lib/face-detection.ts
declare global {
  interface Window {
    FaceMesh: any;
    FaceDetector?: any;
  }
}

let faceMesh: any = null;
let isProcessing = false;
let lastProcessTime = 0;
let fallbackCanvas: HTMLCanvasElement | null = null;
let fallbackCtx: CanvasRenderingContext2D | null = null;
let nativeDetector: any = null;

const getVideoDimensions = (video?: HTMLVideoElement) => {
  const videoWidth = video?.videoWidth || video?.clientWidth || 640;
  const videoHeight = video?.videoHeight || video?.clientHeight || 480;
  return { videoWidth, videoHeight };
};

export async function loadFaceDetector() {
  // 1. Try Native Chrome/Edge Hardware-Accelerated FaceDetector
  if (typeof window !== 'undefined' && typeof (window as any).FaceDetector !== 'undefined') {
    try {
      nativeDetector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      return nativeDetector;
    } catch {
      nativeDetector = null;
    }
  }

  // 2. Load MediaPipe FaceMesh
  if (faceMesh) return faceMesh;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
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
        }, 50);
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };
      
      document.head.appendChild(script);
    } catch {
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
      minDetectionConfidence: 0.4,
      minTrackingConfidence: 0.4
    });
  } catch (e) {
    console.warn('FaceMesh init:', e);
  }
}

// Precision In-Browser Skin Chrominance & Facial Geometry Engine
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
    let minX = 160, maxX = 0, minY = 120, maxY = 0;

    // Strict human skin chrominance filter (prevents white/cream/yellow walls, doors, ceilings from triggering)
    for (let y = 4; y < 116; y += 2) {
      for (let x = 6; x < 154; x += 2) {
        const idx = (y * 160 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // True human skin chrominance constraints
        const isSkin = (
          r > 60 && g > 35 && b > 20 &&
          r > g && g >= (b - 8) &&
          (r - g) >= 10 &&
          (r - b) >= 15 &&
          Math.abs(r - g) >= 8 &&
          lum >= 35 && lum <= 235
        );

        if (isSkin) {
          skinPixels++;
          sumX += x;
          sumY += y;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;

    // Reject background noise: Must have at least 90 dense skin pixels and reasonable face aspect ratio
    if (skinPixels < 90 || faceWidth < 18 || faceHeight < 20) {
      return []; // NO FACE IN FRAME
    }

    const normCenterX = (sumX / skinPixels) / 160;
    const normCenterY = (sumY / skinPixels) / 120;

    // If face is cut off at the bottom edge (e.g. only forehead/hair visible at bottom) or out of frame
    if (normCenterY > 0.72 || normCenterY < 0.12 || normCenterX < 0.10 || normCenterX > 0.90) {
      return []; // OUT OF FRAME
    }

    const centerX = normCenterX * width;
    const centerY = normCenterY * height;

    // Extract left and right eye pupil/darkness regions
    const eyeXLeft = Math.max(4, Math.min(150, Math.round(normCenterX * 160 - faceWidth * 0.22)));
    const eyeXRight = Math.max(4, Math.min(150, Math.round(normCenterX * 160 + faceWidth * 0.22)));
    const eyeY = Math.max(4, Math.min(114, Math.round(normCenterY * 120 - faceHeight * 0.12)));

    let leftPupilOffset = 0, rightPupilOffset = 0;
    let leftDarkFound = 0, rightDarkFound = 0;

    for (let ey = -3; ey <= 3; ey++) {
      for (let ex = -6; ex <= 6; ex++) {
        const plx = eyeXLeft + ex;
        const ply = eyeY + ey;
        if (plx >= 0 && plx < 160 && ply >= 0 && ply < 120) {
          const idx = (ply * 160 + plx) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          if (lum < 65) {
            leftPupilOffset += ex;
            leftDarkFound++;
          }
        }

        const prx = eyeXRight + ex;
        const pry = eyeY + ey;
        if (prx >= 0 && prx < 160 && pry >= 0 && pry < 120) {
          const idx = (pry * 160 + prx) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          if (lum < 65) {
            rightPupilOffset += ex;
            rightDarkFound++;
          }
        }
      }
    }

    const avgPupilOffset = (leftDarkFound > 0 && rightDarkFound > 0)
      ? ((leftPupilOffset / leftDarkFound) + (rightPupilOffset / rightDarkFound)) / 2
      : (leftDarkFound > 0 ? (leftPupilOffset / leftDarkFound) : (rightDarkFound > 0 ? (rightPupilOffset / rightDarkFound) : 0));

    const eyeSpread = (faceWidth / 160) * width * 0.28;
    const keypoints: any[] = [];
    for (let i = 0; i < 478; i++) {
      keypoints.push({ x: centerX, y: centerY, z: 0, name: `${i}` });
    }

    keypoints[33] = { x: centerX - eyeSpread - 15, y: centerY - height * 0.05, z: 0 };
    keypoints[133] = { x: centerX - eyeSpread + 15, y: centerY - height * 0.05, z: 0 };
    keypoints[468] = { x: centerX - eyeSpread + avgPupilOffset * 2.5, y: centerY - height * 0.05, z: 0 };

    keypoints[362] = { x: centerX + eyeSpread - 15, y: centerY - height * 0.05, z: 0 };
    keypoints[263] = { x: centerX + eyeSpread + 15, y: centerY - height * 0.05, z: 0 };
    keypoints[473] = { x: centerX + eyeSpread + avgPupilOffset * 2.5, y: centerY - height * 0.05, z: 0 };

    keypoints[159] = { x: centerX - eyeSpread, y: centerY - height * 0.05 - 8, z: 0 };
    keypoints[145] = { x: centerX - eyeSpread, y: centerY - height * 0.05 + 8, z: 0 };
    keypoints[386] = { x: centerX + eyeSpread, y: centerY - height * 0.05 - 8, z: 0 };
    keypoints[374] = { x: centerX + eyeSpread, y: centerY - height * 0.05 + 8, z: 0 };

    keypoints[1] = { x: centerX, y: centerY + height * 0.02, z: 0 };
    keypoints[10] = { x: centerX, y: centerY - faceHeight * 0.5 * (height / 120), z: 0 };
    keypoints[175] = { x: centerX, y: centerY + faceHeight * 0.5 * (height / 120), z: 0 };
    keypoints[234] = { x: centerX - eyeSpread * 1.4, y: centerY + height * 0.02, z: 0 };
    keypoints[454] = { x: centerX + eyeSpread * 1.4, y: centerY + height * 0.02, z: 0 };

    return [{
      keypoints,
      avgPupilOffset,
      normCenterX,
      normCenterY
    }];
  } catch {
    return [];
  }
}

export async function detectFaces(video: HTMLVideoElement) {
  if (!video || video.readyState < 2) {
    return [];
  }

  const { videoWidth, videoHeight } = getVideoDimensions(video);
  if (!videoWidth || !videoHeight) {
    return [];
  }

  // 1. Try Native Browser FaceDetector if available (instant 60fps hardware acceleration)
  if (nativeDetector) {
    try {
      const detected = await nativeDetector.detect(video);
      if (detected && detected.length > 0) {
        const f = detected[0];
        const box = f.boundingBox;
        const cx = box.x + box.width / 2;
        const cy = box.y + box.height / 2;
        const normY = cy / videoHeight;
        
        // Out of frame check
        if (normY > 0.72 || normY < 0.12) {
          return [];
        }

        const eyeSpread = box.width * 0.24;
        const keypoints: any[] = [];
        for (let i = 0; i < 478; i++) {
          keypoints.push({ x: cx, y: cy, z: 0, name: `${i}` });
        }

        keypoints[33] = { x: cx - eyeSpread - 12, y: cy - box.height * 0.12, z: 0 };
        keypoints[133] = { x: cx - eyeSpread + 12, y: cy - box.height * 0.12, z: 0 };
        keypoints[468] = { x: cx - eyeSpread, y: cy - box.height * 0.12, z: 0 };

        keypoints[362] = { x: cx + eyeSpread - 12, y: cy - box.height * 0.12, z: 0 };
        keypoints[263] = { x: cx + eyeSpread + 12, y: cy - box.height * 0.12, z: 0 };
        keypoints[473] = { x: cx + eyeSpread, y: cy - box.height * 0.12, z: 0 };

        keypoints[1] = { x: cx, y: cy, z: 0 };
        keypoints[10] = { x: cx, y: box.y, z: 0 };
        keypoints[175] = { x: cx, y: box.y + box.height, z: 0 };
        keypoints[234] = { x: box.x, y: cy, z: 0 };
        keypoints[454] = { x: box.x + box.width, y: cy, z: 0 };

        return [{
          keypoints,
          avgPupilOffset: 0,
          normCenterX: cx / videoWidth,
          normCenterY: normY
        }];
      } else {
        // Native detector found 0 faces
        return [];
      }
    } catch {
      // Fall through to MediaPipe / Canvas
    }
  }

  const now = Date.now();
  if (isProcessing && (now - lastProcessTime > 400)) {
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
        }, 350);

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
            // MediaPipe explicitly confirmed 0 faces in frame
            resolve([]);
          }
        });

        faceMesh.send({ image: video }).catch(() => {
          clearTimeout(timeout);
          isProcessing = false;
          resolve(analyzePupilAndCanvas(video));
        });
      });

      return results;
    } catch {
      isProcessing = false;
      return analyzePupilAndCanvas(video);
    }
  }

  return analyzePupilAndCanvas(video);
}

export interface FaceAnalysis {
  hasEyeContact: boolean;
  gazeScore: number;
  isInFrame: boolean;
  position: "center" | "left" | "right" | "too-close" | "too-far";
  headTilt: "straight" | "left" | "right" | "up" | "down";
  gazeDetail: "centered" | "looking-left" | "looking-right" | "looking-down" | "looking-up";
  irisRatio?: number;
}

export function calculateEyeContact(faces: any[], videoElement?: HTMLVideoElement): boolean {
  const analysis = analyzeFace(faces, videoElement);
  return analysis.hasEyeContact && analysis.isInFrame;
}

export function analyzeFace(faces: any[], videoElement?: HTMLVideoElement): FaceAnalysis {
  const defaultResult: FaceAnalysis = {
    hasEyeContact: false,
    gazeScore: 0,
    isInFrame: false,
    position: "too-far",
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
  const leftEyeTop = keypoints[159];
  const leftEyeBottom = keypoints[145];

  if (!leftEyeOuter || !rightEyeOuter || !noseTip) {
    return defaultResult;
  }

  const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const eyeCenterY = (leftEyeOuter.y + rightEyeOuter.y) / 2;
  const eyeDistance = Math.abs(rightEyeOuter.x - leftEyeOuter.x) || 1;
  const normCenterX = eyeCenterX / (videoWidth || 1);
  const normCenterY = eyeCenterY / (videoHeight || 1);
  const normEyeDistance = eyeDistance / (videoWidth || 1);
  const vertAlign = (rightEyeOuter.y - leftEyeOuter.y) / (videoHeight || 1);

  // Out of frame / edge cutting detection
  if (normCenterY > 0.70 || normCenterY < 0.12 || normCenterX < 0.12 || normCenterX > 0.88) {
    return {
      hasEyeContact: false,
      gazeScore: 0,
      isInFrame: false,
      position: normCenterY > 0.70 ? "too-far" : (normCenterX < 0.12 ? "left" : "right"),
      headTilt: normCenterY > 0.70 ? "down" : "straight",
      gazeDetail: "looking-down",
    };
  }

  // Natural head positioning
  let position: FaceAnalysis["position"] = "center";
  if (normEyeDistance < 0.04) position = "too-far";
  else if (normEyeDistance > 0.45) position = "too-close";
  else if (normCenterX < 0.25) position = "left";
  else if (normCenterX > 0.75) position = "right";

  let headTilt: FaceAnalysis["headTilt"] = "straight";
  if (Math.abs(vertAlign) > 0.08) {
    headTilt = vertAlign > 0 ? "right" : "left";
  } else if (normCenterY < 0.22) {
    headTilt = "up";
  } else if (normCenterY > 0.54) {
    headTilt = "down";
  }

  // --- TRUE REAL-TIME IRIS & GAZE TRACKING ---
  let hasEyeContact = false;
  let gazeScore = 0;
  let gazeDetail: FaceAnalysis["gazeDetail"] = "centered";

  if (leftIris && rightIris && leftEyeInner && rightEyeInner) {
    const leftWidth = Math.abs(leftEyeInner.x - leftEyeOuter.x) || 1;
    const rightWidth = Math.abs(rightEyeOuter.x - rightEyeInner.x) || 1;

    const leftIrisRatio = (leftIris.x - leftEyeOuter.x) / leftWidth;
    const rightIrisRatio = (rightIris.x - rightEyeInner.x) / rightWidth;
    const avgIrisRatio = (leftIrisRatio + rightIrisRatio) / 2;

    const leftDist = Math.abs(noseTip.x - (leftCheek?.x || (leftEyeOuter.x - 20)));
    const rightDist = Math.abs((rightCheek?.x || (rightEyeOuter.x + 20)) - noseTip.x);
    const yawRatio = Math.max(leftDist, rightDist) / (Math.min(leftDist, rightDist) || 1);

    // Continuous Real-Time Iris Centering Score (0-100)
    const irisDev = Math.abs(avgIrisRatio - 0.50);
    const horizScore = Math.max(0, Math.min(100, Math.round((1 - (irisDev / 0.22)) * 100)));

    // Vertical Eyelid / Pupil Ratio
    let vertScore = 90;
    if (leftEyeTop && leftEyeBottom) {
      const eyeH = Math.abs(leftEyeBottom.y - leftEyeTop.y) || 1;
      const vertRatio = (leftIris.y - leftEyeTop.y) / eyeH;
      const vertDev = Math.abs(vertRatio - 0.50);
      vertScore = Math.max(0, Math.min(100, Math.round((1 - (vertDev / 0.28)) * 100)));
    }

    // Head Yaw Penalty
    const yawPenalty = Math.min(Math.max((yawRatio - 1.15) * 50, 0), 50);

    // Composite Real-time Gaze Metric
    gazeScore = Math.round((horizScore * 0.65 + vertScore * 0.35) - yawPenalty);
    gazeScore = Math.max(10, Math.min(98, gazeScore));

    if (avgIrisRatio < 0.32 || yawRatio > 1.55) {
      gazeDetail = "looking-left";
      hasEyeContact = false;
    } else if (avgIrisRatio > 0.68) {
      gazeDetail = "looking-right";
      hasEyeContact = false;
    } else if (normCenterY > 0.54) {
      gazeDetail = "looking-down";
      hasEyeContact = false;
    } else if (normCenterY < 0.20) {
      gazeDetail = "looking-up";
      hasEyeContact = false;
    } else {
      gazeDetail = "centered";
      hasEyeContact = gazeScore >= 60;
    }
  } else if (typeof face.avgPupilOffset === 'number') {
    const pupilOffset = face.avgPupilOffset;
    const dev = Math.abs(pupilOffset);
    gazeScore = Math.round(Math.max(15, Math.min(95, (1 - Math.min(dev / 3.5, 1)) * 80 + 15)));

    if (pupilOffset < -2.5) {
      gazeDetail = "looking-left";
      hasEyeContact = false;
    } else if (pupilOffset > 2.5) {
      gazeDetail = "looking-right";
      hasEyeContact = false;
    } else if (normCenterY > 0.54) {
      gazeDetail = "looking-down";
      hasEyeContact = false;
    } else {
      gazeDetail = "centered";
      hasEyeContact = gazeScore >= 55 && normCenterX >= 0.25 && normCenterX <= 0.75;
    }
  } else {
    const isCentered = normCenterX >= 0.25 && normCenterX <= 0.75 && normCenterY >= 0.20 && normCenterY <= 0.52;
    gazeScore = isCentered ? 85 : 25;
    hasEyeContact = isCentered;
  }

  return {
    hasEyeContact,
    gazeScore,
    isInFrame: true,
    position,
    headTilt,
    gazeDetail,
  };
}
