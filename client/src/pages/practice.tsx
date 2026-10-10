// client/src/pages/practice.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { 
  Video, 
  Square, 
  Loader2, 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  RotateCcw, 
  Wind, 
  Mic2, 
  Heart, 
  CheckCircle2,
  Play,
  X,
  AlertCircle,
  FileText,
  UserPlus,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useWebcam } from '@/hooks/use-webcam';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { detectFaces, calculateEyeContact, analyzeFace, loadFaceDetector } from '@/lib/face-detection';
import { analyzePosture, loadPostureDetector, getPostureColor } from '@/lib/posture-detection';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { isLoggedIn, getUserPlan, getDailyAnalysisUsage } from '@/utils/auth';


export default function Practice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userPlan = getUserPlan();
  const dailyUsage = getDailyAnalysisUsage();
  const { videoRef, isReady, error: webcamError } = useWebcam();
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  
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

  const [customScript, setCustomScript] = useState<string>(() => {
    return sessionStorage.getItem('practiceScript') || '';
  });

  const [prompterFontSize, setPrompterFontSize] = useState<number>(14);

  const hasSpeechRecognition = typeof window !== 'undefined' && (('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window));

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isAudioStreaming, setIsAudioStreaming] = useState(false);
  const [estimatedWPM, setEstimatedWPM] = useState(0);
  const [fillerWordsCount, setFillerWordsCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const sessionStartTimeRef = useRef<number>(0);

  // Micro-Warmup State
  const [isWarmupOpen, setIsWarmupOpen] = useState(false);
  const [warmupPhase, setWarmupPhase] = useState<'breathing' | 'vocal'>('breathing');
  const [breathingStep, setBreathingStep] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [warmupTimer, setWarmupTimer] = useState(30);

  // Live Vision & Speech Data
  const [eyeContactData, setEyeContactData] = useState<{ timestamp: number; hasEyeContact: boolean }[]>([]);
  const [currentEyeContact, setCurrentEyeContact] = useState(true);
  const [liveEyeScore, setLiveEyeScore] = useState(88);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [postureScore, setPostureScore] = useState(88);
  const [currentPosture, setCurrentPosture] = useState('good');
  const [postureData, setPostureData] = useState<{ timestamp: number; posture: string; confidence: number }[]>([]);
  const [facePosition, setFacePosition] = useState<'center' | 'left' | 'right' | 'too-close' | 'too-far'>('center');
  const [headTilt, setHeadTilt] = useState<'straight' | 'left' | 'right' | 'up' | 'down'>('straight');
  const [isInFrame, setIsInFrame] = useState(true);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const lookAwayCountRef = useRef(0);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const persistedTranscriptRef = useRef('');
  const activeSessionTextRef = useRef('');
  // Active speech interval timestamps to calculate speaking-only WPM
  const speechIntervalsRef = useRef<{ start: number; end: number }[]>([]);

  // Speech Recognition Stream & Mobile Mic Handler with Chunk Accumulation
  const startAudioStream = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsAudioStreaming(false);
      return;
    }
    
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      
      // Auto-detect browser/regional English dialect
      const userLang = navigator.language || 'en-US';
      recognition.lang = userLang.toLowerCase().includes('in') ? 'en-IN' : 'en-US';
      
      recognition.onstart = () => {
        setIsAudioStreaming(true);
      };
      
      recognition.onresult = (event: any) => {
        let currentChunk = '';
        for (let i = 0; i < event.results.length; i++) {
          currentChunk += event.results[i][0].transcript + ' ';
        }
        activeSessionTextRef.current = currentChunk.trim();

        const combined = (persistedTranscriptRef.current + ' ' + activeSessionTextRef.current).trim();
        if (combined) {
          setLiveTranscript(combined);

          // Track active speaking interval (extend if within 2.2s of last utterance, else start new chunk)
          const now = Date.now();
          const intervals = speechIntervalsRef.current;
          if (intervals.length > 0 && (now - intervals[intervals.length - 1].end) < 2200) {
            intervals[intervals.length - 1].end = now;
          } else {
            intervals.push({ start: now, end: now + 800 });
          }

          const words = combined.split(/\s+/).filter(Boolean);
          // Calculate speaking time ONLY while actively speaking (not total elapsed idle time)
          const rawActiveSpeakingSecs = intervals.reduce(
            (sum, inv) => sum + Math.max(0.6, (inv.end - inv.start) / 1000), 
            0
          );
          // Upper speed guard (~190 WPM max ceiling so 1-2 words don't explode WPM)
          const activeSpeakingSeconds = Math.max(words.length * 0.31, rawActiveSpeakingSecs);
          
          if (words.length > 0 && activeSpeakingSeconds >= 1.5) {
            const rawWpm = Math.round(words.length / (activeSpeakingSeconds / 60));
            setEstimatedWPM(Math.min(210, Math.max(50, rawWpm)));
          } else if (words.length > 0) {
            setEstimatedWPM(135);
          }

          const fillerRules = [
            /\b(um+|uh+|uhm+|er+|ah+|ahm+)\b/gi,
            /\b(you know|i mean|kind of|sort of|at the end of the day)\b/gi,
            /\b(basically|actually|literally|essentially)\b/gi,
            /\b(matlab|yaani|aur kya|and all that)\b/gi,
            /\b(like)\b/gi
          ];
          let count = 0;
          fillerRules.forEach(pattern => {
            const matches = combined.match(pattern);
            if (matches) count += matches.length;
          });
          setFillerWordsCount(count);
        }
      };
      
      recognition.onerror = (e: any) => {
        // Silently handle transient errors on mobile (e.g. no-speech, network timeout)
        if (isRecordingRef.current && e?.error !== 'not-allowed') {
          setTimeout(() => {
            if (isRecordingRef.current && recognitionRef.current) {
              try { recognitionRef.current.start(); } catch {}
            }
          }, 200);
        }
      };

      recognition.onend = () => {
        if (activeSessionTextRef.current) {
          persistedTranscriptRef.current = (persistedTranscriptRef.current + ' ' + activeSessionTextRef.current).trim();
          activeSessionTextRef.current = '';
        }

        if (isRecordingRef.current) {
          setTimeout(() => {
            if (isRecordingRef.current) {
              try {
                recognition.start();
                setIsAudioStreaming(true);
              } catch {
                // If restart fails, retry once more
                setTimeout(() => {
                  if (isRecordingRef.current) {
                    try { recognition.start(); } catch {}
                  }
                }, 400);
              }
            }
          }, 100);
        } else {
          setIsAudioStreaming(false);
        }
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsAudioStreaming(false);
    }
  }, []);
  
  const stopAudioStream = useCallback(() => {
    isRecordingRef.current = false;
    if (activeSessionTextRef.current) {
      persistedTranscriptRef.current = (persistedTranscriptRef.current + ' ' + activeSessionTextRef.current).trim();
      activeSessionTextRef.current = '';
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
      setIsAudioStreaming(false);
    }
  }, []);

  // Micro-Warmup Interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWarmupOpen) {
      interval = setInterval(() => {
        setWarmupTimer((prev) => {
          if (prev <= 1) {
            if (warmupPhase === 'breathing') {
              setWarmupPhase('vocal');
              return 30;
            } else {
              setIsWarmupOpen(false);
              return 30;
            }
          }
          if (warmupPhase === 'breathing') {
            const mod = prev % 16;
            if (mod > 12) setBreathingStep('Inhale');
            else if (mod > 8) setBreathingStep('Hold');
            else if (mod > 4) setBreathingStep('Exhale');
            else setBreathingStep('Pause');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWarmupOpen, warmupPhase]);

  // Load Vision & Posture Models
  useEffect(() => {
    let isMounted = true;
    async function loadModels() {
      try {
        await loadFaceDetector();
        await loadPostureDetector();
        if (isMounted) setIsModelLoading(false);
      } catch {
        if (isMounted) setIsModelLoading(false);
      }
    }
    loadModels();
    return () => { isMounted = false; };
  }, []);

  // Frame-by-Frame Detection Loop
  useEffect(() => {
    let animationId: number;
    let lastTime = 0;

    async function processFrame(timestamp: number) {
      if (timestamp - lastTime > 200 && videoRef.current && isReady && !isModelLoading) {
        lastTime = timestamp;
        try {
          const faces = await detectFaces(videoRef.current);
          const faceAnalysis = analyzeFace(faces, videoRef.current);
          const posture = await analyzePosture(videoRef.current, faces);

          const hasEyeContact = faceAnalysis.hasEyeContact && faceAnalysis.isInFrame;
          setCurrentEyeContact(hasEyeContact);
          
          // Direct Real-Time Iris & Gaze Tracking
          const realGaze = faceAnalysis.isInFrame ? (faceAnalysis.gazeScore || 0) : 0;
          setLiveEyeScore((prev) => {
            if (!faceAnalysis.isInFrame) return 0;
            return Math.round(prev * 0.25 + realGaze * 0.75);
          });

          setFacePosition(faceAnalysis.position);
          setHeadTilt(faceAnalysis.headTilt);
          setIsInFrame(faceAnalysis.isInFrame);

          if (isRecording) {
            setEyeContactData((prev) => [...prev.slice(-180), { timestamp: Date.now(), gazeScore: faceAnalysis.isInFrame ? Math.round(realGaze) : 0, hasEyeContact }]);
            setPostureData((prev) => [...prev.slice(-180), { timestamp: Date.now(), posture: faceAnalysis.isInFrame ? posture.posture : 'unknown', confidence: faceAnalysis.isInFrame ? posture.confidence : 0 }]);
          }

          setCurrentPosture(faceAnalysis.isInFrame ? posture.posture : 'unknown');
          setPostureScore(faceAnalysis.isInFrame ? posture.confidence : 0);

          // Real-time On-Screen Visual Coaching Cues (Active during practice session)
          if (isRecording) {
            let activeHint = '';
            if (!faceAnalysis.isInFrame) {
              activeHint = 'Position your face inside the camera view';
            } else if (!hasEyeContact) {
              if (faceAnalysis.headTilt === 'down') {
                activeHint = 'Elevate chin slightly & look at the camera lens';
              } else if (faceAnalysis.headTilt === 'up') {
                activeHint = 'Level your head & look directly into the camera';
              } else if (faceAnalysis.position === 'left' || faceAnalysis.position === 'right') {
                activeHint = 'Center your face in front of the camera';
              } else {
                activeHint = 'Direct your gaze towards the camera lens';
              }
            } else if (posture.posture === 'slouching') {
              activeHint = 'Sit upright & roll your shoulders back';
            } else if (posture.posture === 'leaning') {
              activeHint = 'Align posture centered with camera';
            }

            if (activeHint) {
              setSuggestionMessage(activeHint);
              setShowSuggestion(true);
            } else {
              setShowSuggestion(false);
            }
          } else {
            setShowSuggestion(false);
            setSuggestionMessage('');
          }
        } catch {}
      }
      animationId = requestAnimationFrame(processFrame);
    }

    if (isReady && !isModelLoading) {
      animationId = requestAnimationFrame(processFrame);
    }
    return () => cancelAnimationFrame(animationId);
  }, [isReady, isModelLoading, isRecording, videoRef, showSuggestion]);

  // Session Duration Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => setDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const sessionIdRef = useRef<string>('');

  const handleStart = async () => {
    if (!isReady || isModelLoading) return;
    // Gate: user must be logged in to start a session (saves results)
    if (!isLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      setDuration(0);
      setEyeContactData([]);
      setPostureData([]);
      setLiveTranscript('');
      setFillerWordsCount(0);
      setEstimatedWPM(0);
      persistedTranscriptRef.current = '';
      activeSessionTextRef.current = '';
      speechIntervalsRef.current = [];

      const startTime = Date.now();
      sessionStartTimeRef.current = startTime;
      isRecordingRef.current = true;

      const newSessionId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `miral-${Date.now()}`;
      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);

      await startRecording();
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
      
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newSessionId, topic: topic || 'General Practice Session', userId }),
      }).catch(() => {});

      setSessionStartTime(startTime);
      startAudioStream();

      toast({
        title: "Practice Initialized",
        description: "Maintain calm breathing and speak naturally.",
      });
    } catch {
      toast({
        title: "Camera/Mic Error",
        description: "Please allow microphone and webcam access.",
        variant: "destructive",
      });
    }
  };

  const handleRetake = async () => {
    try {
      isRecordingRef.current = false;
      await stopRecording();
      stopAudioStream();
      persistedTranscriptRef.current = '';
      activeSessionTextRef.current = '';
      setDuration(0);
      setEyeContactData([]);
      setPostureData([]);
      setLiveTranscript('');
      setFillerWordsCount(0);
      setEstimatedWPM(0);
      speechIntervalsRef.current = [];

      toast({
        title: "Session Reset",
        description: "Take a deep breath and start fresh whenever you are ready.",
      });
    } catch {}
  };

  const handleStop = async () => {
    const targetSessionId = sessionIdRef.current || sessionId || `miral-${Date.now()}`;
    setIsSaving(true);
    try {
      isRecordingRef.current = false;
      const audioBlob = await stopRecording();
      stopAudioStream();

      const actualDuration = Math.max(duration, sessionStartTimeRef.current > 0 ? Math.round((Date.now() - sessionStartTimeRef.current) / 1000) : (sessionStartTime > 0 ? Math.round((Date.now() - sessionStartTime) / 1000) : 1));

      const rawEyeContact = eyeContactData.length > 0
        ? Math.round(eyeContactData.reduce((sum, d: any) => sum + (d.gazeScore ?? (d.hasEyeContact ? 85 : 25)), 0) / eyeContactData.length)
        : (liveEyeScore || (currentEyeContact ? 80 : 30));
      const finalEyeContact = Math.max(0, Math.min(100, rawEyeContact));

      const rawPosture = postureData.length > 0
        ? Math.round(postureData.reduce((sum, p) => sum + p.confidence, 0) / postureData.length)
        : Math.round(postureScore || 70);
      const finalPosture = Math.max(0, Math.min(100, rawPosture));

      let resolvedTranscript = (persistedTranscriptRef.current + ' ' + activeSessionTextRef.current).trim() || liveTranscript.trim();
      
      // Fallback: only use custom script if user explicitly set it; NEVER inject fake text
      if (!resolvedTranscript && customScript) {
        resolvedTranscript = customScript;
      }
      // If still empty — user's mic/speech recognition didn't capture anything — keep it empty.
      // The report will show "No audio recorded" which is the honest truth.

      const wordsCount = resolvedTranscript.split(/\s+/).filter(Boolean).length;
      let finalWPM = 0;

      if (wordsCount > 0) {
        const intervals = speechIntervalsRef.current;
        const rawActiveSpeakingSecs = intervals.reduce(
          (sum, inv) => sum + Math.max(0.6, (inv.end - inv.start) / 1000), 
          0
        );
        // Active speaking seconds calculation measures pace ONLY while speaking, not silent periods
        const activeSpeakingSeconds = Math.max(wordsCount * 0.31, rawActiveSpeakingSecs);

        const computedWpm = activeSpeakingSeconds > 0
          ? Math.round(wordsCount / (activeSpeakingSeconds / 60))
          : (estimatedWPM || 135);

        finalWPM = Math.min(210, Math.max(50, computedWpm));
      } else {
        finalWPM = 0;
      }

      // Record daily transcript analysis usage
      getDailyAnalysisUsage().recordAnalysis();

      const activeTopic = topic || 'General Practice Session';
      
      const pacingFactor = finalWPM >= 120 && finalWPM <= 165 ? 100 : (finalWPM > 0 ? Math.max(20, 100 - Math.abs(finalWPM - 140) * 1.5) : 30);
      const fillerPenalty = Math.min(25, fillerWordsCount * 4);
      const vocalScore = Math.max(10, Math.round(pacingFactor - fillerPenalty));
      
      const confidenceCalc = Math.min(100, Math.max(10, Math.round((finalEyeContact * 0.40) + (finalPosture * 0.35) + (vocalScore * 0.25))));

      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');

      const localBackup = {
        id: targetSessionId,
        topic: activeTopic,
        userId: userId || undefined,
        duration: actualDuration,
        eyeContactPercentage: finalEyeContact,
        postureScore: finalPosture,
        wordsPerMinute: finalWPM,
        fillerWordsCount,
        confidenceScore: confidenceCalc,
        transcript: resolvedTranscript || '',
        eyeContactData,
        postureData,
        createdAt: new Date().toISOString(),
        strengths: ["Completed the practice session", finalEyeContact >= 70 ? "Consistent eye gaze engagement" : "Solid vocal delivery"],
        improvements: ["Maintain steady 130-155 WPM conversational pacing", "Keep practicing to eliminate fillers"]
      };

      sessionStorage.setItem(`session_data_${targetSessionId}`, JSON.stringify(localBackup));
      sessionStorage.setItem('last_completed_session', JSON.stringify(localBackup));

      try {
        const userStorageKey = userId ? `miral_completed_sessions_${userId}` : 'miral_completed_sessions_guest';
        const storedStr = localStorage.getItem(userStorageKey);
        const existingList = storedStr ? JSON.parse(storedStr) : [];
        const filtered = Array.isArray(existingList) ? existingList.filter((s: any) => s && s.id !== targetSessionId) : [];
        localStorage.setItem(userStorageKey, JSON.stringify([localBackup, ...filtered]));
      } catch (cacheErr) {
        console.warn("Local storage cache notice:", cacheErr);
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('duration', actualDuration.toString());
      formData.append('eyeContactPercentage', finalEyeContact.toString());
      formData.append('postureScore', finalPosture.toString());
      formData.append('wordsPerMinute', finalWPM.toString());
      formData.append('fillerWordsCount', fillerWordsCount.toString());
      formData.append('confidenceScore', confidenceCalc.toString());
      formData.append('transcript', resolvedTranscript || '');
      formData.append('eyeContactData', JSON.stringify(eyeContactData));
      formData.append('postureData', JSON.stringify(postureData));

      try {
        await fetch(`/api/sessions/${targetSessionId}/complete`, {
          method: 'POST',
          body: formData,
        });
      } catch (postErr) {
        console.warn("Backend sync notice:", postErr);
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/sessions', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/sessions', targetSessionId] });

      toast({
        title: "Session Saved",
        description: "Your detailed speech & vision performance report is ready.",
      });
      setLocation(`/report/${targetSessionId}`);
    } catch {
      setIsSaving(false);
      toast({
        title: "Session Ready",
        description: "Opening your practice performance report...",
      });
      setLocation(`/report/${targetSessionId}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const eyePercentage = liveEyeScore;

  const hasPrompterOrQuestion = Boolean(customScript || activeQuestion);

  const renderMetricsCard = () => (
    <Card className="border border-border/60 bg-card shadow-xs">
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
          <span>Live Vision Metrics</span>
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Eye Engagement */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Eye Gaze Focus</span>
            {!isInFrame ? (
              <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                Out of Frame
              </Badge>
            ) : (
              <Badge variant={eyePercentage >= 60 ? "default" : "secondary"} className="text-[10px]">
                {eyePercentage >= 60 ? 'Direct Focus' : 'Looking Away'}
              </Badge>
            )}
          </div>
          <div className="text-lg font-bold text-foreground">
            {isInFrame ? eyePercentage : 0}% <span className="text-[11px] font-normal text-muted-foreground">real-time gaze tracking</span>
          </div>
        </div>

        {/* Posture */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Posture Alignment</span>
            {!isInFrame ? (
              <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                Adjust Camera
              </Badge>
            ) : (
              <Badge variant={currentPosture === 'good' ? "default" : "secondary"} className="text-[10px]">
                {currentPosture === 'good' ? 'Upright' : currentPosture === 'slouching' ? 'Slouching' : currentPosture === 'leaning' ? 'Leaning' : 'Calibrating'}
              </Badge>
            )}
          </div>
          <div className="text-lg font-bold text-foreground">
            {isInFrame ? Math.round(postureScore) : 0}% <span className="text-[11px] font-normal text-muted-foreground">stability</span>
          </div>
        </div>

        {/* Speech Pacing WPM */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Speaking Pace</span>
            <Badge variant="outline" className="text-[10px]">
              {estimatedWPM >= 125 && estimatedWPM <= 165 ? 'Optimal' : 'Adjusting'}
            </Badge>
          </div>
          <div className="text-lg font-bold text-foreground">
            {estimatedWPM} <span className="text-[11px] font-normal text-muted-foreground">WPM</span>
          </div>
        </div>

        {/* Filler Words */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Hesitation Count</span>
            <Badge variant="secondary" className="text-[10px]">
              {fillerWordsCount} detected
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTranscriptCard = () => (
    <Card className="border border-border/60 bg-card shadow-xs">
      <CardHeader className="pb-2 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Live Spoken Transcript
        </CardTitle>
        <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
          Daily Cap: {dailyUsage.count}/{dailyUsage.limit} • {userPlan.badgeText}
        </Badge>
      </CardHeader>
      <CardContent className="p-3">
        <div className="h-36 overflow-y-auto font-mono text-[11px] text-foreground/90 leading-relaxed bg-muted/20 p-2.5 rounded border border-border/30">
          {liveTranscript || (
            <span className="text-muted-foreground italic">
              Start speaking into your microphone to view live speech transcription...
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPrompterAndPrompt = () => (
    <>
      {/* Custom Teleprompter Box - Compact Studio Bar */}
      {customScript && (
        <div className="p-3 rounded-xl border border-primary/40 bg-card shadow-xs space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="font-bold text-[11px] uppercase tracking-wider text-foreground">
                Live Teleprompter Notes
              </span>
              <Badge variant="secondary" className="text-[9px] text-primary bg-primary/10 border-primary/20">
                Pro • {userPlan.badgeText}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center border border-border/60 rounded-md overflow-hidden bg-muted/40 h-6">
                <button
                  type="button"
                  onClick={() => setPrompterFontSize(prev => Math.max(prev - 1, 11))}
                  className="px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Smaller Font"
                >
                  A-
                </button>
                <span className="text-[10px] px-1 font-mono text-muted-foreground border-x border-border/40">
                  {prompterFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setPrompterFontSize(prev => Math.min(prev + 1, 20))}
                  className="px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted"
                  title="Larger Font"
                >
                  A+
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCustomScript('')}
                className="text-muted-foreground hover:text-foreground p-1 rounded"
                title="Hide Teleprompter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div 
            className="max-h-24 overflow-y-auto leading-relaxed text-foreground whitespace-pre-line font-medium p-2 rounded bg-muted/30 border border-border/30 select-text"
            style={{ fontSize: `${prompterFontSize}px` }}
          >
            {customScript}
          </div>
        </div>
      )}

      {/* Active Question Bar */}
      {activeQuestion && (
        <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-1.5 text-xs relative animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="font-semibold text-primary block text-[10px] uppercase tracking-wider">
                Target Scenario Prompt
              </span>
              <p className="text-foreground font-semibold text-xs sm:text-sm leading-snug">
                "{activeQuestion.question}"
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setActiveQuestion(null)}
              className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              title="Dismiss prompt"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {activeQuestion.outline && activeQuestion.outline.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-primary/15">
              <span className="text-[10px] font-bold text-primary/80 uppercase">Key Points:</span>
              {activeQuestion.outline.map((point, pIdx) => (
                <Badge 
                  key={pIdx} 
                  variant="outline" 
                  className="text-[10px] font-medium border-primary/20 bg-background/60 text-foreground py-0.5 px-2"
                >
                  {point}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );

  const renderVideoAndControls = () => (
    <div className="space-y-3">
      {/* Responsive Studio Camera Feed */}
      <Card className="border border-border/60 bg-card shadow-xs overflow-hidden">
        <CardContent className="p-2">
          <div className="relative aspect-video max-h-[50vh] sm:max-h-[55vh] w-full bg-black/95 rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
            {webcamError && (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-destructive">Camera Access Required</p>
                <p>Please check browser permissions and allow webcam access.</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />

            {/* Real-Time Live Visual Coaching Banner (Only while recording) */}
            {showSuggestion && isRecording && suggestionMessage && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-in slide-in-from-bottom duration-150 z-20 pointer-events-none max-w-[90%]">
                <div className="bg-slate-900/95 text-white border border-white/20 text-xs font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <span>{suggestionMessage}</span>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-destructive text-destructive-foreground rounded-full text-[11px] font-medium shadow-sm z-10">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>Recording</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Practice Control Deck */}
      <Card className="border border-border/60 bg-card shadow-xs">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {!isRecording ? (
            <div className="flex-1 w-full space-y-1">
              <Label htmlFor="topic-input" className="text-xs font-semibold text-foreground">Practice Topic / Question</Label>
              <Input
                id="topic-input"
                placeholder="e.g., Campus Placement HR, System Design, Debate on AI"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-xs h-8 sm:h-9"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="font-mono text-xl sm:text-2xl font-bold text-foreground">
                {formatTime(duration)}
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-xs">
                Active: <span className="font-semibold text-foreground">{topic || 'Practice Session'}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {!isRecording ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold gap-1.5 h-8 sm:h-9 flex-1 sm:flex-none"
                  onClick={() => {
                    setWarmupTimer(30);
                    setWarmupPhase('breathing');
                    setIsWarmupOpen(true);
                  }}
                >
                  <Wind className="h-3.5 w-3.5 text-primary" />
                  <span>Warmup (60s)</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleStart}
                  disabled={!isReady || isModelLoading}
                  className="text-xs font-semibold gap-1.5 min-w-28 h-8 sm:h-9 flex-1 sm:flex-none"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Start Practice</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetake}
                  className="text-xs font-semibold gap-1.5 h-8 sm:h-9 flex-1 sm:flex-none"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Re-Take</span>
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleStop}
                  className="text-xs font-semibold gap-1.5 min-w-28 h-8 sm:h-9 flex-1 sm:flex-none"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>Complete & Audit</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      
      {/* Login Gate Modal — shown when unauthenticated user clicks Start */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-2 border-primary/30 shadow-2xl bg-card">
            <CardHeader className="border-b border-border/40 pb-4 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <UserPlus className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">Create a Free Account to Practice</CardTitle>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Your session metrics, progress trajectory, and AI coaching report are saved to your account — so your growth is always tracked.
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="space-y-1.5 text-xs text-muted-foreground">
                {['Eye contact & posture analytics saved', 'Session-by-session progress chart', 'AI coaching report & learning resources', 'Downloadable Communication Certificate'].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Button
                  className="flex-1 text-xs font-semibold h-9 gap-1.5"
                  onClick={() => setLocation('/login?mode=signup')}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Create Free Account
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-xs font-semibold h-9 gap-1.5 border-border/60"
                  onClick={() => setLocation('/login')}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  I Already Have an Account
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground pt-1 transition-colors"
              >
                Maybe later — just explore the studio
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 60-Second Micro-Warmup Modal */}
      {isWarmupOpen && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-2 border-primary/30 shadow-2xl bg-card">
            <CardHeader className="border-b border-border/40 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-bold text-foreground">
                  60-Second Anti-Anxiety Warmup
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsWarmupOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-6">
              
              {warmupPhase === 'breathing' ? (
                <div className="space-y-4">
                  <Badge variant="outline" className="text-xs border-primary/40 text-primary">
                    Phase 1 of 2: Box Breathing Calibration ({warmupTimer}s)
                  </Badge>
                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className="h-32 w-32 rounded-full border-4 border-primary/40 flex items-center justify-center bg-primary/5 animate-pulse">
                      <span className="text-xl font-bold text-primary">{breathingStep}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Follow the pulse: Inhale (4s) → Hold (4s) → Exhale (4s) → Pause (4s). This actively lowers stage cortisol and slows rapid heart rate.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Badge variant="outline" className="text-xs border-green-500/40 text-green-600 font-medium">
                    Phase 2 of 2: Vocal Articulation Drills ({warmupTimer}s)
                  </Badge>
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/40 text-left space-y-2">
                    <span className="text-xs font-semibold text-foreground block">Repeat aloud clearly 3 times:</span>
                    <p className="text-sm font-mono text-primary font-bold">1. "Red leather, yellow leather, red leather, yellow leather."</p>
                    <p className="text-sm font-mono text-foreground font-semibold">2. "Specific statistics and strategic solutions."</p>
                    <p className="text-sm font-mono text-muted-foreground font-semibold">3. "Unique New York, unique New York."</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enunciating these phonetic pairs stretches jaw muscles and eliminates speech stutter before speaking.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  className="w-full text-xs font-semibold"
                  onClick={() => {
                    setIsWarmupOpen(false);
                    handleStart();
                  }}
                >
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                  <span>I'm Ready — Launch Practice</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saving Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border/80 rounded-xl p-8 shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <h3 className="text-base font-semibold text-foreground">Analyzing Performance Data</h3>
            <p className="text-xs text-muted-foreground">Generating comprehensive speech and gaze diagnostics...</p>
          </div>
        </div>
      )}

      <div className="container max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-3">
        
        {/* Browser Compatibility Alert Banner */}
        {!hasSpeechRecognition && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex items-center gap-2.5 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Your browser does not natively support continuous speech recognition. For optimal real-time transcription and WPM pacing metrics, we recommend opening MIRAL in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Safari</strong>.
            </span>
          </div>
        )}

        {/* Studio Side-by-Side Grid: Video + Controls on Left, Sticky HUD on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          <div className="lg:col-span-8 space-y-3">
            {renderPrompterAndPrompt()}
            {renderVideoAndControls()}
          </div>

          <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-16">
            {renderMetricsCard()}
            {renderTranscriptCard()}
          </div>
        </div>

      </div>
    </div>
  );
}
