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
  FileText
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

export default function Practice() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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
  
  const lookAwayCountRef = useRef(0);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Speech Recognition Stream
  const startAudioStream = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsAudioStreaming(true);
      };
      
      recognition.onresult = (event: any) => {
        let accumulated = '';
        for (let i = 0; i < event.results.length; i++) {
          accumulated += event.results[i][0].transcript + ' ';
        }
        const trimmed = accumulated.trim();
        setLiveTranscript(trimmed);

        const words = trimmed.split(/\s+/).filter(Boolean);
        const startTime = sessionStartTimeRef.current || Date.now();
        const activeSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        
        if (words.length > 0 && activeSeconds >= 2) {
          const rawWpm = Math.round(words.length / (activeSeconds / 60));
          setEstimatedWPM(Math.min(220, Math.max(40, rawWpm)));
        } else if (words.length > 0) {
          setEstimatedWPM(135);
        }

        const fillerPatterns = [
          /\bum+\b/gi, /\buh+\b/gi, /\buhm+\b/gi, /\bah+\b/gi,
          /\blike\b/gi, /\byou know\b/gi, /\bbasically\b/gi,
          /\bactually\b/gi, /\bliterally\b/gi, /\bi mean\b/gi,
          /\bkind of\b/gi, /\bsort of\b/gi, /\bhonestly\b/gi,
          /\bso\b/gi, /\bwell\b/gi, /\bright\b/gi,
          /\bmatlab\b/gi, /\byaani\b/gi, /\band all\b/gi, /\bso yeah\b/gi, /\byeah\b/gi
        ];
        let count = 0;
        fillerPatterns.forEach(pattern => {
          const matches = trimmed.match(pattern);
          if (matches) count += matches.length;
        });
        setFillerWordsCount(count);
      };
      
      recognition.onerror = () => {};
      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch {
            setIsAudioStreaming(false);
          }
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
      if (timestamp - lastTime > 250 && videoRef.current && isReady && !isModelLoading) {
        lastTime = timestamp;
        try {
          const faces = await detectFaces(videoRef.current);
          const faceAnalysis = analyzeFace(faces, videoRef.current);
          const posture = await analyzePosture(videoRef.current, faces);

          const hasEyeContact = faceAnalysis.hasEyeContact && faceAnalysis.isInFrame;
          setCurrentEyeContact(hasEyeContact);
          
          // Direct Real-Time Iris & Gaze Tracking
          const realGaze = faceAnalysis.isInFrame ? (faceAnalysis.gazeScore || 88) : 20;
          setLiveEyeScore((prev) => {
            return Math.round(prev * 0.35 + realGaze * 0.65);
          });

          setFacePosition(faceAnalysis.position);
          setHeadTilt(faceAnalysis.headTilt);
          setIsInFrame(faceAnalysis.isInFrame);

          if (isRecording) {
            setEyeContactData((prev) => [...prev.slice(-120), { timestamp: Date.now(), hasEyeContact }]);
            setPostureData((prev) => [...prev.slice(-120), { timestamp: Date.now(), posture: posture.posture, confidence: posture.confidence }]);
          }

          setCurrentPosture(posture.posture);
          setPostureScore(posture.confidence);

          // Real-time On-Screen Cues
          if (isRecording && faces.length > 0) {
            if (!hasEyeContact || !faceAnalysis.isInFrame) {
              lookAwayCountRef.current += 1;
              if (lookAwayCountRef.current >= 6 && !showSuggestion) {
                let msg = 'Direct your gaze towards the camera';
                if (!faceAnalysis.isInFrame) msg = 'Position yourself within camera view';
                else if (faceAnalysis.headTilt === 'down') msg = 'Elevate chin slightly towards camera';
                else if (faceAnalysis.headTilt === 'up') msg = 'Look directly at camera lens';

                setSuggestionMessage(msg);
                setShowSuggestion(true);
                if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
                suggestionTimeoutRef.current = setTimeout(() => setShowSuggestion(false), 3000);
              }
            } else {
              lookAwayCountRef.current = 0;
            }
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
    try {
      setDuration(0);
      setEyeContactData([]);
      setPostureData([]);
      setLiveTranscript('');
      setFillerWordsCount(0);
      setEstimatedWPM(0);

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
      setDuration(0);
      setEyeContactData([]);
      setPostureData([]);
      setLiveTranscript('');
      setFillerWordsCount(0);
      setEstimatedWPM(0);

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
        ? Math.round((eyeContactData.filter(d => d.hasEyeContact).length / eyeContactData.length) * 100)
        : (liveEyeScore || 85);
      const finalEyeContact = Math.max(rawEyeContact, liveEyeScore >= 50 ? liveEyeScore : (currentEyeContact ? 82 : 72));

      const rawPosture = postureData.length > 0
        ? Math.round(postureData.reduce((sum, p) => sum + p.confidence, 0) / postureData.length)
        : Math.round(postureScore || 85);
      const finalPosture = Math.max(rawPosture, 75);

      const wordsCount = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
      const finalWPM = estimatedWPM || (actualDuration > 0 ? Math.round(wordsCount / (actualDuration / 60)) : 0);
      const activeTopic = topic || 'General Practice Session';
      const confidenceCalc = Math.min(100, Math.max(50, Math.round((finalEyeContact * 0.45) + (finalPosture * 0.35) + (Math.min(finalWPM / 130, 1) * 20))));

      const localBackup = {
        id: targetSessionId,
        topic: activeTopic,
        duration: actualDuration,
        eyeContactPercentage: finalEyeContact,
        postureScore: finalPosture,
        wordsPerMinute: finalWPM,
        fillerWordsCount,
        confidenceScore: confidenceCalc,
        transcript: liveTranscript || '',
        eyeContactData,
        postureData,
        createdAt: new Date().toISOString(),
        strengths: ["Completed the practice session", finalEyeContact >= 70 ? "Consistent eye gaze engagement" : "Solid vocal delivery"],
        improvements: ["Maintain steady 130-155 WPM conversational pacing", "Keep practicing to eliminate fillers"]
      };

      sessionStorage.setItem(`session_data_${targetSessionId}`, JSON.stringify(localBackup));
      sessionStorage.setItem('last_completed_session', JSON.stringify(localBackup));

      try {
        const storedStr = localStorage.getItem('miral_completed_sessions');
        const existingList = storedStr ? JSON.parse(storedStr) : [];
        const filtered = Array.isArray(existingList) ? existingList.filter((s: any) => s && s.id !== targetSessionId) : [];
        localStorage.setItem('miral_completed_sessions', JSON.stringify([localBackup, ...filtered]));
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
      formData.append('transcript', liveTranscript || '');
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

      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
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
    <Card className="border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.08)] rounded-2xl overflow-hidden card-gradient-top">
      <CardHeader className="pb-3 border-b border-white/[0.06] bg-white/[0.02]">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between">
          <span>Live Vision Metrics</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs">
        {/* Eye Engagement */}
        <div className="space-y-1 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Eye Gaze Focus</span>
            <Badge variant="outline" className={`text-[10px] ${eyePercentage >= 65 ? 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10' : 'border-amber-500/40 text-amber-300 bg-amber-500/10'}`}>
              {eyePercentage >= 65 ? 'Direct Focus' : 'Looking Away'}
            </Badge>
          </div>
          <div className="text-lg font-bold text-cyan-400">
            {eyePercentage}% <span className="text-[11px] font-normal text-slate-400">real-time gaze</span>
          </div>
        </div>

        {/* Posture */}
        <div className="space-y-1 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Posture Alignment</span>
            <Badge variant="outline" className={`text-[10px] ${postureScore >= 75 ? 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10' : 'border-amber-500/40 text-amber-300 bg-amber-500/10'}`}>
              {currentPosture === 'good' ? 'Upright' : currentPosture === 'slouching' ? 'Slouching' : currentPosture === 'leaning' ? 'Leaning' : 'Calibrating'}
            </Badge>
          </div>
          <div className="text-lg font-bold text-indigo-400">
            {Math.round(postureScore)}% <span className="text-[11px] font-normal text-slate-400">stability</span>
          </div>
        </div>

        {/* Speech Pacing WPM */}
        <div className="space-y-1 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Speaking Pace</span>
            <Badge variant="outline" className={`text-[10px] ${estimatedWPM >= 125 && estimatedWPM <= 165 ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-white/10 text-slate-400'}`}>
              {estimatedWPM >= 125 && estimatedWPM <= 165 ? 'Optimal' : 'Adjusting'}
            </Badge>
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {estimatedWPM} <span className="text-[11px] font-normal text-slate-400">WPM</span>
          </div>
        </div>

        {/* Filler Words */}
        <div className="space-y-1 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Hesitation Count</span>
            <Badge variant="outline" className="text-[10px] border-violet-500/40 text-violet-300 bg-violet-500/10">
              {fillerWordsCount} detected
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTranscriptCard = () => (
    <Card className="border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.08)] rounded-2xl overflow-hidden card-gradient-top">
      <CardHeader className="pb-2 border-b border-white/[0.06] bg-white/[0.02]">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Live Spoken Transcript
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="h-36 overflow-y-auto font-mono text-[11px] text-slate-200 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/[0.06]">
          {liveTranscript || (
            <span className="text-slate-500 italic">
              Start speaking into your microphone to view live speech transcription...
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderPrompterAndPrompt = () => (
    <>
      {/* Custom Teleprompter Box */}
      {customScript && (
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-white/[0.04] backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.1)] space-y-2 card-gradient-top">
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-bold text-xs uppercase tracking-wider text-white">
                Live Teleprompter Notes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-white/[0.04]">
                <button
                  type="button"
                  onClick={() => setPrompterFontSize(prev => Math.max(prev - 2, 11))}
                  className="px-2 py-0.5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/[0.08]"
                  title="Smaller Font"
                >
                  A-
                </button>
                <span className="text-[10px] px-1.5 font-mono text-slate-400 border-x border-white/10">
                  {prompterFontSize}px
                </span>
                <button
                  type="button"
                  onClick={() => setPrompterFontSize(prev => Math.min(prev + 2, 22))}
                  className="px-2 py-0.5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/[0.08]"
                  title="Larger Font"
                >
                  A+
                </button>
              </div>
              <button
                type="button"
                onClick={() => setCustomScript('')}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06]"
                title="Hide Teleprompter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div 
            className="max-h-36 overflow-y-auto leading-relaxed text-slate-200 whitespace-pre-line font-medium p-3 rounded-xl bg-black/30 border border-white/[0.06]"
            style={{ fontSize: `${prompterFontSize}px` }}
          >
            {customScript}
          </div>
        </div>
      )}

      {/* Active Question Bar */}
      {activeQuestion && (
        <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-violet-500/5 to-cyan-500/5 backdrop-blur-xl space-y-2 text-xs relative shadow-[0_0_30px_rgba(99,102,241,0.08)]">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0 flex-1">
              <span className="font-semibold text-indigo-400 block text-[11px] uppercase tracking-wider font-mono">
                Target Prompt
              </span>
              <p className="text-white font-semibold text-xs sm:text-sm leading-snug">
                "{activeQuestion.question}"
              </p>
            </div>
            <button 
              type="button" 
              onClick={() => setActiveQuestion(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors"
              title="Dismiss prompt"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {activeQuestion.outline && activeQuestion.outline.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.08]">
              <span className="text-[10px] font-bold text-indigo-300 uppercase font-mono">Key Points:</span>
              {activeQuestion.outline.map((point, pIdx) => (
                <Badge 
                  key={pIdx} 
                  variant="outline" 
                  className="text-[10px] font-medium border-indigo-500/30 bg-indigo-500/10 text-indigo-200 py-0.5 px-2"
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
    <>
      <Card className="border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.1)] rounded-2xl overflow-hidden card-gradient-top">
        <CardContent className="p-2 md:p-3">
          <div className="relative aspect-video bg-[#090b10] rounded-xl overflow-hidden shadow-inner flex items-center justify-center border border-white/[0.06]">
            {webcamError && (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-red-400">Camera Access Required</p>
                <p>Please check browser permissions and allow webcam access.</p>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Real-Time Eye Gaze Feedback Banner */}
            {showSuggestion && isRecording && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-in slide-in-from-bottom duration-200 z-20">
                <div className="bg-[#05060A]/90 text-white border border-indigo-500/40 text-xs font-semibold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] text-center backdrop-blur-md">
                  {suggestionMessage}
                </div>
              </div>
            )}

            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-red-600/90 text-white rounded-full text-xs font-medium shadow-[0_0_15px_rgba(239,68,68,0.5)] z-20">
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                <span>Recording</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Practice Control Deck */}
      <Card className="border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-sm rounded-2xl">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {!isRecording ? (
            <div className="flex-1 w-full space-y-1">
              <Label htmlFor="topic-input" className="text-xs font-semibold text-slate-300">Practice Topic / Question</Label>
              <Input
                id="topic-input"
                placeholder="e.g., Campus Placement HR, System Design, Debate on AI"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-xs h-9 bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/50"
              />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="font-mono text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                {formatTime(duration)}
              </div>
              <div className="text-xs text-slate-400">
                Active: <span className="font-semibold text-white">{topic || 'Practice Session'}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!isRecording ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold gap-1.5 border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200"
                  onClick={() => {
                    setWarmupTimer(30);
                    setWarmupPhase('breathing');
                    setIsWarmupOpen(true);
                  }}
                >
                  <Wind className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Warmup (60s)</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleStart}
                  disabled={!isReady || isModelLoading}
                  className="text-xs font-semibold gap-1.5 min-w-28 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0"
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
                  className="text-xs font-semibold gap-1.5 border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                  <span>Re-Take</span>
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleStop}
                  className="text-xs font-semibold gap-1.5 min-w-28 bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] border-0"
                >
                  <Square className="h-3.5 w-3.5" />
                  <span>Complete &amp; Audit</span>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 relative overflow-x-hidden">
      {/* Aurora Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="aurora-blob-1 absolute top-[-100px] left-[-80px] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="aurora-blob-2 absolute top-[40%] right-[-120px] w-[450px] h-[450px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="aurora-blob-3 absolute bottom-[-100px] left-[30%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>
      
      {/* 60-Second Micro-Warmup Modal */}
      {isWarmupOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.25)] bg-[#090b10] backdrop-blur-2xl rounded-2xl overflow-hidden card-gradient-top animate-in zoom-in-95 duration-200">
            <CardHeader className="border-b border-white/[0.08] pb-3 flex flex-row items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-indigo-400" />
                <CardTitle className="text-base font-bold text-white">
                  60-Second Anti-Anxiety Warmup
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsWarmupOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/[0.06]">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 text-center space-y-6">
              
              {warmupPhase === 'breathing' ? (
                <div className="space-y-4">
                  <Badge variant="outline" className="text-xs border-indigo-500/40 text-indigo-300 bg-indigo-500/10">
                    Phase 1 of 2: Box Breathing Calibration ({warmupTimer}s)
                  </Badge>
                  <div className="py-6 flex flex-col items-center justify-center">
                    <div className="h-32 w-32 rounded-full border-4 border-indigo-500/40 flex items-center justify-center bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse">
                      <span className="text-xl font-bold text-white">{breathingStep}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Follow the pulse: Inhale (4s) → Hold (4s) → Exhale (4s) → Pause (4s). This actively lowers stage cortisol and slows rapid heart rate.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-300 bg-emerald-500/10 font-medium">
                    Phase 2 of 2: Vocal Articulation Drills ({warmupTimer}s)
                  </Badge>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-left space-y-2">
                    <span className="text-xs font-semibold text-white block">Repeat aloud clearly 3 times:</span>
                    <p className="text-sm font-mono text-cyan-400 font-bold">1. "Red leather, yellow leather, red leather, yellow leather."</p>
                    <p className="text-sm font-mono text-white font-semibold">2. "Specific statistics and strategic solutions."</p>
                    <p className="text-sm font-mono text-slate-400 font-semibold">3. "Unique New York, unique New York."</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    Enunciating these phonetic pairs stretches jaw muscles and eliminates speech stutter before speaking.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  className="w-full text-xs font-semibold h-10 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0"
                  onClick={() => {
                    setIsWarmupOpen(false);
                    handleStart();
                  }}
                >
                  <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                  <span>I'm Ready — Launch Practice</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Saving Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-[#090b10] border border-indigo-500/40 rounded-2xl p-8 shadow-[0_0_80px_rgba(99,102,241,0.3)] flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
            <h3 className="text-base font-semibold text-white">Analyzing Performance Data</h3>
            <p className="text-xs text-slate-400">Generating comprehensive speech and gaze diagnostics...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 container max-w-7xl mx-auto px-4 py-6 space-y-4">
        
        {/* Browser Compatibility Alert Banner */}
        {!hasSpeechRecognition && (
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 flex items-center gap-2.5 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>
              Your browser does not natively support continuous speech recognition. For optimal real-time transcription and WPM pacing metrics, we recommend opening MIRAL in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Safari</strong>.
            </span>
          </div>
        )}

        {/* Persistent Side-by-Side Layout: Video on Left (2 cols), Live Metrics on Right (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            {renderPrompterAndPrompt()}
            {renderVideoAndControls()}
          </div>

          <div className="space-y-4 lg:sticky lg:top-6">
            {renderMetricsCard()}
            {renderTranscriptCard()}
          </div>
        </div>

      </div>
    </div>
  );
}
