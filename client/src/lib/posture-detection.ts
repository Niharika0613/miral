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
  const isLateralTilted = rollDegrees > 11.0;

  // 2. Vertical Sinking / Slouch in Frame
  const isSlouchedDown = normCenterY > 0.82;
  const isTooHigh = normCenterY < 0.15;

  // 3. Head Pitch & Chin Elevation
  const faceHeight = Math.abs((forehead?.y || (eyeCenterY - 40)) - (chin?.y || (eyeCenterY + 50))) || 90;
  const noseToChin = Math.abs((chin?.y || (eyeCenterY + 50)) - noseTip.y) / faceHeight;
  const isChinDown = noseToChin < 0.20 && normCenterY > 0.78;

  // 4. Horizontal Centering Symmetry
  const leftDist = Math.abs(noseTip.x - (leftCheek?.x || (leftEye.x - 25)));
  const rightDist = Math.abs((rightCheek?.x || (rightEye.x + 25)) - noseTip.x);
  const yawRatio = Math.max(leftDist, rightDist) / (Math.min(leftDist, rightDist) || 1);
  const isLeaningSide = yawRatio > 1.95 || Math.abs(normCenterX - 0.5) > 0.32;

  let posture: PostureAnalysis["posture"] = "good";
  let confidence = 88;
  const improvements: string[] = [];

  if (isSlouchedDown || isChinDown) {
    posture = "slouching";
    confidence = Math.max(55, Math.round(75 - (normCenterY - 0.78) * 60));
    improvements.push("Elevate chin and straighten spine");
  } else if (isLateralTilted || isLeaningSide) {
    posture = "leaning";
    confidence = Math.max(58, Math.round(75 - (rollDegrees - 10) * 3));
    improvements.push("Level your head and center your shoulders");
  } else if (isTooHigh) {
    confidence = 78;
    improvements.push("Step back slightly for optimal framing");
  } else {
    // Dynamic score based on micro-alignment
    const alignmentBonus = Math.max(0, 6 - Math.round(rollDegrees * 0.5));
    confidence = Math.min(95, 88 + alignmentBonus);
    improvements.push("Upright and centered posture maintained");
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
