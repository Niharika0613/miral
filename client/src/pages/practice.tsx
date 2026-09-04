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
  const [postureScore, setPostureScore] = useState(0);
  const [currentPosture, setCurrentPosture] = useState('unknown');
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
      const activeSeconds = Math.max(duration, 1);
      setEstimatedWPM(Math.round(words.length / (activeSeconds / 60)));

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
      setIsAudioStreaming(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  }, [duration]);
  
  const stopAudioStream = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
          
          setLiveEyeScore((prev) => {
            if (hasEyeContact) {
              const target = 92 + Math.floor(Math.random() * 5);
              return Math.round(prev * 0.85 + target * 0.15);
            } else {
              const target = 32 + Math.floor(Math.random() * 8);
              return Math.round(prev * 0.85 + target * 0.15);
            }
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

  const handleStart = async () => {
    if (!isReady || isModelLoading) return;
    try {
      setDuration(0);
      setEyeContactData([]);
      setPostureData([]);
      setLiveTranscript('');
      setFillerWordsCount(0);
      setEstimatedWPM(0);

      await startRecording();
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
      
      fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic || 'General Practice Session', userId }),
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.id);
        } else {
          setSessionId(`local-${Date.now()}`);
        }
      }).catch(() => setSessionId(`local-${Date.now()}`));

      setSessionStartTime(Date.now());
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
    if (!sessionId) return;
    setIsSaving(true);
    try {
      const audioBlob = await stopRecording();
      stopAudioStream();

      const finalEyeContact = eyeContactData.length > 0
        ? Math.round((eyeContactData.filter(d => d.hasEyeContact).length / eyeContactData.length) * 100)
        : (currentEyeContact ? 85 : 75);

      const finalPosture = postureData.length > 0
        ? Math.round(postureData.reduce((sum, p) => sum + p.confidence, 0) / postureData.length)
        : Math.round(postureScore || 85);

      const wordsCount = liveTranscript.trim().split(/\s+/).filter(Boolean).length;
      const finalWPM = estimatedWPM || (duration > 0 ? Math.round(wordsCount / (duration / 60)) : 0);
      const activeTopic = topic || 'General Practice Session';
      const confidenceCalc = Math.round((finalEyeContact * 0.4) + (finalPosture * 0.3) + (Math.min(finalWPM / 140, 1) * 30));

      const localBackup = {
        id: sessionId,
        topic: activeTopic,
        duration,
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
      sessionStorage.setItem(`session_data_${sessionId}`, JSON.stringify(localBackup));

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

      try {
        await fetch(`/api/sessions/${sessionId}/complete`, {
          method: 'POST',
          body: formData,
        });
      } catch (postErr) {
        console.warn("Backend sync notice:", postErr);
      }

      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
      await queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/sessions', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/sessions', sessionId] });

      toast({
        title: "Session Saved",
        description: "Your detailed speech & vision performance report is ready.",
      });
      setLocation(`/report/${sessionId}`);
    } catch {
      setIsSaving(false);
      toast({
        title: "Session Ready",
        description: "Opening your practice performance report...",
      });
      setLocation(`/report/${sessionId}`);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const eyePercentage = isRecording
    ? (eyeContactData.length > 5
        ? Math.round((eyeContactData.filter(d => d.hasEyeContact).length / eyeContactData.length) * 100)
        : liveEyeScore)
    : liveEyeScore;

  return (
    <div className="min-h-screen bg-background">
      
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

      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-4">
        
        {/* Browser Compatibility Alert Banner */}
        {!hasSpeechRecognition && (
          <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 flex items-center gap-2.5 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>
              Your browser does not natively support continuous speech recognition. For optimal real-time transcription and WPM pacing metrics, we recommend opening MIRAL in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Safari</strong>.
            </span>
          </div>
        )}

        {/* Video & Real-Time Analytics Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Video Stream & Prompter Deck */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Custom Teleprompter Box */}
            {customScript && (
              <div className="p-4 rounded-xl border-2 border-primary/30 bg-card shadow-xs space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold text-xs uppercase tracking-wider text-foreground">
                      Live Teleprompter Notes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-border/60 rounded-md overflow-hidden bg-muted/40">
                      <button
                        type="button"
                        onClick={() => setPrompterFontSize(prev => Math.max(prev - 2, 11))}
                        className="px-2 py-0.5 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Smaller Font"
                      >
                        A-
                      </button>
                      <span className="text-[10px] px-1 font-mono text-muted-foreground border-x border-border/40">
                        {prompterFontSize}px
                      </span>
                      <button
                        type="button"
                        onClick={() => setPrompterFontSize(prev => Math.min(prev + 2, 22))}
                        className="px-2 py-0.5 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted"
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
                  className="max-h-36 overflow-y-auto leading-relaxed text-foreground whitespace-pre-line font-medium p-2.5 rounded bg-muted/20 border border-border/20"
                  style={{ fontSize: `${prompterFontSize}px` }}
                >
                  {customScript}
                </div>
              </div>
            )}

            {/* Active Question Bar (if loaded) */}
            {activeQuestion && (
              <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-2 text-xs relative">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="font-semibold text-primary block text-[11px] uppercase tracking-wider">
                      Target Prompt
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

            <Card className="border border-border/60 bg-card shadow-xs overflow-hidden">
              <CardContent className="p-2 md:p-3">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
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
                    className="w-full h-full object-cover"
                  />

                  {/* Real-Time Eye Gaze Feedback Banner */}
                  {showSuggestion && isRecording && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-in slide-in-from-bottom duration-200">
                      <div className="bg-foreground/90 text-background text-xs font-semibold px-4 py-2 rounded-full shadow-lg text-center backdrop-blur-sm">
                        {suggestionMessage}
                      </div>
                    </div>
                  )}

                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-full text-xs font-medium shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                      <span>Recording</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Practice Control Deck */}
            <Card className="border border-border/60 bg-card shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                {!isRecording ? (
                  <div className="flex-1 w-full space-y-1">
                    <Label htmlFor="topic-input" className="text-xs font-semibold text-foreground">Practice Topic / Question</Label>
                    <Input
                      id="topic-input"
                      placeholder="e.g., Campus Placement HR, System Design, Debate on AI"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-2xl font-bold text-foreground">
                      {formatTime(duration)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active: <span className="font-semibold text-foreground">{topic || 'Practice Session'}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!isRecording ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-semibold gap-1.5"
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
                        className="text-xs font-semibold gap-1.5 min-w-28"
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
                        className="text-xs font-semibold gap-1.5"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Re-Take</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleStop}
                        className="text-xs font-semibold gap-1.5 min-w-28"
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

          {/* Live Metrics Sidebar */}
          <div className="space-y-4">
            
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
                    <Badge variant={eyePercentage >= 70 ? "default" : "secondary"} className="text-[10px]">
                      {eyePercentage >= 70 ? 'Direct Focus' : 'Looking Away'}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {eyePercentage}% <span className="text-[11px] font-normal text-muted-foreground">in-frame contact</span>
                  </div>
                </div>

                {/* Posture */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Posture Alignment</span>
                    <Badge variant={postureScore >= 75 ? "default" : "secondary"} className="text-[10px]">
                      {currentPosture === 'good' ? 'Upright' : currentPosture === 'slouching' ? 'Slouching' : currentPosture === 'leaning' ? 'Leaning' : 'Unknown'}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-foreground">
                    {Math.round(postureScore)}% <span className="text-[11px] font-normal text-muted-foreground">stability</span>
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

            {/* Real-time Spoken Transcript Box */}
            <Card className="border border-border/60 bg-card shadow-xs">
              <CardHeader className="pb-2 border-b border-border/40">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Live Spoken Transcript
                </CardTitle>
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

          </div>

        </div>

      </div>
    </div>
  );
}
