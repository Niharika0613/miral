import { useEffect, useRef, useState } from 'react';

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupWebcam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              // Wait a bit to ensure video is actually playing
              setTimeout(() => {
                if (videoRef.current && videoRef.current.readyState >= 2) {
                  setIsReady(true);
                }
              }, 100);
            }).catch((err) => {
              console.error('Error playing video:', err);
              setError('Unable to play video stream.');
            });
          };
          
          videoRef.current.onerror = () => {
            setError('Video stream error occurred.');
          };
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('Unable to access webcam. Please check permissions.');
      }
    }

    setupWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsReady(false);
    };
  }, []);

  return { videoRef, isReady, error };
}
