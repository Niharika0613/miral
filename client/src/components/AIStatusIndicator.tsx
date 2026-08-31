// client/src/components/AIStatusIndicator.tsx
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AIStatusIndicatorProps {
  aiStatus: {
    backendConnected: boolean;
    voskAvailable: boolean;
    ollamaAvailable: boolean;
    error: string | null;
  };
}

export function AIStatusIndicator({ aiStatus }: AIStatusIndicatorProps) {
  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const allSystemsGo = aiStatus.backendConnected && aiStatus.voskAvailable && aiStatus.ollamaAvailable;

  return (
    <Card className={`border-2 ${allSystemsGo ? 'border-green-500/20' : 'border-red-500/20'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {allSystemsGo ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
          AI Systems Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs">Backend</span>
          <div className="flex items-center gap-1">
            {getStatusIcon(aiStatus.backendConnected)}
            <Badge variant={aiStatus.backendConnected ? "default" : "destructive"} className="text-xs">
              {aiStatus.backendConnected ? "Connected" : "Offline"}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">Speech Recognition</span>
          <div className="flex items-center gap-1">
            {getStatusIcon(aiStatus.voskAvailable)}
            <Badge variant={aiStatus.voskAvailable ? "default" : "secondary"} className="text-xs">
              {aiStatus.voskAvailable ? "Ready" : "Unavailable"}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">AI Coach</span>
          <div className="flex items-center gap-1">
            {getStatusIcon(aiStatus.ollamaAvailable)}
            <Badge variant={aiStatus.ollamaAvailable ? "default" : "secondary"} className="text-xs">
              {aiStatus.ollamaAvailable ? "Ready" : "Offline"}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">Computer Vision</span>
          <div className="flex items-center gap-1">
            {getStatusIcon(!aiStatus.error)}
            <Badge variant={!aiStatus.error ? "default" : "secondary"} className="text-xs">
              {!aiStatus.error ? "Ready" : "Loading..."}
            </Badge>
          </div>
        </div>

        {aiStatus.error && (
          <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
            Error: {aiStatus.error}
          </div>
        )}

        {!allSystemsGo && (
          <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
            Some AI features may not work properly. Check backend connection.
          </div>
        )}
      </CardContent>
    </Card>
  );
}