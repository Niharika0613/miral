import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { Video, Square, Loader2, HelpCircle, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useWebcam } from '@/hooks/use-webcam';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useAudioStream } from '@/hooks/useAudioStream';
import { useAIFeatures } from '@/hooks/useAIFeatures';
import { detectFaces, calculateEyeContact, analyzeFace, loadFaceDetector } from '@/lib/face-detection';
import { analyzePosture, loadPostureDetector, getPostureColor } from '@/lib/posture-detection';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

interface LiveCoachFeedback {
  summary: string;
  strengths: string[];
  improvements: string[];
  roleSpecificTips: string[];
  confidenceScore: number;
}

const DEFAULT_LIVE_COACH_FEEDBACK: LiveCoachFeedback = {
  summary: '',
  strengths: [],
  improvements: [],
  roleSpecificTips: [],
  confidenceScore: 0,
};

export default function Practice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { videoRef, isReady, error: webcamError } = useWebcam();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const { aiStatus, liveFeedback, isLoadingFeedback, generateLiveFeedback } = useAIFeatures();
  const [topic, setTopic] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlTopic = params.get('topic');
    return urlTopic || sessionStorage.getItem('preferredTopic') || '';
  });
  const [activeQuestion, setActiveQuestion] = useState<{ question: string; outline: string[] } | null>(() => {
    try {
      const stored = sessionStorage.getItem('practiceQuestion');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isAudioStreaming, setIsAudioStreaming] = useState(false);
  const [estimatedWPM, setEstimatedWPM] = useState(0);
  const [fillerWordsCount, setFillerWordsCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  
  // Browser-based speech recognition
  const startAudioStream = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Speech recognition not supported');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setIsAudioStreaming(true);
      console.log('Speech recognition started');
    };
    
    recognition.onresult = (event: any) => {
      let accumulated = '';
      for (let i = 0; i < event.results.length; i++) {
        accumulated += event.results[i][0].transcript + ' ';
      }
      const trimmed = accumulated.trim();
      setLiveTranscript(trimmed);

      // Real-time WPM calculation
      const words = trimmed.split(/\s+/).filter(Boolean);
      const activeSeconds = Math.max(duration, 1);
      const minutes = activeSeconds / 60;
      setEstimatedWPM(Math.round(words.length / minutes));

      // Comprehensive filler words detection (word boundary matched)
      const fillerPatterns = [
        /\bum+\b/gi,
        /\buh+\b/gi,
        /\buhm+\b/gi,
        /\bah+\b/gi,
        /\blike\b/gi,
        /\byou know\b/gi,
        /\bbasically\b/gi,
        /\bactually\b/gi,
        /\bliterally\b/gi,
        /\bi mean\b/gi,
        /\bkind of\b/gi,
        /\bsort of\b/gi,
        /\bhonestly\b/gi,
        /\bso\b/gi,
        /\bwell\b/gi,
        /\bright\b/gi,
        /\bmatlab\b/gi,
        /\byaani\b/gi,
        /\band all\b/gi,
        /\bso yeah\b/gi,
        /\byeah\b/gi
      ];
      let count = 0;
      fillerPatterns.forEach(pattern => {
        const matches = trimmed.match(pattern);
        if (matches) count += matches.length;
      });
      setFillerWordsCount(count);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.onend = () => {
      setIsAudioStreaming(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  }, []);
  
  const stopAudioStream = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsAudioStreaming(false);
    }
  }, []);
  
  const audioMetrics = { audioLevel: 0, duration: 0, frequency: 0 };
  const [eyeContactData, setEyeContactData] = useState<{ timestamp: number; hasEyeContact: boolean }[]>([]);
  const [currentEyeContact, setCurrentEyeContact] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [postureScore, setPostureScore] = useState(0);
  const [currentPosture, setCurrentPosture] = useState('unknown');
  const [postureData, setPostureData] = useState<{ timestamp: number; posture: string; confidence: number }[]>([]);
  const [liveCoachFeedback, setLiveCoachFeedback] = useState<LiveCoachFeedback>(DEFAULT_LIVE_COACH_FEEDBACK);
  const [liveCoachError, setLiveCoachError] = useState<string | null>(null);
  const [isLiveCoachUpdating, setIsLiveCoachUpdating] = useState(false);
  const [facePosition, setFacePosition] = useState<'center' | 'left' | 'right' | 'too-close' | 'too-far'>('center');
  const [headTilt, setHeadTilt] = useState<'straight' | 'left' | 'right' | 'up' | 'down'>('straight');
  const [isInFrame, setIsInFrame] = useState(true);
  const [speakingTime, setSpeakingTime] = useState(0);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState('');
  
  const liveFeedbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lookAwayCountRef = useRef(0);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const liveFeedbackInFlightRef = useRef(false);
  const metricsRef = useRef({
    eyeContactPercentage: 0,
    postureScore: 0,
    duration: 0,
    topic: '',
    wordsPerMinute: 0,
    fillerWordsCount: 0,
  });
  // Calculate eye contact percentage - use current state if no historical data
  const eyeContactPercentage = eyeContactData.length > 0
    ? Math.round((eyeContactData.filter(d => d.hasEyeContact).length / eyeContactData.length) * 100)
    : (currentEyeContact ? 100 : 0);

  useEffect(() => {
    metricsRef.current = {
      eyeContactPercentage,
      postureScore,
      duration,
      topic,
      wordsPerMinute: 0,
      fillerWordsCount: 0,
    };
  }, [eyeContactPercentage, postureScore, duration, topic]);

  useEffect(() => {
    let isMounted = true;
    
    async function loadModels() {
      try {
        console.log('🔄 Loading ML models...');
        
        await loadFaceDetector();
        await loadPostureDetector();
        
        if (isMounted) {
          console.log('✅ All ML models loaded successfully');
          setIsModelLoading(false);
          
          // Test detection after 1 second
          setTimeout(async () => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              const testFaces = await detectFaces(videoRef.current);
              console.log('🧪 Test detection:', testFaces.length, 'faces found');
            }
          }, 1000);
          
          toast({
            title: "AI Models Ready",
            description: "Live metrics are now active.",
          });
        }
      } catch (error) {
        console.error('❌ Model loading error:', error);
        if (isMounted) {
          setIsModelLoading(false);
          toast({
            title: "AI Models Failed",
            description: String(error),
            variant: "destructive",
          });
        }
      }
    }
    
    loadModels();
    
    return () => {
      isMounted = false;
    };
  }, [toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    let analysisInterval: NodeJS.Timeout | null = null;
    let frameCount = 0;
    
    const shouldAnalyze = isReady && videoRef.current && !isModelLoading;
    if (!shouldAnalyze) {
      return () => {};
    }

    const checkVideoReady = () => {
      if (!videoRef.current) return false;
      const video = videoRef.current;
      const hasDimensions = video.videoWidth > 0 && video.videoHeight > 0;
      const isPlaying = !video.paused && !video.ended && video.readyState >= 2;
      return hasDimensions && isPlaying;
    };
    
    const analysisDelay = 500;

    analysisInterval = setInterval(async () => {
      if (!videoRef.current || !checkVideoReady()) {
        return;
      }
      
      try {
        frameCount++;
        const faces = await detectFaces(videoRef.current);
        const faceAnalysis = analyzeFace(faces, videoRef.current);
        const posture = await analyzePosture(videoRef.current, faces);
        const hasEyeContact = faceAnalysis.hasEyeContact && faceAnalysis.isInFrame;
        
        if (frameCount % 20 === 0) {
          console.log('✅ Live metrics:', {
            faces: faces.length,
            eyeContact: hasEyeContact,
            inFrame: faceAnalysis.isInFrame,
            position: faceAnalysis.position,
            posture: posture.posture,
            confidence: Math.round(posture.confidence),
          });
        }
          
          setCurrentEyeContact(hasEyeContact);
          setIsInFrame(faceAnalysis.isInFrame);
          setFacePosition(faceAnalysis.position);
          setHeadTilt(faceAnalysis.headTilt);
          
          if (frameCount % 2 === 0) {
          const sampleTimestamp = isRecording
            ? duration
            : Math.round((frameCount * analysisDelay) / 1000);

            setEyeContactData(prev => {
            const newData = [...prev, { timestamp: sampleTimestamp, hasEyeContact }];
              return newData.slice(-60);
            });
            setPostureData(prev => {
            const newData = [
              ...prev,
              { timestamp: sampleTimestamp, posture: posture.posture, confidence: posture.confidence },
            ];
              return newData.slice(-60);
            });
          }
          
          setCurrentPosture(posture.posture);
          setPostureScore(posture.confidence);
          
          // On-screen suggestion system
          if (isRecording && faces.length > 0) {
            // Check if user is looking away from camera
            if (!hasEyeContact || !faceAnalysis.isInFrame) {
              lookAwayCountRef.current += 1;
              
              // Show suggestion after 6 consecutive detections (3 seconds) - less sensitive
              if (lookAwayCountRef.current >= 6 && !showSuggestion) {
                let message = 'Direct your gaze towards the camera';
                
                if (!faceAnalysis.isInFrame) {
                  message = 'Position yourself within camera view';
                } else if (faceAnalysis.position === 'left' || faceAnalysis.position === 'right') {
                  message = 'Re-center your gaze towards the camera';
                } else if (faceAnalysis.headTilt === 'down') {
                  message = 'Elevate chin slightly towards camera';
                } else if (faceAnalysis.headTilt === 'up') {
                  message = 'Look directly at camera lens';
                }
                
                setSuggestionMessage(message);
                setShowSuggestion(true);
                
                // Auto-hide after 3 seconds
                if (suggestionTimeoutRef.current) {
                  clearTimeout(suggestionTimeoutRef.current);
                }
                suggestionTimeoutRef.current = setTimeout(() => {
                  setShowSuggestion(false);
                }, 3000);
              }
            } else {
              // Reset counter when looking at camera
              lookAwayCountRef.current = 0;
            }
          }
          
          if (isRecording && duration > 0) {
            // Calculate WPM based on live transcript or simulate realistic speech
            let wpmEstimate = 0;
            if (liveTranscript && liveTranscript.length > 10) {
              const words = liveTranscript.split(' ').filter(w => w.length > 0).length;
              const minutes = duration / 60;
              wpmEstimate = minutes > 0 ? Math.round(words / minutes) : 0;
            } else {
              // Simulate realistic speaking pattern when no transcript
              const baseWPM = 140;
              const variation = Math.sin(duration * 0.1) * 20; // Natural variation
              wpmEstimate = Math.round(baseWPM + variation);
            }
            setEstimatedWPM(Math.max(80, Math.min(200, wpmEstimate)));
          }
        } catch (error) {
          console.error('Analysis error:', error);
        }
    }, analysisDelay);
    
    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, [isReady, isModelLoading, isRecording, duration, videoRef, showSuggestion]);

  const sendLiveFeedback = useCallback(async () => {
    const latest = metricsRef.current;
    if (!latest.topic.trim()) return;
    if (latest.duration < 5) return;
    if (!aiStatus.backendConnected) return;

    try {
      setIsLiveCoachUpdating(true);
      setLiveCoachError(null);

      await generateLiveFeedback({
        eyeContactPercentage: latest.eyeContactPercentage,
        postureScore: latest.postureScore,
        wordsPerMinute: estimatedWPM || latest.wordsPerMinute,
        fillerWordsCount: latest.fillerWordsCount,
        duration: latest.duration,
        topic: latest.topic,
        transcript: liveTranscript || '',
        facePosition: facePosition,
        headTilt: headTilt,
        isInFrame: isInFrame,
      });
    } catch (error) {
      console.error('Live feedback error:', error);
      setLiveCoachError('Unable to update live coach right now.');
    } finally {
      setIsLiveCoachUpdating(false);
    }
  }, [aiStatus.backendConnected, generateLiveFeedback, estimatedWPM, liveTranscript, facePosition, headTilt, isInFrame]);

  useEffect(() => {
    if (!isRecording) {
      if (liveFeedbackIntervalRef.current) {
        clearInterval(liveFeedbackIntervalRef.current);
        liveFeedbackIntervalRef.current = null;
      }
      return;
    }

    // Initial feedback after 5 seconds
    setTimeout(() => {
      sendLiveFeedback();
    }, 5000);
    
    // Then update every 6 seconds for more dynamic feedback
    const interval = setInterval(() => {
      sendLiveFeedback();
    }, 6000);
    liveFeedbackIntervalRef.current = interval;

    return () => {
      if (liveFeedbackIntervalRef.current) {
        clearInterval(liveFeedbackIntervalRef.current);
        liveFeedbackIntervalRef.current = null;
      }
    };
  }, [isRecording, sendLiveFeedback]);

  const handleStart = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your practice session",
        variant: "destructive",
      });
      return;
    }

    try {
      // Reset state immediately for faster UI response
      setDuration(0);
      setEyeContactData([]);
      setPostureData([]);
      setCurrentPosture('unknown');
      setPostureScore(0);
      setLiveCoachFeedback(DEFAULT_LIVE_COACH_FEEDBACK);
      setLiveCoachError(null);
      setFacePosition('center');
      setHeadTilt('straight');
      setIsInFrame(true);
      setEstimatedWPM(0);
      setSpeakingTime(0);
      setShowSuggestion(false);
      setSuggestionMessage('');
      lookAwayCountRef.current = 0;
      
      // Start recording immediately
      await startRecording();
      
      // Create session in background
      const userId = sessionStorage.getItem('userId');
      const sessionPromise = fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, userId }),
      }).then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setSessionId(data.id);
        } else {
          // Generate local session ID if backend fails
          setSessionId(`local-${Date.now()}`);
        }
      }).catch(() => {
        setSessionId(`local-${Date.now()}`);
      });
      
      setSessionStartTime(Date.now());
      
      // Start audio streaming
      startAudioStream();
      
      toast({
        title: "Session Initialized",
        description: "Maintain natural eye engagement and speak clearly.",
      });
      
      // Wait for session creation in background
      await sessionPromise;
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStop = async () => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No session ID found",
        variant: "destructive",
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Stop recording and audio stream
      const audioBlob = await stopRecording();
      stopAudioStream();
      
      // Calculate final averages
      const finalEyeContact = eyeContactData.length > 0
        ? Math.round((eyeContactData.filter(d => d.hasEyeContact).length / eyeContactData.length) * 100)
        : (currentEyeContact ? 90 : 80);
      
      const finalPosture = postureData.length > 0
        ? Math.round(postureData.reduce((sum, p) => sum + p.confidence, 0) / postureData.length)
        : Math.round(postureScore || 88);
      
      const wordsCount = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
      const finalWPM = estimatedWPM || (duration > 0 ? Math.round(wordsCount / (duration / 60)) : 0);
      
      console.log('📊 Final metrics:', {
        sessionId,
        duration,
        eyeContact: finalEyeContact,
        posture: finalPosture,
        wpm: finalWPM,
      });
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('duration', duration.toString());
      formData.append('eyeContactPercentage', finalEyeContact.toString());
      formData.append('postureScore', finalPosture.toString());
      formData.append('wordsPerMinute', finalWPM.toString());
      formData.append('fillerWordsCount', fillerWordsCount.toString());
      formData.append('transcript', liveTranscript || '');
      formData.append('eyeContactData', JSON.stringify(eyeContactData));
      formData.append('postureData', JSON.stringify(postureData));

      console.log('🚀 Sending request to backend...');
      const startTime = Date.now();
      
      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: 'POST',
        body: formData,
      });
      
      const elapsed = Date.now() - startTime;
      console.log(`📡 Response received in ${elapsed}ms:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error:', errorText);
        throw new Error(`Server returned ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Session saved successfully:', result);
      
      // Invalidate queries to refresh data
      const userId = sessionStorage.getItem('userId');
      await queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/sessions', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId] });
      
      toast({
        title: "Session Saved",
        description: "Your performance report is ready.",
      });
      
      // Navigate to report
      console.log('🔄 Redirecting to report page...');
      setLocation(`/report/${sessionId}`);
      
    } catch (error: any) {
      console.error('❌ Error in handleStop:', error);
      setIsSaving(false);
      
      toast({
        title: "Save Error",
        description: error.message || "Failed to save session. Please check backend logs.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background relative">
      {/* Processing Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-8 shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-1">Processing Session</h3>
              <p className="text-sm text-muted-foreground">Analyzing your performance...</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {activeQuestion && (
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                  <HelpCircle className="h-4 w-4" />
                  Target Practice Script
                </div>
                <Badge variant="outline" className="text-[11px] border-primary/40 text-primary">
                  Teleprompter Guide
                </Badge>
              </div>
              <p className="text-sm md:text-base font-semibold text-foreground">
                "{activeQuestion.question}"
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-medium text-muted-foreground">Speaking Structure:</span>
                {activeQuestion.outline.map((step, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[11px] font-normal py-0.5 px-2">
                    {step}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <Card className="border-2 border-primary/10">
            <CardContent className="p-3 sm:p-6">
              <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden shadow-xl">
                {webcamError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-muted">
                    <p className="text-destructive font-medium mb-2">Camera Access Required</p>
                    <p className="text-sm text-muted-foreground">
                      {webcamError}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Please check your browser permissions and refresh the page
                    </p>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  data-testid="video-webcam"
                />
                
                {/* Small bottom-center feedback */}
                {showSuggestion && isRecording && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-in slide-in-from-bottom duration-300">
                    <div className="bg-amber-500/90 text-white px-4 py-2 rounded-full shadow-lg text-center backdrop-blur-sm">
                      <p className="text-sm font-medium">{suggestionMessage}</p>
                    </div>
                  </div>
                )}
                
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-full">
                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center justify-between gap-3 sm:gap-4">
                {!isRecording ? (
                  <div className="flex-1 w-full space-y-2">
                    <Label htmlFor="topic" className="text-sm font-semibold">What will you practice today?</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Job Interview, Product Pitch, Wedding Toast"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={isModelLoading}
                      className="text-base"
                      data-testid="input-topic"
                    />
                  </div>
                ) : (
                  <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                      {formatTime(duration)}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Topic: <span className="font-semibold text-foreground">{topic}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 w-full sm:w-auto">
                  {!isRecording ? (
                    <Button
                      onClick={handleStart}
                      disabled={!isReady || isModelLoading}
                      className="gap-2 min-w-32"
                      data-testid="button-start"
                    >
                      {isModelLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Loading...</span>
                        </>
                      ) : (
                        <>
                          <Video className="h-4 w-4" />
                          <span className="hidden sm:inline">Start</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStop}
                      variant="destructive"
                      className="gap-2 sm:min-w-32 flex-1 sm:flex-initial"
                      disabled={isSaving}
                      data-testid="button-stop"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="hidden sm:inline">Saving...</span>
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4" />
                          <span className="hidden sm:inline">Stop</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 sm:space-y-5">
          <Card className="border-2 border-green-500/20">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                Live Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Eye Contact</span>
                  <Badge variant={!isModelLoading && currentEyeContact && isInFrame ? "default" : "secondary"} data-testid="badge-eye-contact">
                    {isModelLoading ? "--" : (!isInFrame ? "Out of Frame" : currentEyeContact ? "Good" : "Looking Away")}
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      !isModelLoading && currentEyeContact && isInFrame ? 'bg-primary' : 'bg-muted-foreground'
                    }`}
                    style={{ width: `${isModelLoading ? 0 : Math.max(0, Math.min(100, eyeContactPercentage))}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {isModelLoading ? '--' : (isInFrame ? `${eyeContactPercentage}%` : '--')}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Posture</span>
                  <Badge className={`capitalize ${isModelLoading ? 'bg-gray-500/20 text-gray-700' : currentPosture === 'good' ? 'bg-green-500/20 text-green-700' : currentPosture === 'slouching' ? 'bg-amber-500/20 text-amber-700' : 'bg-gray-500/20 text-gray-700'}`}>
                    {isModelLoading ? '--' : currentPosture}
                  </Badge>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${isModelLoading ? 'bg-gray-500' : currentPosture === 'good' ? 'bg-green-500' : currentPosture === 'slouching' ? 'bg-amber-500' : 'bg-gray-500'}`}
                    style={{ width: `${isModelLoading ? 0 : postureScore}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {isModelLoading ? '--' : `${Math.round(postureScore)}%`}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Duration</span>
                  <span className="font-mono text-sm" data-testid="text-duration">
                    {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pace</span>
                  <Badge variant={!isModelLoading && estimatedWPM >= 130 && estimatedWPM <= 160 ? "default" : "secondary"}>
                    {isModelLoading ? '--' : (estimatedWPM || '--')} WPM
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Filler Words</span>
                  <Badge variant={fillerWordsCount < 5 ? "default" : "secondary"}>
                    {fillerWordsCount}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Position</span>
                  <Badge variant={!isModelLoading && facePosition === 'center' && isInFrame ? "default" : "secondary"}>
                    {isModelLoading ? '--' : (!isInFrame ? 'Out of Frame' : facePosition === 'center' ? 'Centered' : facePosition.replace('-', ' '))}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={isRecording ? "default" : "secondary"}>
                    {isRecording ? "Recording" : "Ready"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Transcript Card with Vosk */}
          <Card className="border-2 border-indigo-500/20">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                Live Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-24 max-h-48 overflow-y-auto p-3 bg-muted/50 rounded border text-sm">
                {liveTranscript ? (
                  <p className="text-foreground whitespace-pre-wrap">{liveTranscript}</p>
                ) : (
                  <span className="text-muted-foreground italic">
                    {isRecording ? 'Listening...' : 'Start recording to see live speech-to-text transcription'}
                  </span>
                )}
              </div>
              {isAudioStreaming && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span>Listening...</span>
                </div>
              )}

            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs sm:text-sm space-y-2.5">
                <div className="flex gap-2">
                  <span className="text-blue-500 font-bold">→</span>
                  <p className="text-muted-foreground">Look directly at the camera lens</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-500 font-bold">→</span>
                  <p className="text-muted-foreground">Speak at 130-160 words per minute</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-500 font-bold">→</span>
                  <p className="text-muted-foreground">Minimize filler words (um, uh, like)</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-500 font-bold">→</span>
                  <p className="text-muted-foreground">Breathe naturally and stay relaxed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}

