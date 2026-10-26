// client/src/pages/home.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Eye, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Play, 
  Zap, 
  Compass, 
  Check, 
  LogIn, 
  UserPlus,
  Gauge, 
  Building2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Award,
  Video,
  ExternalLink,
  Users,
  Briefcase,
  Flame,
  Mic2,
  Lock,
  Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/utils/auth';

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // 4 Core High-Intent Practice Tracks (Clean, Essential, Uncluttered)
  const coreTracks = [
    {
      id: "placement-interviews",
      title: "Placement & HR Interviews",
      icon: Briefcase,
      tagline: "Master self-introductions, technical project defenses, and STAR behavioral questions.",
      samplePrompt: "Tell me about a challenging technical hurdle in your primary project and how you resolved it under pressure.",
      targetEye: "88% Direct Lens Focus",
      targetWpm: "135–148 WPM",
      targetPacing: "Optimal Conversational Pace"
    },
    {
      id: "startup-pitches",
      title: "Startup & Product Pitches",
      icon: Flame,
      tagline: "Pitch ideas with energetic authority, clear value propositions, and tight time management.",
      samplePrompt: "Present your solution's core value proposition in 90 seconds and explain why existing alternatives fail.",
      targetEye: "92% Direct Lens Focus",
      targetWpm: "140–155 WPM",
      targetPacing: "Dynamic Pitch Rhythm"
    },
    {
      id: "public-speaking",
      title: "Public Speaking & Keynotes",
      icon: Mic2,
      tagline: "Overcome camera and stage hesitation, project your voice, and captivate your audience.",
      samplePrompt: "Deliver a 2-minute opening keynote on how autonomous systems and AI are reshaping engineering careers.",
      targetEye: "90% Direct Lens Focus",
      targetWpm: "130–145 WPM",
      targetPacing: "Steady & Composed"
    },
    {
      id: "group-discussions",
      title: "Group Discussions & Debates",
      icon: Users,
      tagline: "Enter conversations with poise, frame counter-arguments respectfully, and summarize effectively.",
      samplePrompt: "Initiate a mock group discussion examining the balance between rapid automation and human job displacement.",
      targetEye: "85% Direct Lens Focus",
      targetWpm: "138–150 WPM",
      targetPacing: "Persuasive Cadence"
    }
  ];

  const handleLaunchScenario = (track: typeof coreTracks[0]) => {
    sessionStorage.setItem('practiceQuestion', JSON.stringify({
      question: track.samplePrompt,
      outline: ["State your main thesis clearly", "Give concrete evidence or project metric", "Conclude with confidence"]
    }));
    sessionStorage.setItem('preferredTopic', track.title);
    setLocation('/practice');
  };

  const faqs = [
    {
      q: "How does VaniDarpan analyze my eye contact and posture in real time?",
      a: "VaniDarpan runs lightweight computer vision neural models directly inside your web browser using WebAssembly. It tracks 478 3D facial landmarks and your iris position relative to the camera lens at 60 FPS with zero latency."
    },
    {
      q: "Are my camera video frames or audio recordings uploaded to any server?",
      a: "No. Video frames and raw camera feeds never leave your personal computer or mobile phone. All visual inference is computed 100% locally on your device, guaranteeing total candidate privacy."
    },
    {
      q: "How do university placement cells and TPOs use VaniDarpan?",
      a: "Colleges deploy VaniDarpan across entire student cohorts. The Institutional TPO Portal provides aggregate department heatmaps, candidate readiness scorecards, and one-click CSV dossier exports for Day-1 and mass recruiter drives."
    },
    {
      q: "What is the optimal speaking pace (WPM) during an interview?",
      a: "The ideal professional interview conversational tempo is between 130 and 155 Words Per Minute (WPM). Speeds above 165 WPM risk sounding anxious or rushed, while pacing below 120 WPM can cause listener disengagement."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors">
      
      {/* ── 1. ULTRA-CLEAN HERO SECTION ── */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80">
        
        {/* Subtle background ambient mesh */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/20 to-teal-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-8">
          
          {/* Animated floating pill badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Practice Mirror for Speeches, Interviews & Campus Placements</span>
          </motion.div>

          {/* Bold, uncluttered headline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4 max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Speak with impact. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500">
                Every single time.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-normal max-w-2xl mx-auto leading-relaxed">
              Real-time in-browser biometric feedback on your camera eye contact, posture stability, and conversational cadence — 100% private with zero video uploaded.
            </p>
          </motion.div>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <Link href="/practice">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-12 px-8 gap-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]">
                <Play className="h-4 w-4 fill-current" />
                <span>Launch Practice Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/tpo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-12 px-7 gap-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all hover:scale-[1.02]">
                <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>University TPO Portal</span>
                <Badge variant="outline" className="text-[10px] ml-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 py-0">
                  Institutional
                </Badge>
              </Button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% Client-Side Privacy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Zero Latency WebAssembly</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-indigo-500" />
              <span>Campus Placement Ready</span>
            </div>
          </motion.div>

        </div>

      </section>

      {/* ── 2. LIVE STUDIO SIMULATOR (Visual, Spacious, Interactive) ── */}
      <section className="py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto space-y-2"
          >
            <Badge variant="outline" className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs py-0.5 px-3">
              Live In-Browser Studio Telemetry
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Instant visual feedback while you speak.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              VaniDarpan monitors your eye gaze, conversational pace, and posture simultaneously.
            </p>
          </motion.div>

          {/* Interactive Live Telemetry Showcase Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-white shadow-xl overflow-hidden"
          >
            {/* Window bar */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="font-mono text-slate-400 text-[11px] ml-2">vanidarpan.com/practice-studio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-emerald-400">Camera Engine Active</span>
              </div>
            </div>

            {/* Simulated Live Studio Surface */}
            <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Left: Telemetry Indicators */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                    <span className="font-semibold text-slate-200">Active Live Simulation</span>
                    <Badge className="bg-indigo-600 text-white text-[10px]">Mock Interview Round</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px] flex items-center justify-between">
                        <span>Camera Gaze</span>
                        <Eye className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div className="text-xl font-bold font-mono text-emerald-400">89%</div>
                      <div className="text-[10px] text-slate-400">Direct Lens Engagement</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px] flex items-center justify-between">
                        <span>Speaking Cadence</span>
                        <Gauge className="h-3.5 w-3.5 text-indigo-400" />
                      </div>
                      <div className="text-xl font-bold font-mono text-indigo-400">142 WPM</div>
                      <div className="text-[10px] text-slate-400">Optimal Rhythm Target Met</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px] flex items-center justify-between">
                        <span>Verbal Fillers</span>
                        <Mic2 className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div className="text-xl font-bold font-mono text-emerald-400">0 / min</div>
                      <div className="text-[10px] text-slate-400">Clean Articulation</div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px] flex items-center justify-between">
                        <span>Posture Alignment</span>
                        <Activity className="h-3.5 w-3.5 text-indigo-400" />
                      </div>
                      <div className="text-xl font-bold font-mono text-indigo-400">92%</div>
                      <div className="text-[10px] text-slate-400">Upright & Composed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Quick Action Box */}
              <div className="md:col-span-5 space-y-4 text-left">
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs text-indigo-400 border-indigo-800">
                    Smart Teleprompter & Questions
                  </Badge>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Ready to practice on camera?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Choose any pre-built behavioral prompt or paste your personal speech script into the teleprompter.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-xs italic text-slate-300">
                  "Walk me through your most impactful engineering project and how you handled unexpected roadblocks."
                </div>

                <Link href="/practice">
                  <Button className="w-full text-xs font-semibold h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Launch Studio with this Prompt</span>
                  </Button>
                </Link>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* ── 3. THE 3 CORE PILLARS (Only the Important Ones, Clean & Spacious) ── */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto space-y-2.5"
          >
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Built for precision speaking self-improvement.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Three core multimodal capabilities engineered for interview candidates, student debaters, and presenters.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
            
            {/* Card 1: Eye Gaze */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Camera Eye Lens Connection
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Tracks your iris alignment to ensure you maintain direct eye engagement with the interviewer instead of glancing away or staring at notes.
              </p>
            </motion.div>

            {/* Card 2: Speaking Cadence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Gauge className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Speaking Pacing & Cadence
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Live Words Per Minute (WPM) calculation keeps you in the optimal 130–155 WPM conversational clarity zone and alerts you when rushing.
              </p>
            </motion.div>

            {/* Card 3: In-Browser Privacy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                100% In-Browser Privacy
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                All computer vision and speech recognition algorithms execute entirely inside your local browser. Zero video frames are stored or streamed to servers.
              </p>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ── 4. INSTITUTIONAL PLACEMENT & TPO SPOTLIGHT (MAIN SITE SECTION WITH REDIRECT) ── */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19] relative overflow-hidden">
        
        {/* Subtle grid pattern */}
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-950 p-8 sm:p-12 lg:p-16 shadow-lg space-y-8"
          >
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              
              {/* Left Details */}
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/60 text-xs font-semibold">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>University Career Services & Placement Cells</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Institutional Placement & TPO Intelligence Suite
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Provide your Dean and Placement Officers with batch-wide communication readiness metrics, multi-dimensional department heatmaps, and downloadable candidate recruiter dossiers.
                </p>

                {/* Bullet highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>2D Department Competency Heatmaps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Day-1 Recruiter Ready Triage (80%+ Target)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>1-Click Recruiter Dossier CSV Exports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Automated Remedial Drill Assignments</span>
                  </div>
                </div>
              </div>

              {/* Right CTA Box with Direct Redirect */}
              <div className="lg:w-80 shrink-0 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 text-center">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                  <Grid className="h-6 w-6" />
                </div>
                
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Access TPO Portal
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Protected placement officer access with one-click demo preview.
                  </p>
                </div>

                <Link href="/tpo">
                  <Button className="w-full text-xs font-semibold h-11 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-transform hover:scale-[1.02]">
                    <Building2 className="h-4 w-4" />
                    <span>Open Institutional TPO Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>

                <div className="text-[11px] text-slate-400 font-mono">
                  Sample Cohort Telemetry • NAAC Ready
                </div>
              </div>

            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800 text-left">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cohort Batch Monitored</span>
                <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">1,480 Candidates</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Campus Readiness Index</span>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">77.4% (Day-1 Ready)</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mock Practice Volume</span>
                <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">6,840+ Sessions</div>
              </div>
            </div>

          </motion.div>

        </div>
      </section>

      {/* ── 5. CURATED PRACTICE TRACKS (Clean 4 Cards, Uncluttered) ── */}
      <section className="py-20 sm:py-28 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <Badge variant="outline" className="border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs py-0.5 px-3">
                Pre-Built Scenarios
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                Practice what matters to your career.
              </h2>
            </div>

            <Link href="/scenarios">
              <Button variant="outline" size="sm" className="text-xs font-semibold gap-1.5 h-9 rounded-full">
                <span>View Full Library</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreTracks.map((track, idx) => {
              const Icon = track.icon;
              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {track.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {track.tagline}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      onClick={() => handleLaunchScenario(track)}
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white h-8"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Start Practice</span>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 6. MINIMALIST FAQ (4 Essential Questions) ── */}
      <section className="py-16 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/40">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Frequently asked questions.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Clear answers regarding privacy, metrics, and institutional features.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 7. FINAL CALL TO ACTION (Spacious, Clean) ── */}
      <section className="py-20 sm:py-28 bg-slate-50/70 dark:bg-slate-950 text-center">
        <div className="container max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to speak with complete confidence?
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Launch a 2-minute mock practice session right now. No setup or downloads needed.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/practice">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                <Play className="h-4 w-4 fill-current" />
                <span>Start Practice Now</span>
              </Button>
            </Link>

            <Link href="/tpo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-11 px-6 gap-2 border-slate-200 dark:border-slate-800">
                <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>View TPO Portal</span>
              </Button>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
