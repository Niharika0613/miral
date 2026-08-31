// client/src/components/AudioStreamDemo.tsx
import { useState } from 'react';
import { useAudioStream } from '@/hooks/useAudioStream';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

export function AudioStreamDemo() {
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const { isRecording, transcript, metrics, startRecording, stopRecording } = useAudioStream({
    onFinalTranscript: async (text) => {
      console.log('📝 Final transcript:', text);
      
      // Call AI for feedback
      if (text && text.length > 10) {
        await generateAIFeedback(text);
      }
    },
    onPartialTranscript: (text) => {
      console.log('📝 Partial transcript:', text);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
    },
    onMetrics: (m) => {
      console.log('📊 Metrics:', m);
    },
  });

  const generateAIFeedback = async (text: string) => {
    try {
      setIsLoadingAI(true);
      const response = await fetch('http://localhost:8000/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma:2b',
          prompt: `Provide brief feedback on this speech: "${text}". Focus on: 1) Clarity, 2) Pacing, 3) Confidence. Keep response under 100 words.`,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setAiResponse(data.text);
      } else if (data.error) {
        setAiResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ AI error:', error);
      setAiResponse(`Error: ${String(error)}`);
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold">🎤 Audio Stream Demo</h2>

      {/* Recording Controls */}
      <div className="flex gap-4">
        <Button
          onClick={startRecording}
          disabled={isRecording}
          className="flex items-center gap-2"
        >
          <Mic size={20} />
          Start Recording
        </Button>

        <Button
          onClick={stopRecording}
          disabled={!isRecording}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <MicOff size={20} />
          Stop Recording
        </Button>
      </div>

      {/* Status */}
      <div className="p-4 bg-gray-100 rounded">
        <p className="text-sm font-semibold">Status: {isRecording ? '🔴 Recording' : '⚫ Stopped'}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-xs text-gray-600">Audio Level</p>
          <p className="text-2xl font-bold">{metrics.audioLevel}%</p>
        </div>
        <div className="p-4 bg-green-50 rounded">
          <p className="text-xs text-gray-600">Duration</p>
          <p className="text-2xl font-bold">{metrics.duration}s</p>
        </div>
        <div className="p-4 bg-purple-50 rounded">
          <p className="text-xs text-gray-600">Frequency</p>
          <p className="text-2xl font-bold">{metrics.frequency} Hz</p>
        </div>
      </div>

      {/* Transcript */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">📝 Live Transcript:</label>
        <div className="p-4 bg-gray-50 rounded min-h-24 border border-gray-200">
          <p className="text-gray-700">{transcript || '(waiting for speech...)'}</p>
        </div>
      </div>

      {/* AI Feedback */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">🤖 AI Feedback:</label>
        <div className="p-4 bg-amber-50 rounded min-h-24 border border-amber-200">
          {isLoadingAI ? (
            <p className="text-amber-600">⏳ Generating feedback...</p>
          ) : (
            <p className="text-gray-700">{aiResponse || '(feedback will appear here)'}</p>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <details className="text-xs text-gray-500">
        <summary>Debug Info</summary>
        <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
          {JSON.stringify(
            {
              isRecording,
              transcriptLength: transcript.length,
              metrics,
              aiResponseLength: aiResponse.length,
            },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
}
