// client/src/pages/home.tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Video, 
  Sparkles, 
  Eye, 
  Activity, 
  Volume2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Play, 
  Zap, 
  BookOpen, 
  Compass, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Users, 
  HelpCircle, 
  FileText, 
  Wind,
  Layers,
  BarChart3,
  Flame,
  Check,
  Star,
  LogIn,
  Camera,
  CameraOff,
  Mic,
  RefreshCw,
  Sliders,
  Gauge,
  MonitorPlay,
  FileCheck2,
  Lock,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCurrentUser } from '@/utils/auth';

export default function Home() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'tempo'>('stream');
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [hoveredScenario, setHoveredScenario] = useState<number | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [activeTourStep, setActiveTourStep] = useState(1);
  
  // Interactive Live Stream Preview State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Interactive Live Speech Tester State
  const [interactiveWpm, setInteractiveWpm] = useState(142);
  const [paceTextIndex, setPaceTextIndex] = useState(0);

  // Scroll Scrub Transformation State
  const transformRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: transformRef,
    offset: ["start end", "end start"]
  });

  const scrollEye = useTransform(scrollYProgress, [0.25, 0.75], [42, 92]);
  const scrollWpm = useTransform(scrollYProgress, [0.25, 0.75], [185, 138]);
  const scrollFillers = useTransform(scrollYProgress, [0.25, 0.75], [12, 0]);

  const [displayEye, setDisplayEye] = useState(42);
  const [displayWpm, setDisplayWpm] = useState(185);
  const [displayFillers, setDisplayFillers] = useState(12);

  useEffect(() => {
    const unsubEye = scrollEye.on("change", (v) => setDisplayEye(Math.round(v)));
    const unsubWpm = scrollWpm.on("change", (v) => setDisplayWpm(Math.round(v)));
    const unsubFillers = scrollFillers.on("change", (v) => setDisplayFillers(Math.round(v)));
    return () => {
      unsubEye();
      unsubWpm();
      unsubFillers();
    };
  }, [scrollEye, scrollWpm, scrollFillers]);

  const samplePassages = [
    "Good communication is about structuring your main points clearly so your listeners stay engaged and understand your message.",
    "During my college project, our team solved a major performance bottleneck, making our web app much faster and more reliable.",
    "Confident speakers don't rush. They take a calm breath, look directly at their audience, and speak with steady clarity."
  ];

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleLiveCamera = async () => {
    if (isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraActive(false);
      setCameraError(null);
    } else {
      try {
        setCameraError(null);
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (err: any) {
        console.warn("Camera preview request notice:", err);
        setCameraError("Camera permission not granted. You can still test the interactive AI simulator below!");
      }
    }
  };

  const scenarios = [
    {
      title: "Campus Placement HR",
      short: "Placement HR",
      desc: "Practice behavioral questions, introduction walkthroughs, and confidence under interview pressure.",
      badge: "Placement Drive",
      microStat: "HR Interview • 92% Gaze Target",
      metrics: { eye: "92%", pace: "138 WPM", posture: "Upright (94%)", fillers: "0 detected" },
      prompt: "Tell me about a challenging project where you resolved a difficult problem under tight deadlines."
    },
    {
      title: "Project / Startup Pitch",
      short: "Project Pitch",
      desc: "Explain your ideas, project value, and problem-solving approach with clarity and energy.",
      badge: "Pitch Practice",
      microStat: "Presentation • 148 WPM",
      metrics: { eye: "95%", pace: "148 WPM", posture: "Confident (96%)", fillers: "1 detected" },
      prompt: "Explain your project idea and why it provides a better solution than existing alternatives."
    },
    {
      title: "Debate & Public Speaking",
      short: "Debate & MUN",
      desc: "Sharpen persuasive arguments, rebuttals, and speaking speed under time limits.",
      badge: "Debate Practice",
      microStat: "Debate Mode • 155 WPM",
      metrics: { eye: "89%", pace: "155 WPM", posture: "Engaged (91%)", fillers: "0 detected" },
      prompt: "Present a 60-second opening statement on how AI will impact jobs and education."
    },
    {
      title: "Team Presentation & Meetings",
      short: "Team Meeting",
      desc: "Practice clear storytelling, pausing before key points, and leading discussions.",
      badge: "Communication",
      microStat: "Team Talk • 132 WPM",
      metrics: { eye: "94%", pace: "132 WPM", posture: "Steadfast (95%)", fillers: "0 detected" },
      prompt: "Present your weekly team update clearly while keeping everyone aligned on next goals."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#050608] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Continuous Ambient Aurora Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-[radial-gradient(circle,rgba(79,70,229,0.18)_0%,rgba(139,92,246,0.12)_45%,rgba(59,130,246,0.06)_70%,transparent_100%)] blur-[120px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[500px] bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,rgba(79,70,229,0.08)_50%,transparent_100%)] blur-[140px] rounded-full" />
        <div className="absolute top-[75%] left-[-10%] w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,rgba(79,70,229,0.08)_50%,transparent_100%)] blur-[130px] rounded-full" />
      </div>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-6 pb-12 md:pt-10 md:pb-16 border-b border-white/[0.08] overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Hero Text & Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-6 space-y-5 text-left"
            >
              
              {/* Clean Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold backdrop-blur-xl shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>AI Practice Mirror • Real-Time Speech & Vision Intelligence</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                  Speak with <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">Unshakeable Confidence.</span>
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">
                  Powered by Real-Time Vision & Voice AI.
                </p>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                The only AI mirror giving you private, real-time feedback on <strong className="text-white font-semibold">both how you sound and how you look</strong> while answering — tracking your eye contact, posture, speaking cadence (WPM), and Hinglish filler words 100% in your browser.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <Link href="/practice">
                  <Button size="lg" className="w-full sm:w-auto text-xs font-semibold h-11 px-6 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Launch Free Practice Session</span>
                  </Button>
                </Link>

                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={toggleLiveCamera}
                  className="w-full sm:w-auto text-xs font-semibold h-11 px-5 gap-2 border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200"
                >
                  <Camera className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{isCameraActive ? "Stop Webcam Preview" : "Test Live Webcam"}</span>
                </Button>

                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" variant="ghost" className="w-full sm:w-auto text-xs font-semibold h-11 px-4 gap-1.5 text-slate-300 hover:text-white">
                      <span>Dashboard</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button size="lg" variant="ghost" className="w-full sm:w-auto text-xs font-semibold h-11 px-4 gap-1.5 text-slate-300 hover:text-white">
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-3 flex flex-wrap items-center gap-5 text-xs text-slate-400 border-t border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-200 font-medium">100% In-Browser Privacy</span>
                  <span>(No video uploaded to cloud)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-200 font-medium">Instant Live Feedback</span>
                </div>
              </div>

            </motion.div>

            {/* Right Column: Hero Live Simulator Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-6 relative"
            >
              <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-2xl p-4 sm:p-5 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] relative overflow-hidden">
                
                {/* Simulator Window Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-400 ml-1">
                      miral // {activeTab === 'stream' ? 'live_camera_simulator' : 'wpm_speed_tester'}
                    </span>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-lg border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('stream')}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                        activeTab === 'stream'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Camera & Eye Target
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tempo')}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                        activeTab === 'tempo'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Speaking Speed (WPM)
                    </button>
                  </div>
                </div>

                {cameraError && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                    <span>{cameraError}</span>
                    <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5" onClick={() => setCameraError(null)}>✕</Button>
                  </div>
                )}

                {/* Tab 1: Vision Stream / Live Camera */}
                {activeTab === 'stream' ? (
                  <div className="space-y-3 mt-3">
                    <div className="rounded-xl bg-[#090b10] border border-white/[0.08] p-4 relative min-h-[220px] flex flex-col justify-between overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-25" />

                      {/* Top Badges */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2.5 py-1 rounded-md text-[10px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-semibold text-slate-200">
                            {isCameraActive ? "Live In-Browser Webcam" : "Eye Contact Radar"}
                          </span>
                        </div>
                        <Badge variant="outline" className="border-white/10 text-slate-300 text-[10px]">
                          {scenarios[activeScenarioIdx].title}
                        </Badge>
                      </div>

                      {/* Center Graphic */}
                      {isCameraActive ? (
                        <div className="relative z-10 my-2 flex items-center justify-center h-36 w-full">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="h-full w-auto rounded-lg border border-indigo-500/40 shadow-md object-cover transform -scale-x-100" 
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="h-20 w-20 rounded-full border-2 border-emerald-400/80 animate-pulse flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative z-10 my-3 flex flex-col items-center justify-center text-center space-y-2">
                          <div className="h-16 w-16 rounded-full border border-indigo-500/40 flex items-center justify-center animate-pulse">
                            <div className="h-11 w-11 rounded-full border border-emerald-400/60 flex items-center justify-center bg-emerald-500/10">
                              <Eye className="h-5 w-5 text-emerald-400" />
                            </div>
                          </div>
                          <div className="text-[11px] font-mono text-emerald-400 font-bold tabular-nums">
                            EYE FOCUS: {scenarios[activeScenarioIdx].metrics.eye} • {scenarios[activeScenarioIdx].metrics.posture}
                          </div>
                          <p className="text-xs text-slate-300 italic max-w-xs leading-tight">
                            "{scenarios[activeScenarioIdx].prompt}"
                          </p>
                        </div>
                      )}

                      {/* Bottom Footer */}
                      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.08] pt-2">
                        <span className="text-emerald-400 font-medium">Looking Directly at Screen</span>
                        <span className="font-mono text-[10px] text-slate-500">60 FPS Real-Time</span>
                      </div>
                    </div>

                    {/* Quick Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <span className="text-[10px] text-slate-400 font-medium block">Eye Focus</span>
                        <span className="text-sm font-bold font-mono text-white tabular-nums">{scenarios[activeScenarioIdx].metrics.eye}</span>
                      </div>
                      <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <span className="text-[10px] text-slate-400 font-medium block">Speaking Speed</span>
                        <span className="text-sm font-bold font-mono text-white tabular-nums">{scenarios[activeScenarioIdx].metrics.pace}</span>
                      </div>
                      <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <span className="text-[10px] text-slate-400 font-medium block">Hesitations</span>
                        <span className="text-sm font-bold font-mono text-white tabular-nums">{scenarios[activeScenarioIdx].metrics.fillers}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Tab 2: WPM Tempo Sandbox */
                  <div className="space-y-3.5 mt-3 text-left">
                    <div className="p-3.5 rounded-xl bg-[#090b10] border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-white/[0.08]">
                        <span className="font-mono">Sample Passage {paceTextIndex + 1} of {samplePassages.length}</span>
                        <button
                          type="button"
                          onClick={() => setPaceTextIndex((prev) => (prev + 1) % samplePassages.length)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                          Next Passage →
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 italic leading-relaxed">
                        "{samplePassages[paceTextIndex]}"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">Speaking Speed Target:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-bold font-mono text-white tabular-nums">{interactiveWpm} WPM</span>
                          <Badge 
                            variant="outline"
                            className={`text-[9px] ${
                              interactiveWpm >= 130 && interactiveWpm <= 155 
                                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' 
                                : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {interactiveWpm < 120 ? 'Too Slow' : interactiveWpm <= 155 ? 'Ideal Retention' : 'Too Fast'}
                          </Badge>
                        </div>
                      </div>

                      <input 
                        type="range" 
                        min={80} 
                        max={220} 
                        value={interactiveWpm} 
                        onChange={(e) => setInteractiveWpm(Number(e.target.value))}
                        className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg cursor-pointer" 
                      />

                      <div className="flex justify-between text-[9px] font-mono text-slate-500">
                        <span>80 WPM (Slow)</span>
                        <span className="text-emerald-400 font-bold">130–155 WPM (Ideal Target)</span>
                        <span>220 WPM (Too Fast)</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>

          </div>

          {/* Scenario Chips with Hover Micro-Stats */}
          <div className="mt-8 pt-5 border-t border-white/[0.08]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2.5 text-center sm:text-left">
              Select Practice Scenario:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {scenarios.map((sc, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredScenario(idx)}
                  onMouseLeave={() => setHoveredScenario(null)}
                  onClick={() => setActiveScenarioIdx(idx)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden ${
                    activeScenarioIdx === idx
                      ? 'bg-indigo-600/15 border-indigo-500/50 shadow-sm'
                      : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{sc.short}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {hoveredScenario === idx ? (
                      <span className="text-indigo-300 font-mono font-medium">{sc.microStat}</span>
                    ) : (
                      sc.badge
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ===================== SCROLL-SCRUBBED TRANSFORMATION CARD ===================== */}
      <section ref={transformRef} className="py-12 md:py-16 border-b border-white/[0.08] relative">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto space-y-2.5 mb-8"
          >
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs font-semibold">
              Live Scroll Transformation
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              The Measurable MIRAL Transformation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Scroll down to watch unmonitored baseline habits transform into confident, AI-guided delivery.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 35, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-2xl p-5 sm:p-7 shadow-2xl space-y-6"
          >
            
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400">PRACTICE STATE:</span>
                <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  {displayEye >= 75 ? (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400">With MIRAL (Confident & Focused)</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="text-red-400">Before MIRAL (Unmonitored Blindspots)</span>
                    </>
                  )}
                </div>
              </div>

              <Badge 
                variant="outline" 
                className={`text-xs px-3 py-1 font-mono ${
                  displayEye >= 75 ? 'border-emerald-500/40 text-emerald-300' : 'border-red-500/40 text-red-300'
                }`}
              >
                {displayEye >= 75 ? 'Interview Ready' : 'Nervous Habits Detected'}
              </Badge>
            </div>

            {/* 4 Scrubbed Metric Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Metric 1: Eye Focus */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Eye Contact Focus</span>
                  <span className="font-mono font-bold text-white text-base tabular-nums">{displayEye}%</span>
                </div>
                <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-150 ${displayEye >= 75 ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${displayEye}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {displayEye >= 75 ? 'Looking straight ahead at the camera and listeners' : 'Looking down at notes or ceiling when recalling answers'}
                </p>
              </div>

              {/* Metric 2: WPM Cadence */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Speaking Pace</span>
                  <span className="font-mono font-bold text-white text-base tabular-nums">{displayWpm} WPM</span>
                </div>
                <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-150 ${displayWpm <= 155 ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min((displayWpm / 200) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {displayWpm <= 155 ? 'Calm conversational pace that is easy for listeners to absorb' : 'Speaking too fast due to nervousness, rushing ideas'}
                </p>
              </div>

              {/* Metric 3: Filler Words */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Filler Hesitations</span>
                  <span className="font-mono font-bold text-white text-base tabular-nums">{displayFillers} detected</span>
                </div>
                <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-150 ${displayFillers <= 2 ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.max(100 - displayFillers * 8, 10)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {displayFillers <= 2 ? 'Clean pauses with deep breaths instead of fillers' : 'Frequent um, like, matlab, basically filling every silence'}
                </p>
              </div>

              {/* Metric 4: Posture */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Body Posture</span>
                  <span className="font-mono font-bold text-white text-base">
                    {displayEye >= 75 ? 'Upright (94%)' : 'Slouched / Leaning'}
                  </span>
                </div>
                <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-150 ${displayEye >= 75 ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: displayEye >= 75 ? '94%' : '52%' }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {displayEye >= 75 ? 'Straight back and centered head position' : 'Sinking down in the chair showing lower confidence'}
                </p>
              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* ===================== PINNED-PANEL PRODUCT TOUR ===================== */}
      <section className="py-12 md:py-16 border-b border-white/[0.08]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto space-y-2.5 mb-10"
          >
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs font-semibold">
              Simple 3-Step Flow
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              How You Practice With MIRAL
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Interactive Visual Screen Preview */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 lg:sticky lg:top-20 space-y-3"
            >
              <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.08]">
                  <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">
                    Step {activeTourStep} of 3 • {activeTourStep === 1 ? "Practice Notes & Warmup" : activeTourStep === 2 ? "Live Real-Time Monitoring" : "Instant Diagnostic Report"}
                  </span>
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                </div>

                {/* State 1: Teleprompter Mockup */}
                {activeTourStep === 1 && (
                  <div className="space-y-3 animate-in fade-in duration-300 text-left">
                    <div className="p-3.5 rounded-xl bg-[#090b10] border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Teleprompter & Script Notes</span>
                        <span className="text-[10px] font-mono text-indigo-400">A- | A+ 14px</span>
                      </div>
                      <p className="text-xs text-slate-300 italic bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.06]">
                        "1. Introduce your background clearly.<br/>2. Highlight your key technical achievements.<br/>3. Conclude with why you are excited about this role."
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs flex items-center gap-2">
                      <Wind className="h-4 w-4 shrink-0" />
                      <span>Includes 60-Second Anti-Anxiety Breathing Warmup before you start</span>
                    </div>
                  </div>
                )}

                {/* State 2: Live Monitoring HUD Mockup */}
                {activeTourStep === 2 && (
                  <div className="space-y-3 animate-in fade-in duration-300 text-left">
                    <div className="p-3.5 rounded-xl bg-[#090b10] border border-white/[0.08] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Live Camera HUD</span>
                        <Badge variant="default" className="text-[10px] bg-emerald-600">Recording</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06]">
                          <span className="text-[10px] text-slate-400 block">Eye Contact</span>
                          <span className="font-mono font-bold text-emerald-400">94% Direct Gaze</span>
                        </div>
                        <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06]">
                          <span className="text-[10px] text-slate-400 block">Pacing</span>
                          <span className="font-mono font-bold text-emerald-400">142 WPM (Optimal)</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Instant visual alerts if your eye contact drops or you slouch</span>
                    </div>
                  </div>
                )}

                {/* State 3: Diagnostic Report Mockup */}
                {activeTourStep === 3 && (
                  <div className="space-y-3 animate-in fade-in duration-300 text-left">
                    <div className="p-3.5 rounded-xl bg-[#090b10] border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Scorecard & Word Upgrades</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">Score: 91/100</span>
                      </div>
                      <div className="p-2 rounded bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
                        <span className="text-[10px] text-slate-400 block">Suggested Vocabulary Upgrade:</span>
                        <div className="text-slate-200">
                          "worked on" &rarr; <strong className="text-indigo-400">"spearheaded / built"</strong>
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 shrink-0" />
                      <span>Instant feedback on strengths, improvements, and printable PDF report</span>
                    </div>
                  </div>
                )}

                <Link href="/practice">
                  <Button className="w-full text-xs font-semibold h-9 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Try It in Practice Mode</span>
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Interactive Step Cards */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-6 space-y-4 text-left"
            >
              
              {/* Step 1 Card */}
              <div 
                onMouseEnter={() => setActiveTourStep(1)}
                onClick={() => setActiveTourStep(1)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeTourStep === 1 
                    ? 'border-indigo-500/60 bg-white/[0.06] shadow-md' 
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                    01
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Pick a Question or Paste Your Notes</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose from our curated practice questions or paste your own presentation notes directly into the live teleprompter.
                </p>
              </div>

              {/* Step 2 Card */}
              <div 
                onMouseEnter={() => setActiveTourStep(2)}
                onClick={() => setActiveTourStep(2)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeTourStep === 2 
                    ? 'border-indigo-500/60 bg-white/[0.06] shadow-md' 
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                    02
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Speak Naturally with Live Guidance</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As you speak, in-browser AI tracks your eye contact, posture, speaking speed (WPM), and filler words with instant cues.
                </p>
              </div>

              {/* Step 3 Card */}
              <div 
                onMouseEnter={() => setActiveTourStep(3)}
                onClick={() => setActiveTourStep(3)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  activeTourStep === 3 
                    ? 'border-indigo-500/60 bg-white/[0.06] shadow-md' 
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center">
                    03
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Get Instant Performance Report</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Receive an immediate scorecard with your overall confidence rating, vocabulary improvements, and actionable tips.
                </p>
              </div>

            </motion.div>

          </div>

        </div>
      </section>

      {/* ===================== CORE FEATURES GRID ===================== */}
      <section className="py-12 md:py-16 border-b border-white/[0.08]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto space-y-2.5 mb-10"
          >
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs font-semibold">
              Key Features
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Everything You Need to Master Speaking
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left">
            
            {[
              {
                icon: Eye,
                title: "Eye Contact Tracking",
                desc: "Tracks your pupil direction in real time to ensure you maintain direct, confident connection with your audience."
              },
              {
                icon: Activity,
                title: "Posture Alignment",
                desc: "Calibrated for laptop webcams so you maintain an upright, confident presence without false slouching alerts."
              },
              {
                icon: Volume2,
                title: "Speaking Speed (WPM)",
                desc: "Measures your words-per-minute pace in real time, helping you speak at a clear 130–155 WPM conversational speed."
              },
              {
                icon: BookOpen,
                title: "Vocabulary Upgrades",
                desc: "Automatically suggests stronger professional words for everyday casual phrases to make your answers stand out."
              },
              {
                icon: Wind,
                title: "60-Second Anti-Anxiety Warmup",
                desc: "Quick box-breathing and vocal articulation exercises to calm nerves and eliminate stage fear before you speak."
              },
              {
                icon: BarChart3,
                title: "Comprehensive Session Report",
                desc: "Instant breakdown of your confidence score, duration, pacing trends, strengths, and specific areas to polish."
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all space-y-2.5 shadow-sm"
                >
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}

          </div>

        </div>
      </section>

      {/* ===================== FAQ ACCORDION SECTION ===================== */}
      <section className="py-12 md:py-16 border-b border-white/[0.08]">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2.5 mb-10"
          >
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs font-semibold">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Questions & Answers
            </h2>
          </motion.div>

          <div className="space-y-3">
            {[
              {
                q: "Is my webcam video or microphone audio saved anywhere?",
                a: "No. MIRAL processes your camera feed and speech 100% locally inside your browser. No video recordings are ever uploaded or saved to any external servers."
              },
              {
                q: "Which browser works best?",
                a: "Google Chrome, Microsoft Edge, and Safari provide the smoothest camera tracking and real-time speech recognition."
              },
              {
                q: "How does MIRAL measure Eye Contact?",
                a: "MIRAL tracks your pupil position relative to your eye boundaries and head position. Looking straight at your screen or camera maintains an optimal 88%–95% score."
              },
              {
                q: "Can I use MIRAL for placements and interviews?",
                a: "Yes! MIRAL includes curated questions for Campus Placements, HR rounds, technical project presentations, and group discussions."
              }
            ].map((faq, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="border border-white/[0.08] rounded-xl bg-white/[0.03] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-white hover:bg-white/[0.04] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${faqOpen === idx ? 'rotate-90 text-indigo-400' : ''}`} />
                </button>
                {faqOpen === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/[0.06] pt-3 bg-black/20">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="py-14 md:py-20 relative overflow-hidden text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-5 relative z-10"
        >
          
          <div className="inline-flex items-center gap-1 text-indigo-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-indigo-400" />
            ))}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Ready to Speak with Supreme Confidence?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Practice for your next placement interview, presentation, or speech in a completely private environment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/practice">
              <Button size="lg" className="w-full sm:w-auto text-xs font-semibold h-11 px-7 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25">
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Launch Free Practice Session</span>
              </Button>
            </Link>

            <Link href="/scenarios">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-xs font-semibold h-11 px-5 gap-2 border-white/15 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08]">
                <Compass className="h-3.5 w-3.5 text-indigo-400" />
                <span>Browse Practice Scenarios</span>
              </Button>
            </Link>
          </div>

        </motion.div>
      </section>

    </div>
  );
}
