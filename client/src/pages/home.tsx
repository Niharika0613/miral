// client/src/pages/home.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Video, 
  Sparkles, 
  Eye, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Play, 
  Zap, 
  BookOpen, 
  Compass, 
  Award, 
  ChevronRight, 
  HelpCircle, 
  Flame, 
  Check, 
  Star, 
  LogIn, 
  Camera, 
  Mic, 
  Sliders, 
  Gauge, 
  MonitorPlay, 
  FileCheck2, 
  Lock, 
  MessageSquare,
  Users,
  Building2,
  Brain,
  Code2,
  Terminal,
  Cpu,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/utils/auth';

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  
  // Interactive Simulator State
  const [activeSimTab, setActiveSimTab] = useState<'camera' | 'wpm'>('camera');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Interactive Speech Pace Slider
  const [interactiveWpm, setInteractiveWpm] = useState(142);
  const [paceTextIndex, setPaceTextIndex] = useState(0);

  // Role Tracks Navigation (Aced.io Style)
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);

  // Before & After Phrasing Example Tab
  const [activePhrasingIdx, setActivePhrasingIdx] = useState(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Cleanup camera stream
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
        setCameraError("Camera access not enabled. You can still test the interactive simulator below!");
      }
    }
  };

  const samplePassages = [
    "Good communication is about structuring your core points clearly so the interviewer stays engaged throughout your response.",
    "During my final year project, our team solved a major latency bottleneck, improving API throughput by 35% under load.",
    "Confident candidates don't rush. They pause calmly before answering, look directly at the lens, and articulate with steady clarity."
  ];

  const roleTracks = [
    {
      id: "campus-hr",
      name: "Campus Placement HR",
      icon: Users,
      badge: "Placement Season 2026",
      tagline: "Ace HR rounds, self-introductions, and behavioral situational questions.",
      targetCompanies: ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "Deloitte"],
      sampleQuestion: "Tell me about a challenging situation where your project team faced conflicting opinions and how you reached alignment.",
      difficulty: "High Frequency",
      targetMetrics: { eye: "88%+", pace: "135–150 WPM", posture: "Upright (90%+)", fillers: "0–1 max" },
      tips: ["Structure using STAR method", "Maintain direct eye contact during the resolution phase", "Avoid fillers like 'basically'"]
    },
    {
      id: "swe",
      name: "Software Engineering",
      icon: Code2,
      badge: "Tech Loops",
      tagline: "Articulate algorithms, trade-offs, edge cases, and code walkthroughs.",
      targetCompanies: ["Google", "Amazon", "Microsoft", "Flipkart", "Uber", "Oracle"],
      sampleQuestion: "Walk me through how you would optimize a high-throughput cache for a distributed microservice architecture under memory constraints.",
      difficulty: "Technical Loop",
      targetMetrics: { eye: "85%+", pace: "130–145 WPM", posture: "Calm & Engaged", fillers: "0 detected" },
      tips: ["State time/space complexity upfront", "Think out loud without rushing", "Explain why alternative approaches were rejected"]
    },
    {
      id: "system-design",
      name: "System Design & Architecture",
      icon: Cpu,
      badge: "Architecture Round",
      tagline: "Design scalable backends, database sharding, and fault-tolerant cloud systems.",
      targetCompanies: ["Meta", "Amazon", "Netflix", "Swiggy", "Zomato", "Razorpay"],
      sampleQuestion: "Design a real-time notification service handling 10 million active websocket connections with sub-100ms latency.",
      difficulty: "Senior / High Scale",
      targetMetrics: { eye: "90%+", pace: "125–140 WPM", posture: "Authoritative", fillers: "0 detected" },
      tips: ["Establish functional vs non-functional requirements first", "Back-of-the-envelope calculations", "Identify single points of failure"]
    },
    {
      id: "behavioral",
      name: "Leadership & Behavioral",
      icon: Brain,
      badge: "Amazon LP / C-Suite",
      tagline: "Demonstrate ownership, executive communication, and crisis management.",
      targetCompanies: ["Amazon", "Apple", "Salesforce", "Goldman Sachs", "McKinsey"],
      sampleQuestion: "Tell me about a time you made a critical technical mistake that impacted production, and how you communicated it to leadership.",
      difficulty: "Core Competency",
      targetMetrics: { eye: "92%+", pace: "135–148 WPM", posture: "Confident & Open", fillers: "0 detected" },
      tips: ["Own the mistake with zero deflection", "Highlight root cause analysis and preventative guardrails", "Demonstrate emotional maturity"]
    },
    {
      id: "startup-pitch",
      name: "Project & Startup Pitch",
      icon: Flame,
      badge: "Pitch Deck / Hackathon",
      tagline: "Captivate judges, investors, and recruiters with crisp storytelling and energy.",
      targetCompanies: ["Y Combinator", "Sequoia", "Antler", "Techstars", "Campus Incubator"],
      sampleQuestion: "Explain your project's unique value proposition in 60 seconds and why existing market solutions fall short.",
      difficulty: "High Energy",
      targetMetrics: { eye: "95%+", pace: "145–160 WPM", posture: "Dynamic & Upright", fillers: "0 detected" },
      tips: ["Hook the listener in the first 10 seconds", "Quantify market problem before technical solution", "End with a memorable call-to-action"]
    }
  ];

  const phrasingComparisons = [
    {
      context: "Project Contribution Walkthrough",
      colloquial: "Actually basically in our final year project we were having 4 members and matlab I did the whole backend part and passout this year...",
      flaws: ["Overused fillers ('actually', 'basically', 'matlab')", "Passive colloquial phrasing ('we were having')", "Unclear impact"],
      executive: "In our capstone initiative, I spearheaded the distributed backend architecture across a 4-engineer team, reducing API response latency by 35% and delivering production deployment ahead of schedule.",
      improvements: ["Active leadership verbs ('spearheaded', 'delivering')", "Quantified technical outcome (35% latency reduction)", "Crisp executive cadence"]
    },
    {
      context: "Handling Technical Disagreements",
      colloquial: "My teammate was not doing things properly and he wanted SQL but I said No SQL is better so we had argument and finally teacher agreed with me...",
      flaws: ["Blaming teammate ('not doing properly')", "Unprofessional phrasing ('had argument')", "Lacks structured engineering evaluation"],
      executive: "When evaluating data storage layers, our team debated between relational and document databases. I prepared a benchmark prototype comparing query latency under heavy write loads, which helped our team reach consensus on a NoSQL architecture.",
      improvements: ["Objective data-driven resolution", "Collaborative leadership mindset", "Highlights structured prototyping"]
    },
    {
      context: "Self-Introduction for Tech Roles",
      colloquial: "Myself Rahul, I am having 8.2 CGPA and passout from computer science. I know Java, Python, C++, HTML, CSS, React and everything...",
      flaws: ["Grammatical anti-pattern ('Myself Rahul')", "Outdated phrasing ('I am having CGPA')", "Laundry list of keywords with zero depth"],
      executive: "I'm Rahul, a software engineering graduate specializing in scalable backend systems. Over the past two years, I've engineered full-stack applications with React and Python, focusing on performance optimization and reliable cloud infrastructure.",
      improvements: ["Clear professional positioning", "Highlights specialization over generic buzzwords", "Immediate credibility and focus"]
    }
  ];

  const faqs = [
    {
      q: "How does Miral's AI camera vision and gaze tracking work?",
      a: "Miral uses Native Chromium Computer Vision and lightweight TensorFlow models executing 100% inside your browser via WebAssembly. It tracks your iris direction, facial orientation, and posture alignment at 60 FPS in real time with zero server lag."
    },
    {
      q: "Are my practice videos or audio recordings saved on your servers?",
      a: "No! All video frames and vision inference happen 100% locally on your device. Video frames never leave your computer or phone, ensuring complete privacy while you practice."
    },
    {
      q: "Does Miral work on mobile phones (Android and iPhone)?",
      a: "Yes! Miral is fully optimized for mobile devices. On mobile Chrome and iOS Safari, the speech engine uses a persistent chunk buffer and cross-platform audio codecs so your voice and speech metrics are accurately captured."
    },
    {
      q: "What is the Ideal Speaking Pace (WPM) for interviews?",
      a: "In professional tech and campus placement interviews, the optimal pacing range is 130 to 155 Words Per Minute (WPM). Speaking faster than 170 WPM makes you sound nervous, while under 115 WPM leads to disengagement."
    },
    {
      q: "What is the ESL & Executive AI Rephrasing Coach?",
      a: "It is an intelligent coaching system designed specifically for Indian college students and engineers. It automatically detects common hesitation patterns (such as 'actually basically', 'myself [Name]', 'passout candidate') and provides articulate C-suite alternatives."
    },
    {
      q: "Is Miral free to use for campus placement preparation?",
      a: "Yes! You can practice unlimited questions, use the custom teleprompter, and receive complete real-time vision and speech diagnostics for free."
    }
  ];

  const handleLaunchTrackQuestion = (track: typeof roleTracks[0]) => {
    sessionStorage.setItem('practiceQuestion', JSON.stringify({
      question: track.sampleQuestion,
      outline: track.tips
    }));
    sessionStorage.setItem('preferredTopic', track.name);
    setLocation('/practice');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#07080d] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      
      {/* Ambient Aurora Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(circle,rgba(99,102,241,0.18)_0%,rgba(139,92,246,0.10)_45%,rgba(6,182,212,0.04)_70%,transparent_100%)] blur-[130px] rounded-full" />
        <div className="absolute top-[45%] right-[-10%] w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,rgba(99,102,241,0.06)_50%,transparent_100%)] blur-[140px] rounded-full" />
        <div className="absolute top-[80%] left-[-10%] w-[700px] h-[600px] bg-[radial-gradient(circle,rgba(59,130,246,0.12)_0%,rgba(99,102,241,0.06)_50%,transparent_100%)] blur-[140px] rounded-full" />
      </div>

      {/* ===================== HERO SECTION (Aced.io Inspired) ===================== */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 border-b border-white/[0.08] overflow-hidden">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Hero Content */}
            <motion.div 
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              {/* Product Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold backdrop-blur-xl shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>#1 AI Interview Practice Mirror • Placement Season 2026</span>
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.10]">
                  Ace your tech interviews & <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">placement drives.</span>
                </h1>
                <p className="text-lg sm:text-2xl font-semibold text-slate-300 leading-snug">
                  Real-time AI feedback on your <span className="text-white underline decoration-indigo-500/60 decoration-2 underline-offset-4">eye contact</span>, <span className="text-white underline decoration-violet-500/60 decoration-2 underline-offset-4">posture</span>, <span className="text-white underline decoration-cyan-500/60 decoration-2 underline-offset-4">speaking cadence</span>, and speech clarity.
                </p>
              </div>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
                Practice 1,000+ top campus placement and tech interview questions. Miral gives you instant in-browser diagnostics on how you look and sound before you step into your real interview — 100% private with zero server video recording.
              </p>

              {/* High-Converting CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link href="/practice">
                  <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-12 px-7 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all">
                    <Play className="h-4 w-4 fill-current" />
                    <span>Start Practicing for Free</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>

                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={toggleLiveCamera}
                  className="w-full sm:w-auto text-sm font-semibold h-12 px-6 gap-2 border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200"
                >
                  <Camera className="h-4 w-4 text-indigo-400" />
                  <span>{isCameraActive ? "Stop Camera Preview" : "Test Live Webcam HUD"}</span>
                </Button>

                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" variant="ghost" className="w-full sm:w-auto text-sm font-medium h-12 px-4 gap-1.5 text-slate-400 hover:text-white">
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button size="lg" variant="ghost" className="w-full sm:w-auto text-sm font-medium h-12 px-4 gap-1.5 text-slate-400 hover:text-white">
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-300 font-medium">100% In-Browser Privacy</span>
                  <span>(Zero video stored)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-300 font-medium">Instant 60 FPS Feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-slate-300 font-medium">4.9/5 Rating</span>
                  <span>(50,000+ Sessions)</span>
                </div>
              </div>

            </motion.div>

            {/* Right Hero: Live Interactive Product HUD Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative"
            >
              <div className="rounded-2xl border border-white/[0.12] bg-[#0c0e17]/80 backdrop-blur-2xl p-5 shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)] relative overflow-hidden">
                
                {/* Simulator Window Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-400 ml-1.5">
                      miral // {activeSimTab === 'camera' ? 'live_vision_radar' : 'speech_tempo_meter'}
                    </span>
                  </div>

                  {/* Mode Switcher */}
                  <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-lg border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setActiveSimTab('camera')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                        activeSimTab === 'camera'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Vision Radar
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSimTab('wpm')}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all ${
                        activeSimTab === 'wpm'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Speaking Speed
                    </button>
                  </div>
                </div>

                {cameraError && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
                    <span>{cameraError}</span>
                    <Button size="sm" variant="ghost" className="h-5 text-[10px] px-1.5" onClick={() => setCameraError(null)}>✕</Button>
                  </div>
                )}

                {/* Tab 1: Vision Radar / Live Camera */}
                {activeSimTab === 'camera' ? (
                  <div className="space-y-3.5 mt-3.5">
                    <div className="rounded-xl bg-[#090b12] border border-white/[0.08] p-4 relative min-h-[230px] flex flex-col justify-between overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-25" />

                      {/* Header in Radar */}
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-black/70 border border-white/10 px-2.5 py-1 rounded-md text-[11px]">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="font-semibold text-slate-200">
                            {isCameraActive ? "Live In-Browser Webcam" : "Active Eye Gaze HUD"}
                          </span>
                        </div>
                        <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-[10px]">
                          92% Focus Score
                        </Badge>
                      </div>

                      {/* Center Display */}
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
                          <div className="h-20 w-20 rounded-full border border-indigo-500/40 flex items-center justify-center relative animate-pulse">
                            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/50 animate-spin" style={{ animationDuration: '8s' }} />
                            <div className="h-12 w-12 rounded-full border border-emerald-400/60 flex items-center justify-center bg-emerald-500/10">
                              <Eye className="h-6 w-6 text-emerald-400" />
                            </div>
                          </div>
                          <div className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
                            EYE FOCUS: 94% • UPRIGHT POSTURE (96%)
                          </div>
                          <p className="text-xs text-slate-400 italic max-w-xs leading-tight">
                            "Position your eyes towards the camera to project confidence."
                          </p>
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-400 border-t border-white/[0.08] pt-2">
                        <span className="text-emerald-400 font-medium">Iris Reticle Locked</span>
                        <span className="font-mono text-[10px] text-slate-500">60 FPS WebAssembly</span>
                      </div>
                    </div>

                    {/* Quick Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 text-left">
                      <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <span className="text-[10px] text-slate-400 font-medium block">Eye Focus</span>
                        <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">94% Target</span>
                      </div>
                      <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <span className="text-[10px] text-slate-400 font-medium block">Posture</span>
                        <span className="text-sm font-bold font-mono text-indigo-300 tabular-nums">Upright (96%)</span>
                      </div>
                      <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                        <span className="text-[10px] text-slate-400 font-medium block">Fillers</span>
                        <span className="text-sm font-bold font-mono text-cyan-400 tabular-nums">0 detected</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Tab 2: WPM Speed Sandbox */
                  <div className="space-y-3.5 mt-3.5 text-left">
                    <div className="p-3.5 rounded-xl bg-[#090b12] border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/[0.08]">
                        <span className="font-mono">Sample Passage {paceTextIndex + 1} of {samplePassages.length}</span>
                        <button
                          type="button"
                          onClick={() => setPaceTextIndex((prev) => (prev + 1) % samplePassages.length)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs"
                        >
                          Next Passage →
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 italic leading-relaxed">
                        "{samplePassages[paceTextIndex]}"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300">Speaking Speed:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold font-mono text-white tabular-nums">{interactiveWpm} WPM</span>
                          <Badge 
                            variant="outline"
                            className={`text-[10px] ${
                              interactiveWpm >= 130 && interactiveWpm <= 155 
                                ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' 
                                : 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {interactiveWpm < 125 ? 'Too Slow' : interactiveWpm <= 155 ? 'Ideal Retention' : 'Too Fast'}
                          </Badge>
                        </div>
                      </div>

                      <input 
                        type="range" 
                        min={80} 
                        max={220} 
                        value={interactiveWpm} 
                        onChange={(e) => setInteractiveWpm(Number(e.target.value))}
                        className="w-full accent-indigo-500 h-2 bg-white/10 rounded-lg cursor-pointer" 
                      />

                      <div className="flex justify-between text-[10px] font-mono text-slate-500">
                        <span>80 WPM (Hesitant)</span>
                        <span className="text-emerald-400 font-bold">130–155 WPM (Optimal)</span>
                        <span>220 WPM (Rushing)</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ===================== COMPANY LOGO TRUST MARQUEE ===================== */}
      <section className="py-8 border-b border-white/[0.08] bg-white/[0.01]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
            Candidates who practiced with Miral received offers at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'TCS', 'Infosys', 'Flipkart', 'Uber', 'Zomato'].map((company) => (
              <span key={company} className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-300">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== INTERACTIVE ROLE TRACKS (Aced.io Style) ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              Placement Preparation Tracks
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Curated for every placement & tech interview round.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Select your target track to explore real interview questions with real-time target metrics and instant AI coaching.
            </p>
          </div>

          {/* Horizontal Track Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 justify-start sm:justify-center no-scrollbar">
            {roleTracks.map((track, idx) => {
              const Icon = track.icon;
              const isActive = activeTrackIdx === idx;
              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrackIdx(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{track.name}</span>
                </button>
              );
            })}
          </div>

          {/* Active Track Showcase Card */}
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-white/[0.12] bg-[#0c0e17] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-indigo-500/15 text-indigo-300 text-xs font-mono">
                      {roleTracks[activeTrackIdx].badge}
                    </Badge>
                    <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">
                      {roleTracks[activeTrackIdx].difficulty}
                    </Badge>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white pt-1">
                    {roleTracks[activeTrackIdx].name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {roleTracks[activeTrackIdx].tagline}
                  </p>
                </div>

                <Button
                  onClick={() => handleLaunchTrackQuestion(roleTracks[activeTrackIdx])}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-6 h-11 gap-2 shrink-0 shadow-md shadow-indigo-500/25"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Practice This Question</span>
                </Button>
              </div>

              {/* Question Preview Box */}
              <div className="my-6 p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Sample Interview Question:
                </span>
                <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed italic">
                  "{roleTracks[activeTrackIdx].sampleQuestion}"
                </p>
              </div>

              {/* Target Benchmark Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <span className="text-[11px] text-slate-400 font-medium block">Eye Target Focus</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">{roleTracks[activeTrackIdx].targetMetrics.eye}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <span className="text-[11px] text-slate-400 font-medium block">Speaking Speed</span>
                  <span className="text-sm font-bold font-mono text-cyan-400">{roleTracks[activeTrackIdx].targetMetrics.pace}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <span className="text-[11px] text-slate-400 font-medium block">Posture Target</span>
                  <span className="text-sm font-bold font-mono text-indigo-300">{roleTracks[activeTrackIdx].targetMetrics.posture}</span>
                </div>
                <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <span className="text-[11px] text-slate-400 font-medium block">Filler Tolerance</span>
                  <span className="text-sm font-bold font-mono text-yellow-400">{roleTracks[activeTrackIdx].targetMetrics.fillers}</span>
                </div>
              </div>

              {/* Target Companies Strip */}
              <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium mr-2">Top Hiring Companies:</span>
                {roleTracks[activeTrackIdx].targetCompanies.map((c) => (
                  <Badge key={c} variant="outline" className="border-white/10 bg-white/[0.03] text-slate-300 text-xs">
                    {c}
                  </Badge>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ===================== THE 4 PILLARS OF INTERVIEW EXCELLENCE (Bento Grid) ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              Vision & Voice Intelligence
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything you need to sound articulate & confident.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Unlike traditional mock platforms that only test what you know, Miral coaches you on how you deliver.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 hover:border-indigo-500/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">60 FPS Gaze & Posture Tracking</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Native WebAssembly models monitor your iris direction and slouching in real time, teaching you to look directly at the interviewer's lens.
              </p>
              <div className="pt-2 text-xs font-mono text-indigo-300 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Zero server video upload</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 hover:border-violet-500/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Vocal Cadence & WPM Speed</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Tracks your speaking rhythm and automatically alerts you when you rush under nervousness or pause too long.
              </p>
              <div className="pt-2 text-xs font-mono text-violet-300 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Optimal 135–150 WPM Target</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 hover:border-cyan-500/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">ESL & Executive AI Coach</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Detects 30+ regional Hinglish filler habits and turns colloquial responses into polished C-suite executive language.
              </p>
              <div className="pt-2 text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Instant Phrasing Fixes</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 hover:border-amber-500/40 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Teleprompter & Full Reports</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Paste your custom interview script into the smart teleprompter and receive an instant multi-metric diagnostic report.
              </p>
              <div className="pt-2 text-xs font-mono text-amber-300 flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Shareable placement card</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== BEFORE & AFTER EXECUTIVE PHRASING ENGINE ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              Real Candidate Phrasing Transformations
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Transform everyday college speech into executive articulation.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              See how Miral's AI refines typical candidate answers into concise, high-impact statements that impress senior interviewers.
            </p>
          </div>

          {/* Comparison Selector Tabs */}
          <div className="flex items-center gap-2 justify-center mb-8">
            {phrasingComparisons.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhrasingIdx(idx)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                  activePhrasingIdx === idx
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                }`}
              >
                {item.context}
              </button>
            ))}
          </div>

          {/* Side-by-Side Comparison Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* Before / Flawed */}
            <div className="rounded-2xl border border-red-500/25 bg-red-950/10 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
                <Badge variant="destructive" className="bg-red-500/20 text-red-300 border-red-500/40 text-xs font-semibold">
                  ❌ Typical Candidate Phrasing
                </Badge>
                <span className="text-[11px] font-mono text-red-400">Weak Impress Score</span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 italic leading-relaxed">
                "{phrasingComparisons[activePhrasingIdx].colloquial}"
              </p>
              <div className="pt-2 space-y-1.5 border-t border-red-500/10">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Identified Flaws:</span>
                {phrasingComparisons[activePhrasingIdx].flaws.map((flaw, i) => (
                  <div key={i} className="text-xs text-red-300/90 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    <span>{flaw}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* After / Executive */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-6 space-y-4 shadow-[0_0_40px_-10px_rgba(16,185,129,0.15)]">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-semibold">
                  ✅ Miral Executive AI Rephrasing
                </Badge>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Offer-Ready (98%)</span>
              </div>
              <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                "{phrasingComparisons[activePhrasingIdx].executive}"
              </p>
              <div className="pt-2 space-y-1.5 border-t border-emerald-500/10">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Why it works:</span>
                {phrasingComparisons[activePhrasingIdx].improvements.map((imp, i) => (
                  <div key={i} className="text-xs text-emerald-300/90 flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{imp}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== HOW IT WORKS (3 Simple Steps) ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              3 Simple Steps
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              How Miral helps you master the interview room.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Zero setup required. Open the studio directly in your browser and start practicing within seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Step 1 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 text-left relative">
              <div className="text-3xl font-extrabold font-mono text-indigo-500/60">01</div>
              <h3 className="text-lg font-bold text-white">Choose Scenario or Custom Script</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Pick from Campus Placement HR, System Design, or paste your self-introduction into the smart teleprompter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 text-left relative">
              <div className="text-3xl font-extrabold font-mono text-violet-500/60">02</div>
              <h3 className="text-lg font-bold text-white">Answer on Camera with Live HUD</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Speak naturally. Miral tracks your eye gaze radar, posture alignment, and WPM speaking cadence with live cues.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 text-left relative">
              <div className="text-3xl font-extrabold font-mono text-cyan-500/60">03</div>
              <h3 className="text-lg font-bold text-white">Get Instant Executive Scorecard</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Review your detailed confidence breakdown, filler word count, and AI executive rephrasings to level up.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== CANDIDATE TESTIMONIALS ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              Verified Student Outcomes
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Trusted by 50,000+ candidates nationwide.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Hear from engineers and college seniors who transformed their interview presence with Miral.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Review 1 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  "I had a terrible habit of looking down at the keyboard and speaking at 180+ WPM when nervous. Miral's gaze reticle and pacing alerts completely changed my body language before my Amazon loop."
                </p>
              </div>
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Ananya Sharma</div>
                  <div className="text-[11px] text-slate-400">SDE-1 at Amazon</div>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                  Verified Offer
                </Badge>
              </div>
            </div>

            {/* Review 2 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  "The ESL & Executive AI suggestions are incredible. It flagged my repeated 'actually basically' and 'matlab' habits and gave me professional ways to explain my final year project to TCS & Deloitte panels."
                </p>
              </div>
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Rohan Kulkarni</div>
                  <div className="text-[11px] text-slate-400">Placed at Deloitte</div>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                  Campus Placement
                </Badge>
              </div>
            </div>

            {/* Review 3 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-4 flex flex-col justify-between text-left">
              <div className="space-y-3">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  "The fact that my camera video never gets uploaded to any cloud server gave me complete peace of mind to practice freely late at night in my hostel room without feeling self-conscious."
                </p>
              </div>
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Pooja Patel</div>
                  <div className="text-[11px] text-slate-400">Frontend Engineer at Flipkart</div>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-[10px]">
                  Verified Offer
                </Badge>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== FAQ ACCORDION SECTION ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-12 space-y-3">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything you need to know about Miral.
            </h2>
          </div>

          <div className="space-y-3 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl border border-white/[0.08] bg-[#0c0e17] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-semibold text-sm sm:text-base text-slate-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.06] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ===================== FINAL HIGH-CONVERTING CTA BANNER ===================== */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 via-[#0c0e17] to-[#07080d] p-8 sm:p-14 text-center space-y-6 shadow-[0_0_80px_-20px_rgba(99,102,241,0.25)] relative overflow-hidden">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/15 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Ready for your upcoming placement drive?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
              Master your interview delivery with AI.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join thousands of candidates who practice their eye contact, body language, and vocal delivery on Miral every single day.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/practice">
                <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-12 px-8 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30">
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start Free Practice Session</span>
                </Button>
              </Link>
              <Link href="/scenarios">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-12 px-6 gap-2 border-white/15 bg-white/[0.04] text-slate-200 hover:text-white">
                  <Compass className="h-4 w-4 text-indigo-400" />
                  <span>Browse 100+ Question Tracks</span>
                </Button>
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-400 font-mono">
              <span>✓ 100% Free Practice</span>
              <span>✓ No Credit Card</span>
              <span>✓ Instant Browser Launch</span>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
