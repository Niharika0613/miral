// client/src/hooks/useAudioStream.ts
import { useEffect, useRef, useState } from 'react';

interface AudioStreamOptions {
  onPartialTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onError?: (error: string) => void;
  onMetrics?: (metrics: any) => void;
}

interface AudioMetrics {
  duration: number;
  audioLevel: number;
  frequency: number;
}

export function useAudioStream(options: AudioStreamOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [metrics, setMetrics] = useState<AudioMetrics>({
    duration: 0,
    audioLevel: 0,
    frequency: 0,
  });

  // Helper: Convert Float32 to 16-bit PCM
  const floatTo16BitPCM = (float32Array: Float32Array): Int16Array => {
    const l = float32Array.length;
    const buffer = new ArrayBuffer(l * 2);
    const view = new DataView(buffer);
    let offset = 0;

    for (let i = 0; i < l; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Int16Array(buffer);
  };

  // Helper: Downsample audio
  const downsampleBuffer = (
    buffer: Float32Array,
    sampleRate: number,
    outSampleRate: number
  ): Float32Array => {
    if (outSampleRate === sampleRate) {
      return buffer;
    }

    const sampleRateRatio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;

      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }

      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return result;
  };

  // Calculate audio metrics
  const calculateMetrics = (data: Float32Array): AudioMetrics => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    const rms = Math.sqrt(sum / data.length);
    const audioLevel = Math.round(rms * 100);

    return {
      duration: 0,
      audioLevel: Math.min(100, audioLevel),
      frequency: 0,
    };
  };

  // Start recording
  const startRecording = async () => {
    try {
      // Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const defaultWsHost = window.location.port ? `${window.location.hostname}:8000` : window.location.host;
      const wsUrl = (import.meta as any).env?.VITE_WS_URL || `${protocol}//${window.location.host.includes(':5000') ? `${window.location.hostname}:8000` : window.location.host}/ws/audio`;
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.binaryType = 'arraybuffer';

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WS message:', data);

          if (data.type === 'speech_partial') {
            setTranscript(data.text);
            options.onPartialTranscript?.(data.text);
          } else if (data.type === 'speech_final') {
            setTranscript(data.text);
            options.onFinalTranscript?.(data.text);
          } else if (data.type === 'error') {
            options.onError?.(data.msg);
          }
        } catch (e) {
          console.log('Non-JSON message:', event.data);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        options.onError?.('WebSocket connection error');
      };

      wsRef.current.onclose = () => {
        console.log('❌ WebSocket closed');
      };

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
        video: false,
      });

      streamRef.current = stream;

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 48000,
      });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate metrics
        const newMetrics = calculateMetrics(inputData);
        setMetrics(newMetrics);
        options.onMetrics?.(newMetrics);

        // Resample from 48kHz to 16kHz
        const resampled = downsampleBuffer(inputData, audioContext.sampleRate, 16000);

        // Convert to PCM16
        const pcm16 = floatTo16BitPCM(resampled);

        // Send to WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(pcm16.buffer);
        }
      };

      setIsRecording(true);
      console.log('✅ Recording started');
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      options.onError?.(String(error));
    }
  };

  // Stop recording
  const stopRecording = () => {
    try {
      if (processorRef.current) {
        processorRef.current.disconnect();
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (wsRef.current) {
        wsRef.current.close();
      }

      setIsRecording(false);
      console.log('✅ Recording stopped');
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [isRecording]);

  return {
    isRecording,
    transcript,
    metrics,
    startRecording,
    stopRecording,
  };
}
