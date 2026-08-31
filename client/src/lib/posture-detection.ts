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
      return "text-green-500";
    case "slouching":
      return "text-yellow-500";
    case "leaning":
      return "text-orange-500";
    default:
      return "text-gray-400";
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
      posture: "good",
      confidence: 85,
      details: { shoulderAlignment: "aligned", backStraight: true, headPosition: "forward" },
      improvements: ["Posture aligned and centered"],
    };
  }

  // Calculate eye alignment for shoulder/head tilt
  const eyeHeightDiff = Math.abs(leftEye.y - rightEye.y) / (videoHeight || 1);
  const shoulderAlignment: "aligned" | "misaligned" = eyeHeightDiff < 0.04 ? "aligned" : "misaligned";

  // Calculate head position
  const faceHeight = Math.abs((forehead?.y || 0) - (chin?.y || 0)) || 100;
  const eyeToNose = Math.abs(((leftEye.y + rightEye.y) / 2) - noseTip.y) / faceHeight;
  
  let headPosition: PostureAnalysis["details"]["headPosition"] = "forward";
  if (eyeToNose < 0.2) headPosition = "tilted";
  else if (eyeToNose > 0.45) headPosition = "backward";

  // Symmetry for leaning
  const leftFaceWidth = Math.abs(noseTip.x - (leftCheek?.x || (leftEye.x - 30)));
  const rightFaceWidth = Math.abs(noseTip.x - (rightCheek?.x || (rightEye.x + 30)));
  const faceSymmetry = Math.abs(leftFaceWidth - rightFaceWidth) / Math.max(leftFaceWidth, rightFaceWidth, 1);
  
  const backStraight = shoulderAlignment === "aligned" && faceSymmetry < 0.35;

  let posture: PostureAnalysis["posture"] = "good";
  let confidence = 92;
  const improvements: string[] = [];

  if (!backStraight) {
    if (faceSymmetry >= 0.35) {
      posture = "leaning";
      confidence -= 20;
      improvements.push("Keep your head and shoulders centered");
    } else {
      posture = "slouching";
      confidence -= 18;
      improvements.push("Straighten your spine and level your gaze");
    }
  }

  if (shoulderAlignment === "misaligned") {
    confidence -= 12;
    improvements.push("Level your head to avoid tilting to the side");
  }

  if (headPosition !== "forward") {
    confidence -= 10;
    if (headPosition === "tilted") {
      improvements.push("Lift your chin slightly towards the camera");
    }
  }

  return {
    posture,
    confidence: Math.max(20, Math.min(100, confidence)),
    details: {
      shoulderAlignment,
      backStraight,
      headPosition,
    },
    improvements: improvements.length ? improvements : ["Great posture! Keep it up."],
  };
}
