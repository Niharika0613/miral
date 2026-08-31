import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DebugPanelProps {
  faces: any[];
  eyeContact: boolean;
  isInFrame: boolean;
  posture: string;
  postureScore: number;
  videoReady: boolean;
}

export function DebugPanel({ faces, eyeContact, isInFrame, posture, postureScore, videoReady }: DebugPanelProps) {
  return (
    <Card className="border-2 border-red-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-1">
        <div>Video Ready: {videoReady ? '✅' : '❌'}</div>
        <div>Faces Detected: {faces.length}</div>
        <div>Keypoints: {faces[0]?.keypoints?.length || 0}</div>
        <div>Eye Contact: {eyeContact ? '✅' : '❌'}</div>
        <div>In Frame: {isInFrame ? '✅' : '❌'}</div>
        <div>Posture: {posture} ({postureScore}%)</div>
      </CardContent>
    </Card>
  );
}
