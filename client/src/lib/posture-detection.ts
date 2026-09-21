// client/src/lib/posture-detection.ts
import { detectFaces } from "./face-detection";

export interface PostureAnalysis {
  posture: "good" | "slouching" | "leaning" | "unknown";
  confidence: number;
  details: {
    shoulderAlignment: "aligned" | "misaligned";
    backStraight: boolean;
    headPosition: "forward" | "tilted" | "backward";
  };
  improvements: string[];
}

export async function loadPostureDetector() {
  return Promise.resolve();
}

export function getPostureColor(posture: string): string {
  switch (posture) {
    case "good":
      return "text-green-600";
    case "slouching":
      return "text-amber-500";
    case "leaning":
      return "text-orange-500";
    default:
      return "text-muted-foreground";
  }
}

export async function analyzePosture(videoElement: HTMLVideoElement, existingFaces?: any[]): Promise<PostureAnalysis> {
  const videoWidth = videoElement?.videoWidth || videoElement?.clientWidth || 640;
  const videoHeight = videoElement?.videoHeight || videoElement?.clientHeight || 480;

  if (!videoElement || videoElement.readyState < 2) {
    return {
      posture: "unknown",
      confidence: 0,
      details: { shoulderAlignment: "misaligned", backStraight: false, headPosition: "forward" },
      improvements: ["Waiting for camera feed"],
    };
  }

  const faces = existingFaces && existingFaces.length > 0 ? existingFaces : await detectFaces(videoElement);

  if (!faces || !faces.length) {
    return {
      posture: "unknown",
      confidence: 0,
      details: {
        shoulderAlignment: "misaligned",
        backStraight: false,
        headPosition: "forward",
      },
      improvements: ["Position yourself in front of the camera"],
    };
  }

  const face = faces[0];
  const keypoints = face.keypoints ?? [];

  const leftEye = keypoints[33];
  const rightEye = keypoints[263];
  const noseTip = keypoints[1];
  const chin = keypoints[175];
  const forehead = keypoints[10];
  const leftCheek = keypoints[234];
  const rightCheek = keypoints[454];

  if (!leftEye || !rightEye || !noseTip) {
    return {
      posture: "unknown",
      confidence: 0,
      details: { shoulderAlignment: "misaligned", backStraight: false, headPosition: "forward" },
      improvements: ["Ensure adequate room lighting"],
    };
  }

  const eyeCenterX = (leftEye.x + rightEye.x) / 2;
  const eyeCenterY = (leftEye.y + rightEye.y) / 2;
  const normCenterX = eyeCenterX / videoWidth;
  const normCenterY = eyeCenterY / videoHeight;

  // 1. Lateral Head Tilt (Roll angle theta)
  const dy = rightEye.y - leftEye.y;
  const dx = Math.abs(rightEye.x - leftEye.x) || 1;
  const rollDegrees = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
  const isLateralTilted = rollDegrees > 8.0;

  // 2. Vertical Sinking / Slouch in Frame (Calibrated for laptop webcams)
  const isSlouchedDown = normCenterY > 0.52;
  const isSeverelySlouched = normCenterY > 0.64;
  const isTooHigh = normCenterY < 0.18;

  // 3. Head Pitch & Chin Elevation
  const faceHeight = Math.abs((forehead?.y || (eyeCenterY - 40)) - (chin?.y || (eyeCenterY + 50))) || 90;
  const noseToChin = Math.abs((chin?.y || (eyeCenterY + 50)) - noseTip.y) / faceHeight;
  const isChinDown = noseToChin < 0.26 && normCenterY > 0.46;

  // 4. Horizontal Centering Symmetry
  const leftDist = Math.abs(noseTip.x - (leftCheek?.x || (leftEye.x - 25)));
  const rightDist = Math.abs((rightCheek?.x || (rightEye.x + 25)) - noseTip.x);
  const yawRatio = Math.max(leftDist, rightDist) / (Math.min(leftDist, rightDist) || 1);
  const isLeaningSide = yawRatio > 1.45 || Math.abs(normCenterX - 0.5) > 0.22;

  let posture: PostureAnalysis["posture"] = "good";
  let confidence = 90;
  const improvements: string[] = [];

  if (isSeverelySlouched) {
    posture = "slouching";
    confidence = Math.max(15, Math.round(45 - (normCenterY - 0.64) * 120));
    improvements.push("Sit upright and center yourself within the webcam frame");
  } else if (isSlouchedDown || isChinDown) {
    posture = "slouching";
    const dropAmount = Math.max(0, (normCenterY - 0.52) * 120);
    confidence = Math.max(30, Math.round(62 - dropAmount));
    improvements.push("Elevate chin and straighten your back");
  } else if (isLateralTilted || isLeaningSide) {
    posture = "leaning";
    const tiltPenalty = Math.max(0, (rollDegrees - 7) * 4);
    confidence = Math.max(35, Math.round(70 - tiltPenalty));
    improvements.push("Level your head and square your shoulders with the camera");
  } else if (isTooHigh) {
    confidence = 68;
    improvements.push("Adjust camera angle or step back slightly for balanced framing");
  } else {
    // Dynamic score based on micro-alignment
    const alignmentBonus = Math.max(0, 8 - Math.round(rollDegrees * 0.8));
    confidence = Math.min(98, 88 + alignmentBonus);
    improvements.push("Upright, professional posture maintained");
  }

  const shoulderAlignment = isLateralTilted ? "misaligned" : "aligned";
  const backStraight = posture === "good";
  const headPosition = isChinDown ? "tilted" : "forward";

  return {
    posture,
    confidence: Math.max(10, Math.min(100, confidence)),
    details: {
      shoulderAlignment,
      backStraight,
      headPosition,
    },
    improvements,
  };
}
