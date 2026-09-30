// client/src/hooks/use-audio-recorder.ts
import { useState, useRef } from 'react';

const getSupportedAudioMimeType = (): string => {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/wav'
  ];
  for (const mime of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    } catch {
      // Ignore and test next
    }
  }
  return '';
};

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('audio/webm');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const supportedMime = getSupportedAudioMimeType();
      mimeTypeRef.current = supportedMime || 'audio/webm';

      const options: MediaRecorderOptions = {};
      if (supportedMime) {
        options.mimeType = supportedMime;
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  };

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        const fallbackBlob = new Blob(chunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });
        setIsRecording(false);
        resolve(fallbackBlob);
        return;
      }

      mediaRecorder.onstop = () => {
        const recordedType = mediaRecorder.mimeType || mimeTypeRef.current || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: recordedType });
        try {
          mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        } catch {}
        setIsRecording(false);
        resolve(audioBlob);
      };

      try {
        mediaRecorder.stop();
      } catch {
        const audioBlob = new Blob(chunksRef.current, { type: mimeTypeRef.current || 'audio/webm' });
        setIsRecording(false);
        resolve(audioBlob);
      }
    });
  };

  return { isRecording, startRecording, stopRecording };
}
