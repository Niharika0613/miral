// client/src/hooks/useAIFeatures.ts
import { useState, useEffect, useCallback } from 'react';

interface AIStatus {
  backendConnected: boolean;
  voskAvailable: boolean;
  ollamaAvailable: boolean;
  error: string | null;
}

interface LiveFeedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  confidenceScore: number;
  roleSpecificTips: string[];
}

export function useAIFeatures() {
  const [aiStatus, setAiStatus] = useState<AIStatus>({
    backendConnected: true,
    voskAvailable: false,
    ollamaAvailable: false,
    error: null,
  });

  const [liveFeedback, setLiveFeedback] = useState<LiveFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const checkAIStatus = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('/health', { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setAiStatus({
          backendConnected: true,
          voskAvailable: data.vosk_available || false,
          ollamaAvailable: true,
          error: null,
        });
      }
    } catch (error) {
      setAiStatus({
        backendConnected: false,
        voskAvailable: false,
        ollamaAvailable: false,
        error: String(error),
      });
    }
  }, []);

  // Generate live feedback
  const generateLiveFeedback = useCallback(async (metrics: {
    eyeContactPercentage: number;
    postureScore: number;
    wordsPerMinute: number;
    fillerWordsCount: number;
    duration: number;
    topic: string;
    transcript?: string;
    facePosition?: string;
    headTilt?: string;
    isInFrame?: boolean;
  }) => {
    if (!aiStatus.backendConnected) {
      console.warn('Backend not connected, skipping live feedback');
      return;
    }

    try {
      setIsLoadingFeedback(true);
      const response = await fetch('/api/feedback/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      });

      if (response.ok) {
        const feedback = await response.json();
        setLiveFeedback({
          summary: feedback.summary || '',
          strengths: feedback.strengths || [],
          improvements: feedback.improvements || [],
          confidenceScore: feedback.confidence_score || 0,
          roleSpecificTips: feedback.role_specific_tips || [],
        });
      } else {
        console.error('Failed to generate live feedback:', response.statusText);
      }
    } catch (error) {
      console.error('Error generating live feedback:', error);
    } finally {
      setIsLoadingFeedback(false);
    }
  }, [aiStatus.backendConnected]);

  // Check status on mount and periodically
  useEffect(() => {
    checkAIStatus();
    const interval = setInterval(checkAIStatus, 30000); // Check every 30 seconds (less frequent)
    return () => clearInterval(interval);
  }, [checkAIStatus]);

  // Initial quick check on mount
  useEffect(() => {
    const quickCheck = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch('/health', { 
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setAiStatus({
            backendConnected: true,
            voskAvailable: data.vosk_available || false,
            ollamaAvailable: true,
            error: null,
          });
        }
      } catch (error) {
        // Backend not available, keep default state
        console.log('Backend check:', error);
      }
    };
    quickCheck();
  }, []);

  return {
    aiStatus,
    liveFeedback,
    isLoadingFeedback,
    checkAIStatus,
    generateLiveFeedback,
  };
}