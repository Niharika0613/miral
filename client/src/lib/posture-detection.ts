let postureMesh: any = null;
let isPostureProcessing = false;

const getVideoDimensions = (video?: HTMLVideoElement) => {
  const videoWidth = video?.videoWidth || video?.clientWidth || 1;
  const videoHeight = video?.videoHeight || video?.clientHeight || 1;
  return { videoWidth, videoHeight };
};

export async function loadPostureDetector() {
  console.log('✅ Posture detector ready (shares face detector)');
}

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

export async function analyzePosture(videoElement: HTMLVideoElement): Promise<PostureAnalysis> {
  if (isPostureProcessing) {
    return {
      posture: "unknown",
      confidence: 0,
      details: { shoulderAlignment: "misaligned", backStraight: false, headPosition: "forward" },
      improvements: ["Processing..."],
    };
  }

  const videoWidth = videoElement.videoWidth || videoElement.clientWidth;
  const videoHeight = videoElement.videoHeight || videoElement.clientHeight;
  
  if (!videoWidth || !videoHeight || videoElement.readyState < 2) {
    return {
      posture: "unknown",
      confidence: 0,
      details: { shoulderAlignment: "misaligned", backStraight: false, headPosition: "forward" },
      improvements: ["Video not ready"],
    };
  }

  if (!postureMesh && typeof (window as any).FaceMesh !== 'undefined') {
    postureMesh = new (window as any).FaceMesh({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`
    });
    
    postureMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
  }

  if (!postureMesh) {
    return {
      posture: "unknown",
      confidence: 0,
      details: { shoulderAlignment: "misaligned", backStraight: false, headPosition: "forward" },
      improvements: ["Detector not ready"],
    };
  }

  try {
    isPostureProcessing = true;
    
    return new Promise((resolve) => {
      postureMesh.onResults((results: any) => {
        isPostureProcessing = false;
        
        const faces = results.multiFaceLandmarks?.map((landmarks: any) => ({
          keypoints: landmarks.map((lm: any) => ({
            x: lm.x * videoWidth,
            y: lm.y * videoHeight,
            z: lm.z
          }))
        })) || [];
        
        resolve(analyzePostureFromFaces(faces, videoElement));
      });
      
      postureMesh.send({ image: videoElement }).catch(() => {
        isPostureProcessing = false;
        resolve({
          posture: "unknown",
          confidence: 0,
          details: { shoulderAlignment: "misaligned", backStraight: false, headPosition: "forward" },
          improvements: ["Detection failed"],
        });
      });
    });
  } catch (error) {
    isPostureProcessing = false;
    console.error("Posture analysis error:", error);
    return {
      posture: "unknown",
      confidence: 0,
      details: { shoulderAlignment: "misaligned", backStraight: false, headPosition: "forward" },
      improvements: ["Error occurred"],
    };
  }
}

function analyzePostureFromFaces(faces: any[], videoElement: HTMLVideoElement): PostureAnalysis {
  const { videoWidth, videoHeight } = getVideoDimensions(videoElement);

  if (!faces || !faces.length) {
    return {
      posture: "unknown",
      confidence: 0,
      details: {
        shoulderAlignment: "misaligned",
        backStraight: false,
        headPosition: "forward",
      },
      improvements: ["Move into camera view"],
    };
  }

  const face = faces[0];
  const keypoints = face.keypoints ?? [];

  try {
    // MediaPipe face landmarks for head posture
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    const noseTip = keypoints[1];
    const chin = keypoints[175];
    const forehead = keypoints[10];
    const leftCheek = keypoints[234];
    const rightCheek = keypoints[454];

    if (!leftEye || !rightEye || !noseTip || !chin) {
      return {
        posture: "unknown",
        confidence: 0,
        details: {
          shoulderAlignment: "misaligned",
          backStraight: false,
          headPosition: "forward",
        },
        improvements: ["Face not clearly visible"],
      };
    }

    // Calculate head tilt based on eye alignment
    const eyeHeightDiff = Math.abs(leftEye.y - rightEye.y) / videoHeight;
    const shoulderAlignment: "aligned" | "misaligned" = eyeHeightDiff < 0.03 ? "aligned" : "misaligned";

    // Calculate head position based on face proportions
    const faceHeight = Math.abs(forehead.y - chin.y);
    const eyeToNoseRatio = Math.abs(((leftEye.y + rightEye.y) / 2) - noseTip.y) / faceHeight;
    const noseToChainRatio = Math.abs(noseTip.y - chin.y) / faceHeight;

    let headPosition: PostureAnalysis["details"]["headPosition"] = "forward";
    if (eyeToNoseRatio < 0.25) headPosition = "tilted";
    else if (noseToChainRatio < 0.35) headPosition = "backward";

    // Calculate face width symmetry for leaning detection
    const leftFaceWidth = Math.abs(noseTip.x - leftCheek.x);
    const rightFaceWidth = Math.abs(noseTip.x - rightCheek.x);
    const faceSymmetry = Math.abs(leftFaceWidth - rightFaceWidth) / Math.max(leftFaceWidth, rightFaceWidth);
    
    const backStraight = shoulderAlignment === "aligned" && faceSymmetry < 0.3;

    let posture: PostureAnalysis["posture"] = "good";
    let confidence = 90;
    const improvements: string[] = [];

    if (!backStraight) {
      if (faceSymmetry >= 0.3) {
        posture = "leaning";
        confidence -= 25;
        improvements.push("Keep your head centered and straight");
      } else {
        posture = "slouching";
        confidence -= 20;
        improvements.push("Straighten your posture");
      }
    }

    if (shoulderAlignment === "misaligned") {
      confidence -= 15;
      improvements.push("Level your head - avoid tilting");
    }

    if (headPosition !== "forward") {
      confidence -= 10;
      if (headPosition === "tilted") {
        improvements.push("Lift your head and look forward");
      } else {
        improvements.push("Bring your head to a natural position");
      }
    }

    if (posture === "good" && improvements.length === 0) {
      improvements.push("Excellent head posture!");
    }

    confidence = Math.max(60, Math.min(100, confidence));

    return {
      posture,
      confidence,
      details: {
        shoulderAlignment,
        backStraight,
        headPosition,
      },
      improvements,
    };
  } catch (error) {
    console.error("Error analyzing head posture:", error);
    return {
      posture: "unknown",
      confidence: 0,
      details: {
        shoulderAlignment: "misaligned",
        backStraight: false,
        headPosition: "forward",
      },
      improvements: ["Unable to analyze posture"],
    };
  }
}

export function getPostureColor(posture: string): string {
  switch (posture) {
    case "good":
      return "text-green-600";
    case "slouching":
      return "text-amber-600";
    case "leaning":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
}

