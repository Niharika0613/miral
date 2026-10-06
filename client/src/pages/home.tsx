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
  LogIn, 
  Camera, 
  Mic, 
  Sliders, 
  Gauge, 
  FileCheck2, 
  Lock, 
  MessageSquare,
  Users,
  Briefcase,
  Mic2,
  Presentation,
  Scale,
  FileText,
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

  // Selected Category / Scenario State
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);

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
        setCameraError("Camera permission not granted. You can still test the interactive simulator below!");
      }
    }
  };

  const samplePassages = [
    "Good communication is about structuring your core points clearly so your listeners stay engaged throughout your delivery.",
    "During my project presentation, our team addressed a major performance issue, improving responsiveness by thirty-five percent under load.",
    "Confident speakers don't rush. They pause calmly before answering, look directly at the audience, and articulate with steady clarity."
  ];

  // Practice Categories (Covering speeches, pitches, interviews, debates, meetings, presentations)
  const categories = [
    {
      id: "public-speaking",
      title: "Public Speaking & Keynotes",
      icon: Mic2,
      tagline: "Overcome stage nervousness, refine vocal projection, and command the room.",
      samplePrompt: "Deliver a 2-minute opening keynote on how curiosity drives breakthrough innovation in modern technology.",
      focus: "Sustained Eye Contact & Expressive Vocal Modulation",
      targetMetrics: { eye: "90%+", wpm: "135–150 WPM", posture: "Upright & Confident" }
    },
    {
      id: "job-interviews",
      title: "Job & Placement Interviews",
      icon: Briefcase,
      tagline: "Practice behavioral questions, technical walkthroughs, and executive self-introductions.",
      samplePrompt: "Tell me about a time you had to deliver a complex project under tight deadlines with shifting requirements.",
      focus: "Structured STAR Method & Calm Demeanor",
      targetMetrics: { eye: "88%+", wpm: "130–145 WPM", posture: "Professional & Engaged" }
    },
    {
      id: "startup-pitches",
      title: "Startup & Project Pitches",
      icon: Flame,
      tagline: "Pitch your ideas, hackathon projects, and business proposals with clarity and energy.",
      samplePrompt: "Present your project's value proposition in 60 seconds and explain why existing alternatives fail.",
      focus: "High Energy Delivery & Crisp Value Articulation",
      targetMetrics: { eye: "94%+", wpm: "140–155 WPM", posture: "Dynamic & Upright" }
    },
    {
      id: "debates-mun",
      title: "Debates & Model UN",
      icon: Scale,
      tagline: "Deliver persuasive rebuttals, structured arguments, and points of information under time limits.",
      samplePrompt: "Present a 90-second opening statement arguing for ethical AI governance in higher education.",
      focus: "Pacing Under Time Limits & Authoritative Tone",
      targetMetrics: { eye: "92%+", wpm: "145–160 WPM", posture: "Steadfast & Direct" }
    },
    {
      id: "team-presentations",
      title: "Presentations & Meetings",
      icon: Presentation,
      tagline: "Practice slide commentary, weekly team updates, and stakeholder briefings.",
      samplePrompt: "Walk your leadership team through quarterly progress, key roadblocks, and next priorities.",
      focus: "Clear Pacing, Pausing & Eliminating Fillers",
      targetMetrics: { eye: "88%+", wpm: "130–142 WPM", posture: "Calm & Natural" }
    },
    {
      id: "group-discussions",
      title: "Group Discussions (GD)",
      icon: Users,
      tagline: "Practice entering discussions smoothly, making structured points, and summarizing arguments.",
      samplePrompt: "Initiate a group discussion on remote work culture versus in-office collaboration.",
      focus: "Polite Interruption Timing & Clear Articulation",
      targetMetrics: { eye: "90%+", wpm: "135–148 WPM", posture: "Attentive & Open" }
    }
  ];

  const handleLaunchCategory = (cat: typeof categories[0]) => {
    sessionStorage.setItem('practiceQuestion', JSON.stringify({
      question: cat.samplePrompt,
      outline: ["State your core premise clearly", "Provide 1-2 supporting examples", "Conclude with a memorable summary"]
    }));
    sessionStorage.setItem('preferredTopic', cat.title);
    setLocation('/practice');
  };

  const faqs = [
    {
      q: "What is Miral and who is it built for?",
      a: "Miral is an AI-powered practice mirror for anyone who wants to speak with confidence. Whether you are preparing for a public speech, a college debate, a startup pitch, a job interview, or a team presentation, Miral gives you private, real-time feedback on how you look and sound."
    },
    {
      q: "How does the real-time AI eye contact and posture tracking work?",
      a: "Miral runs lightweight computer vision models entirely inside your browser using WebAssembly. It tracks your facial orientation, eye gaze direction towards the camera lens, and posture alignment at 60 FPS in real time with zero latency."
    },
    {
      q: "Are my camera video or audio recordings uploaded to any server?",
      a: "No. All camera processing and vision inference happen 100% locally on your own computer or phone. Video frames never leave your device, ensuring complete privacy while you practice."
    },
    {
      q: "Can I practice my own custom speeches or scripts?",
      a: "Yes! Miral includes a built-in smart teleprompter. You can paste any speech, pitch deck notes, or interview script, adjust the font size, and practice reading while keeping direct eye contact with the camera."
    },
    {
      q: "What is the recommended speaking speed (WPM)?",
      a: "For impactful public speaking, presentations, and interviews, the optimal conversational pacing is between 130 and 155 Words Per Minute (WPM). Speaking faster than 170 WPM often sounds rushed and reduces audience comprehension, while speaking below 115 WPM can lead to disengagement."
    },
    {
      q: "Does Miral work on mobile phones?",
      a: "Yes. Miral is fully responsive and works directly in mobile browsers like Chrome on Android and Safari on iOS with continuous speech transcription and audio pacing detection."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#07080d] text-slate-100 overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      
      {/* Ambient Glow Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-[radial-gradient(circle,rgba(99,102,241,0.16)_0%,rgba(139,92,246,0.10)_45%,rgba(6,182,212,0.03)_70%,transparent_100%)] blur-[130px] rounded-full" />
        <div className="absolute top-[45%] right-[-10%] w-[650px] h-[550px] bg-[radial-gradient(circle,rgba(139,92,246,0.10)_0%,rgba(99,102,241,0.05)_50%,transparent_100%)] blur-[140px] rounded-full" />
      </div>

      {/* ===================== TOP ANNOUNCEMENT PILL ===================== */}
      <div className="border-b border-indigo-500/20 bg-indigo-950/40 backdrop-blur-md py-2 px-4 text-center">
        <p className="text-xs sm:text-sm font-medium text-indigo-200">
          <span className="font-semibold text-white mr-1.5">New:</span> 
          Real-time AI feedback on your eye contact, posture, and speaking pace — 100% private in your browser.
        </p>
      </div>

      {/* ===================== HERO SECTION (Aced.io Inspired Centered Layout) ===================== */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-white/[0.08] overflow-hidden">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7">
          
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>AI Practice Mirror for Speeches, Pitches, Interviews & Debates</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
              Everything you need to <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">speak with impact</span> and confidence.
            </h1>
            <p className="text-base sm:text-xl text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Level up your public speaking, project pitches, job interviews, and debates with instant AI feedback on your eye contact, body posture, pacing (WPM), and speech clarity.
            </p>
          </div>

          {/* Centered CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/practice">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-12 px-8 gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all">
                <Play className="h-4 w-4 fill-current" />
                <span>Get started for free</span>
                <ArrowRight className="h-4 w-4 ml-0.5" />
              </Button>
            </Link>

            <Button 
              size="lg" 
              variant="outline" 
              onClick={toggleLiveCamera}
              className="w-full sm:w-auto text-sm font-semibold h-12 px-6 gap-2 border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200"
            >
              <Camera className="h-4 w-4 text-indigo-400" />
              <span>{isCameraActive ? "Stop Camera Preview" : "Test Live Camera HUD"}</span>
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">100% In-Browser Privacy</span>
              <span>(Zero video stored)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-slate-300 font-medium">Real-Time 60 FPS Feedback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span className="text-slate-300 font-medium">Built-in Smart Teleprompter</span>
            </div>
          </div>

        </div>
      </section>

      {/* ===================== SCENARIO CATEGORIES STRIP (Aced.io Card Row) ===================== */}
      <section className="py-12 md:py-16 border-b border-white/[0.08] bg-white/[0.01]">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Choose what you want to practice
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Practice pre-built scenarios or paste your own custom script.
              </p>
            </div>
            <Link href="/scenarios">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 gap-1">
                <span>View all scenarios</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const isSelected = selectedCategoryIdx === idx;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryIdx(idx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between min-h-[130px] ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/15'
                      : 'bg-[#0c0e17] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="h-9 w-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white leading-snug">{cat.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Category Deep Dive Box */}
          <div className="mt-6 rounded-2xl border border-white/[0.12] bg-[#0c0e17] p-6 sm:p-7 shadow-xl relative overflow-hidden text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-xs mb-1.5">
                  Selected Category
                </Badge>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {categories[selectedCategoryIdx].title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {categories[selectedCategoryIdx].tagline}
                </p>
              </div>

              <Button
                onClick={() => handleLaunchCategory(categories[selectedCategoryIdx])}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm px-6 h-11 gap-2 shrink-0 shadow-md shadow-indigo-500/25"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Practice This Scenario</span>
              </Button>
            </div>

            {/* Prompt Box */}
            <div className="my-5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                Sample Practice Prompt:
              </span>
              <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed italic">
                "{categories[selectedCategoryIdx].samplePrompt}"
              </p>
            </div>

            {/* Target Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                <span className="text-[10px] text-slate-400 font-medium block">Target Eye Focus</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{categories[selectedCategoryIdx].targetMetrics.eye}</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                <span className="text-[10px] text-slate-400 font-medium block">Optimal Speaking Speed</span>
                <span className="text-sm font-bold font-mono text-cyan-400">{categories[selectedCategoryIdx].targetMetrics.wpm}</span>
              </div>
              <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                <span className="text-[10px] text-slate-400 font-medium block">Posture Focus</span>
                <span className="text-sm font-bold font-mono text-indigo-300">{categories[selectedCategoryIdx].targetMetrics.posture}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===================== INTERACTIVE LIVE PRODUCT HUD SIMULATOR ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2.5">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              Try It Right Now
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Interactive AI mirror simulator.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Test your camera gaze tracking or explore the speaking pace sandbox below.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.12] bg-[#0c0e17] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono font-medium text-slate-400 ml-1.5">
                  miral // {activeSimTab === 'camera' ? 'live_vision_radar' : 'speaking_speed_sandbox'}
                </span>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-white/[0.06] p-0.5 rounded-lg border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setActiveSimTab('camera')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
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
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
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
              <div className="space-y-4 mt-4">
                <div className="rounded-xl bg-[#090b12] border border-white/[0.08] p-5 relative min-h-[240px] flex flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-25" />

                  {/* Header in Radar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-black/70 border border-white/10 px-2.5 py-1 rounded-md text-xs">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-semibold text-slate-200">
                        {isCameraActive ? "Live In-Browser Webcam" : "Eye Gaze Radar"}
                      </span>
                    </div>
                    <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-300 text-xs">
                      Real-Time 60 FPS
                    </Badge>
                  </div>

                  {/* Center Graphic */}
                  {isCameraActive ? (
                    <div className="relative z-10 my-2 flex items-center justify-center h-40 w-full">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="h-full w-auto rounded-lg border border-indigo-500/40 shadow-md object-cover transform -scale-x-100" 
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-24 w-24 rounded-full border-2 border-emerald-400/80 animate-pulse flex items-center justify-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 my-4 flex flex-col items-center justify-center text-center space-y-2.5">
                      <div className="h-20 w-20 rounded-full border border-indigo-500/40 flex items-center justify-center relative animate-pulse">
                        <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/50 animate-spin" style={{ animationDuration: '8s' }} />
                        <div className="h-12 w-12 rounded-full border border-emerald-400/60 flex items-center justify-center bg-emerald-500/10">
                          <Eye className="h-6 w-6 text-emerald-400" />
                        </div>
                      </div>
                      <div className="text-xs font-mono text-emerald-400 font-bold tabular-nums">
                        EYE FOCUS: 94% • UPRIGHT POSTURE (96%)
                      </div>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        Looking at the camera lens projects direct confidence to your audience.
                      </p>
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.08] pt-2.5">
                    <span className="text-emerald-400 font-medium">Native Computer Vision Engine</span>
                    <span className="font-mono text-[11px] text-slate-500">Zero Cloud Upload</span>
                  </div>
                </div>

                {/* Quick Metric Pills */}
                <div className="grid grid-cols-3 gap-2.5 text-left">
                  <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 font-medium block">Gaze Score</span>
                    <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">94% Target</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 font-medium block">Posture Alignment</span>
                    <span className="text-sm font-bold font-mono text-indigo-300 tabular-nums">Upright (96%)</span>
                  </div>
                  <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                    <span className="text-[10px] text-slate-400 font-medium block">Hesitations</span>
                    <span className="text-sm font-bold font-mono text-cyan-400 tabular-nums">0 detected</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Tab 2: WPM Speed Sandbox */
              <div className="space-y-4 mt-4 text-left">
                <div className="p-4 rounded-xl bg-[#090b12] border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-1.5 border-b border-white/[0.08]">
                    <span className="font-mono">Sample Passage {paceTextIndex + 1} of {samplePassages.length}</span>
                    <button
                      type="button"
                      onClick={() => setPaceTextIndex((prev) => (prev + 1) % samplePassages.length)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs"
                    >
                      Next Passage →
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                    "{samplePassages[paceTextIndex]}"
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-slate-300">Speaking Speed:</span>
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
                        {interactiveWpm < 125 ? 'Too Slow' : interactiveWpm <= 155 ? 'Ideal Retention Range' : 'Too Fast'}
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

                  <div className="flex justify-between text-[11px] font-mono text-slate-500">
                    <span>80 WPM (Slow)</span>
                    <span className="text-emerald-400 font-bold">130–155 WPM (Optimal Clarity)</span>
                    <span>220 WPM (Rushing)</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ===================== HOW IT WORKS (3 Simple Steps) ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              How It Works
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Three simple steps to speaking mastery.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              No complex setup. Open your browser, pick a topic, and start practicing in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Step 1 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-3.5">
              <div className="text-3xl font-extrabold font-mono text-indigo-500/50">01</div>
              <h3 className="text-base sm:text-lg font-bold text-white">Pick a Topic or Write a Script</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Choose from public speaking prompts, pitch scenarios, interview questions, or paste your own custom script into the smart teleprompter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-3.5">
              <div className="text-3xl font-extrabold font-mono text-violet-500/50">02</div>
              <h3 className="text-base sm:text-lg font-bold text-white">Practice on Camera with Live HUD</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Deliver your speech naturally. Miral tracks your eye gaze focus, body posture, speaking speed (WPM), and filler words with gentle live cues.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-3.5">
              <div className="text-3xl font-extrabold font-mono text-cyan-500/50">03</div>
              <h3 className="text-base sm:text-lg font-bold text-white">Review Instant Diagnostic Report</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Get an instant diagnostic report with your overall confidence score, pacing breakdown, filler analysis, and tailored delivery recommendations.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== CORE FEATURES GRID (Bento Layout) ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              Engineered for Speaking Excellence
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Multimodal feedback on how you look and sound.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            
            {/* Feature 1 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Real-Time Eye Gaze Focus</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Tracks your iris direction at 60 FPS in WebAssembly, helping you maintain steady, confident eye contact with the camera.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-3 hover:border-violet-500/40 transition-all">
              <div className="h-10 w-10 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Body Posture & Alignment</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Detects slouching, leaning, or head tilts in real time so you always project an upright, authoritative posture.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-3 hover:border-cyan-500/40 transition-all">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Gauge className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Speaking Pace (WPM) Meter</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Measures your speech tempo in real time, alerting you when nervousness causes you to rush or slow down excessively.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-3 hover:border-amber-500/40 transition-all">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Filler Word & Hesitation Counter</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Flags repetitive hesitation sounds like 'um', 'uh', 'like', 'you know', helping you build clean speech cadence.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-3 hover:border-emerald-500/40 transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Smart Script Teleprompter</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Paste your custom presentation notes or interview outline and read comfortably while keeping direct eye contact.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e17] p-6 space-y-3 hover:border-indigo-500/40 transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">100% In-Browser Privacy</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                All video and vision computing happen locally on your device. Video frames are never sent to or stored on any server.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== FAQ SECTION ===================== */}
      <section className="py-16 md:py-24 border-b border-white/[0.08] relative">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-12 space-y-2.5">
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-3 py-1">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
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

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 via-[#0c0e17] to-[#07080d] p-8 sm:p-12 text-center space-y-6 shadow-[0_0_80px_-20px_rgba(99,102,241,0.25)] relative overflow-hidden">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/40 bg-indigo-500/15 text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Ready to practice your next speech or interview?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
              Speak with confidence every single time.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
              Open the practice studio directly in your browser. No sign-up required to get started.
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
                  <span>Browse All Scenarios</span>
                </Button>
              </Link>
            </div>

            <div className="pt-3 flex items-center justify-center gap-6 text-xs text-slate-400 font-mono">
              <span>✓ 100% Free to Practice</span>
              <span>✓ No Credit Card</span>
              <span>✓ Instant Browser Launch</span>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
