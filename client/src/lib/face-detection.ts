declare global {
  interface Window {
    FaceMesh: any;
  }
}

let faceMesh: any = null;
let isProcessing = false;

const getVideoDimensions = (video?: HTMLVideoElement) => {
  const videoWidth = video?.videoWidth || video?.clientWidth || 1;
  const videoHeight = video?.videoHeight || video?.clientHeight || 1;
  return { videoWidth, videoHeight };
};

export async function loadFaceDetector() {
  if (faceMesh) return faceMesh;

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="face_mesh.js"]');
    
    if (existingScript && typeof window.FaceMesh !== 'undefined') {
      console.log('✅ MediaPipe already loaded');
      resolve(faceMesh);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.js';
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('✅ MediaPipe FaceMesh script loaded');
      setTimeout(() => {
        if (typeof window.FaceMesh !== 'undefined') {
          console.log('✅ FaceMesh constructor available');
          resolve(faceMesh);
        } else {
          reject(new Error('FaceMesh not available'));
        }
      }, 100);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load MediaPipe');
      reject(new Error('Failed to load MediaPipe'));
    };
    
    document.head.appendChild(script);
  });
}

export async function detectFaces(video: HTMLVideoElement) {
  if (!video || video.readyState < 2 || isProcessing) {
    return [];
  }

  const videoWidth = video.videoWidth || video.clientWidth;
  const videoHeight = video.videoHeight || video.clientHeight;
  if (!videoWidth || !videoHeight) {
    return [];
  }

  if (!faceMesh && typeof window.FaceMesh !== 'undefined') {
    faceMesh = new window.FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
    });
    
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    console.log('✅ FaceMesh initialized');
  }

  if (!faceMesh) {
    return [];
  }

  try {
    isProcessing = true;
    
    return new Promise((resolve) => {
      faceMesh.onResults((results: any) => {
        isProcessing = false;
        
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const faces = results.multiFaceLandmarks.map((landmarks: any) => ({
            keypoints: landmarks.map((lm: any, idx: number) => ({
              x: lm.x * videoWidth,
              y: lm.y * videoHeight,
              z: lm.z,
              name: `${idx}`
            }))
          }));
          resolve(faces);
        } else {
          resolve([]);
        }
      });
      
      faceMesh.send({ image: video }).catch(() => {
        isProcessing = false;
        resolve([]);
      });
    });
  } catch (error) {
    isProcessing = false;
    console.error('Face detection error:', error);
    return [];
  }
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

  // MediaPipe face mesh landmarks - more precise indices
  const leftEyeCenter = keypoints[33]; // Left eye center
  const rightEyeCenter = keypoints[263]; // Right eye center
  const noseTip = keypoints[1]; // Nose tip
  const leftEyeOuter = keypoints[130];
  const rightEyeOuter = keypoints[359];

  if (!leftEyeCenter || !rightEyeCenter || !noseTip) {
    return defaultResult;
  }

  const eyeCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
  const eyeCenterY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
  const eyeDistance = Math.abs(rightEyeCenter.x - leftEyeCenter.x);
  const normalizedEyeCenterX = eyeCenterX / videoWidth;
  const normalizedEyeDistance = eyeDistance / videoWidth;
  const normalizedVerticalAlignment = Math.abs(rightEyeCenter.y - leftEyeCenter.y) / videoHeight;

  // Improved position detection
  let position: FaceAnalysis["position"] = "center";
  if (normalizedEyeDistance < 0.08) position = "too-far";
  else if (normalizedEyeDistance > 0.3) position = "too-close";
  else if (normalizedEyeCenterX < 0.35) position = "left";
  else if (normalizedEyeCenterX > 0.65) position = "right";

  // Better head tilt detection
  let headTilt: FaceAnalysis["headTilt"] = "straight";
  if (normalizedVerticalAlignment > 0.04) {
    headTilt = rightEyeCenter.y > leftEyeCenter.y ? "right" : "left";
  }

  // Eye contact detection based on nose-eye alignment
  const noseEyeDistance = Math.abs(noseTip.x - eyeCenterX) / eyeDistance;
  const verticalGaze = (eyeCenterY - noseTip.y) / videoHeight;
  
  if (verticalGaze < -0.1) headTilt = "up";
  else if (verticalGaze > 0.1) headTilt = "down";

  // Good eye contact when looking straight at camera
  const hasEyeContact = noseEyeDistance < 0.4 && Math.abs(verticalGaze) < 0.15;

  return {
    hasEyeContact,
    isInFrame: true,
    position,
    headTilt,
  };
}

