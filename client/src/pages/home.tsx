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
  Lock
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
    "Clear communication isn't about using complex vocabulary; it's about structuring your ideas so the audience retains every key argument with zero cognitive fatigue.",
    "During the Q3 sprint, our engineering team resolved a critical database bottleneck, improving system response latency by forty-two percent under peak load.",
    "Great leaders do not rush their answers. They take a deliberate one-second breath, maintain direct forward eye contact, and articulate with conviction."
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
      desc: "Practice behavioral questions (STAR method), resume walkthroughs, and executive presence under interview pressure.",
      badge: "Placement Drive",
      microStat: "STAR Method • 92% Gaze Target",
      metrics: { eye: "92%", pace: "138 WPM", posture: "Upright (94%)", fillers: "0 detected" },
      prompt: "Tell me about a challenging project where you resolved a critical bottleneck under tight deadlines."
    },
    {
      title: "Startup Investor Pitch",
      short: "Investor Pitch",
      desc: "Deliver high-stakes investor decks, market opportunity sizing, and unit economics with assertive conviction.",
      badge: "High Stakes",
      microStat: "Elevator Pitch • 148 WPM",
      metrics: { eye: "95%", pace: "148 WPM", posture: "Confident (96%)", fillers: "1 detected" },
      prompt: "Walk us through your target addressable market and why incumbents cannot easily replicate your moat."
    },
    {
      title: "Parliamentary Debate",
      short: "Debate & MUN",
      desc: "Sharpen persuasive rhetoric, cross-examination rebuttals, and rapid argumentative structuring.",
      badge: "Public Debate",
      microStat: "Rhetoric Drill • 155 WPM",
      metrics: { eye: "89%", pace: "155 WPM", posture: "Engaged (91%)", fillers: "0 detected" },
      prompt: "Present a 60-second opening statement on algorithmic transparency in global financial systems."
    },
    {
      title: "Executive Townhall",
      short: "Leadership",
      desc: "Master executive storytelling, pause management, and empathetic team alignment.",
      badge: "Executive",
      microStat: "Storytelling • 132 WPM",
      metrics: { eye: "94%", pace: "132 WPM", posture: "Steadfast (95%)", fillers: "0 detected" },
      prompt: "Address the team regarding our Q3 strategic pivot while sustaining high morale and alignment."
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

      {/* ===================== HERO SECTION (MERGED ABOVE-THE-FOLD) ===================== */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 border-b border-white/[0.08] overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Staggered Hero Copy & CTAs */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12 }
                }
              }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              
              {/* Badge */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold backdrop-blur-xl shadow-xs"
              >
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>MIRAL 2.0 • Real-Time Vision & Speech Intelligence</span>
              </motion.div>

              {/* Main Headline */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                className="space-y-2"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                  Speak with <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">Unshakeable Confidence.</span>
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-300 via-violet-300 to-blue-300 bg-clip-text text-transparent">
                  Powered by Real-Time Vision & Voice AI.
                </p>
              </motion.div>

              {/* Subtitle */}
              <motion.p 
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl"
              >
                Stop practicing in front of a mute mirror. MIRAL tracks your <strong className="text-white font-semibold">eye contact</strong>, <strong className="text-white font-semibold">seated posture</strong>, <strong className="text-white font-semibold">speaking pace (WPM)</strong>, and <strong className="text-white font-semibold">filler words</strong> with sub-pixel vision AI — completely private in your browser.
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                className="flex flex-col sm:flex-row items-center gap-3 pt-2"
              >
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
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
                className="pt-4 flex flex-wrap items-center gap-5 text-xs text-slate-400 border-t border-white/[0.08]"
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-200 font-medium">100% In-Browser Privacy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-200 font-medium">Zero Latency Telemetry</span>
                </div>
              </motion.div>

            </motion.div>

            {/* Right Column: Floating Glass Simulator Card (Always Visible Above-The-Fold) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: [0, -6, 0]
              }}
              transition={{ 
                duration: 0.7, 
                ease: "easeOut",
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="lg:col-span-6 relative"
            >
              <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-2xl p-4 sm:p-5 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] relative overflow-hidden">
                
                {/* Header & Simulator Mode Switcher */}
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-400 ml-1">
                      miral // {activeTab === 'stream' ? 'vision_iris_mesh' : 'vocal_tempo_sandbox'}
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
                      Vision Mesh
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
                      WPM Tempo
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
                            {isCameraActive ? "Live In-Browser Webcam" : "468 Iris Mesh Target"}
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
                            GAZE LOCK: {scenarios[activeScenarioIdx].metrics.eye} • {scenarios[activeScenarioIdx].metrics.posture}
                          </div>
                          <p className="text-xs text-slate-300 italic max-w-xs leading-tight">
                            "{scenarios[activeScenarioIdx].prompt}"
                          </p>
                        </div>
                      )}

                      {/* Bottom Footer */}
                      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.08] pt-2">
                        <span className="text-emerald-400 font-medium">Eye Level Centered</span>
                        <span className="font-mono text-[10px] text-slate-500">60 FPS WebAssembly</span>
                      </div>
                    </div>

                    {/* Quick Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <span className="text-[10px] text-slate-400 font-medium block">Audience Gaze</span>
                        <span className="text-sm font-bold font-mono text-white tabular-nums">{scenarios[activeScenarioIdx].metrics.eye}</span>
                      </div>
                      <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <span className="text-[10px] text-slate-400 font-medium block">Speaking Pace</span>
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
                        <span className="font-mono">Passage {paceTextIndex + 1} of {samplePassages.length}</span>
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
                        <span className="text-xs font-semibold text-slate-300">Tempo Gauge:</span>
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
                            {interactiveWpm < 120 ? 'Too Slow' : interactiveWpm <= 155 ? 'Optimal Retention' : 'Too Fast'}
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
                        <span>80 WPM (Sluggish)</span>
                        <span className="text-emerald-400 font-bold">130–155 WPM (Optimal)</span>
                        <span>220 WPM (Rushed)</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>

          </div>

          {/* Scenario Chips with Hover Micro-Stats (Staggered Entrance) */}
          <div className="mt-12 pt-6 border-t border-white/[0.08]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-3 text-center sm:text-left">
              Tailored Practice Domains:
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
      <section ref={transformRef} className="py-20 md:py-28 border-b border-white/[0.08] relative">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs font-semibold">
              Live Scroll-Scrubbed Telemetry
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              The Measurable MIRAL Transformation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Scroll down to scrub live metrics from unmonitored baseline to objective AI-guided delivery.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-8">
            
            {/* Top Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400">STATE STATUS:</span>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  {displayEye >= 75 ? (
                    <>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400">With MIRAL (Objective Mastery)</span>
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
                {displayEye >= 75 ? 'Placement & Executive Ready' : 'Nervous Tells Present'}
              </Badge>
            </div>

            {/* 4 Scrubbed Metric Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Metric 1: Eye Focus */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Forward Audience Gaze</span>
                  <span className="font-mono font-bold text-white text-base tabular-nums">{displayEye}%</span>
                </div>
                <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-150 ${displayEye >= 75 ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${displayEye}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {displayEye >= 75 ? 'Centered direct contact with audience & camera lens' : 'Looking away at notes or ceiling under pressure'}
                </p>
              </div>

              {/* Metric 2: WPM Cadence */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Speaking Cadence</span>
                  <span className="font-mono font-bold text-white text-base tabular-nums">{displayWpm} WPM</span>
                </div>
                <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-150 ${displayWpm <= 155 ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${Math.min((displayWpm / 200) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  {displayWpm <= 155 ? 'Optimal conversational rhythm with deliberate retention pauses' : 'Adrenaline rush making complex points hard to absorb'}
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
                  {displayFillers <= 2 ? 'Disciplined silent breathing between arguments' : 'Repetitive um, like, matlab, basically filling silence'}
                </p>
              </div>

              {/* Metric 4: Posture */}
              <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Posture Alignment</span>
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
                  {displayEye >= 75 ? 'Level shoulders and chin elevation for webcam framing' : 'Sinking in chair projecting uncertainty and low presence'}
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===================== PINNED-PANEL PRODUCT TOUR (DISCORD / GITHUB STYLE) ===================== */}
      <section className="py-20 md:py-28 border-b border-white/[0.08]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs font-semibold">
              Interactive Product Tour
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              How MIRAL Works In Practice
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sticky Panel */}
            <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-white/[0.12] bg-white/[0.04] backdrop-blur-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <span className="text-xs font-mono text-indigo-400 font-semibold uppercase">
                    Tour Step {activeTourStep} / 3: {activeTourStep === 1 ? "Prompt & Notes Setup" : activeTourStep === 2 ? "Live Real-Time Monitoring" : "360° Diagnostic Report"}
                  </span>
                  <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                </div>

                {/* State 1: Prompt & Scripting */}
                {activeTourStep === 1 && (
                  <div className="space-y-3 animate-in fade-in duration-300 text-left">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                      <div className="text-xs font-semibold text-white">Built-In Teleprompter & Custom Scripts</div>
                      <p className="text-xs text-slate-300 italic">
                        "Paste your presentation notes, choose custom font sizes, or select from curated Placement & Leadership prompts."
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs flex items-center gap-2">
                      <Wind className="h-4 w-4 shrink-0" />
                      <span>Includes 60-Second Anti-Anxiety Box Breathing Warmup</span>
                    </div>
                  </div>
                )}

                {/* State 2: Live Monitoring */}
                {activeTourStep === 2 && (
                  <div className="space-y-3 animate-in fade-in duration-300 text-left">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Live On-Screen Cues</span>
                        <Badge variant="default" className="text-[10px] bg-emerald-600">Active Audit</Badge>
                      </div>
                      <div className="text-xs text-emerald-400 font-mono">
                        Direct Focus: 94% • Pace: 142 WPM • Slouching: None
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Instant subtle nudges when gaze drifts away from the camera lens</span>
                    </div>
                  </div>
                )}

                {/* State 3: Diagnostic Report */}
                {activeTourStep === 3 && (
                  <div className="space-y-3 animate-in fade-in duration-300 text-left">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
                      <div className="text-xs font-semibold text-white">Executive Phrasing & Vocabulary Upgrades</div>
                      <p className="text-xs text-slate-300">
                        Translates colloquial terms ("worked on it") &rarr; assertive phrasing ("spearheaded / architected").
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 shrink-0" />
                      <span>Instant printable session summary with timeline charts</span>
                    </div>
                  </div>
                )}

                <Link href="/practice">
                  <Button className="w-full text-xs font-semibold h-10 gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Launch Free Practice Session</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Scrolling Steps */}
            <div className="lg:col-span-6 space-y-8 text-left">
              
              {/* Step 1 Card */}
              <div 
                onMouseEnter={() => setActiveTourStep(1)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  activeTourStep === 1 
                    ? 'border-indigo-500/60 bg-white/[0.06] shadow-md' 
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center">
                    01
                  </div>
                  <h3 className="text-base font-bold text-white">Pick a Topic, Prompt, or Custom Script</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Select from our curated industry question bank or paste your own keynote notes directly into the live teleprompter with customizable font size.
                </p>
              </div>

              {/* Step 2 Card */}
              <div 
                onMouseEnter={() => setActiveTourStep(2)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  activeTourStep === 2 
                    ? 'border-indigo-500/60 bg-white/[0.06] shadow-md' 
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center">
                    02
                  </div>
                  <h3 className="text-base font-bold text-white">Speak Naturally with Real-Time Feedback</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As you speak, in-browser computer vision monitors your pupil angle and posture, while continuous speech transcription measures your WPM tempo and counts hesitations.
                </p>
              </div>

              {/* Step 3 Card */}
              <div 
                onMouseEnter={() => setActiveTourStep(3)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  activeTourStep === 3 
                    ? 'border-indigo-500/60 bg-white/[0.06] shadow-md' 
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-sm flex items-center justify-center">
                    03
                  </div>
                  <h3 className="text-base font-bold text-white">Review 360° Diagnostic Performance Audit</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Receive an instant session scorecard complete with composite confidence score, vocabulary polishing suggestions, timeline trends, and actionable speech drills.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===================== CORE DEEP-TECH CAPABILITIES ===================== */}
      <section className="py-20 md:py-28 border-b border-white/[0.08]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs font-semibold">
              Engineered for Precision
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white">
              Everything Needed for Communication Mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {[
              {
                icon: Eye,
                title: "Sub-Pixel Iris Tracking",
                desc: "468-point facial mesh measures exact pupil coordinates to evaluate true camera engagement rather than just head direction."
              },
              {
                icon: Activity,
                title: "Seated Posture Stabilization",
                desc: "Calibrated specifically for laptop webcam angles (up to 11° roll & tilt) to eliminate false slouch flags while promoting upright poise."
              },
              {
                icon: Volume2,
                title: "Live Speaking Pace (WPM)",
                desc: "Real-time speech recognition tracks syllable rate, guiding you to a steady 130–155 WPM conversational sweet spot."
              },
              {
                icon: BookOpen,
                title: "Executive Phrasing Upgrades",
                desc: "ESL bridge engine replaces informal expressions with assertive boardroom terminology for maximum professional impact."
              },
              {
                icon: Wind,
                title: "60-Second Anti-Anxiety Warmup",
                desc: "Interactive box-breathing rhythm followed by phonetic vocal articulation drills to eliminate stage nervousness before you speak."
              },
              {
                icon: BarChart3,
                title: "360° Diagnostic Performance Audit",
                desc: "Instant actionable report with composite confidence rating, detailed timeline graphs, strengths, and targeted improvement drills."
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all space-y-3 shadow-sm"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* Reserved Slot for Pilot Testimonials (Hidden for Now) */}
      <div id="pilot-testimonials-slot" className="hidden" aria-hidden="true" />

      {/* ===================== FAQ ACCORDION SECTION ===================== */}
      <section className="py-20 md:py-28 border-b border-white/[0.08]">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-3 mb-12">
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-400 text-xs font-semibold">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Everything You Need to Know About MIRAL
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Is my webcam video or microphone audio stored on any servers?",
                a: "No. MIRAL processes your video and pupil gaze 100% locally in your web browser via WebAssembly. No raw video feed is ever recorded, transmitted, or saved to any cloud storage."
              },
              {
                q: "Which browsers provide the best experience?",
                a: "Google Chrome, Microsoft Edge, and Safari provide the smoothest WebAssembly vision inference and continuous Web Speech transcription."
              },
              {
                q: "How does the Eye Contact metric calculate focus?",
                a: "MIRAL tracks your sub-pixel iris centering relative to your eye boundaries and head yaw angle. Looking directly at the camera or upper screen maintains an optimal 88%–95% direct focus score."
              },
              {
                q: "Is MIRAL suitable for non-native English speakers (ESL)?",
                a: "Yes! MIRAL includes a dedicated Executive Vocabulary Upgrade engine that automatically suggests formal, high-impact phrasing alternatives for common ESL expressions."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
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
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="py-20 md:py-28 relative overflow-hidden text-center">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-1 text-indigo-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-indigo-400" />
            ))}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Ready to Speak with Supreme Confidence?
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Join students, debaters, and professionals preparing for upcoming interviews and high-stakes presentations.
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

        </div>
      </section>

    </div>
  );
}
