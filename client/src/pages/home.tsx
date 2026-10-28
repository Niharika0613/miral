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
  Mic, 
  Gauge, 
  FileCheck2, 
  Lock, 
  Users,
  Briefcase,
  Mic2,
  Presentation,
  Scale,
  FileText,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Layers,
  Monitor,
  Video,
  Building2,
  Award,
  Grid,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/utils/auth';

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  // Selected Category / Scenario State
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);

  // Product Screenshot Showcase Tab
  const [activePreviewTab, setActivePreviewTab] = useState<'practice' | 'scenarios' | 'dashboard' | 'trajectory'>('practice');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Practice Scenarios (Covering speeches, pitches, interviews, debates, meetings, presentations)
  const categories = [
    {
      id: "job-interviews",
      title: "Job & Placement Interviews",
      icon: Briefcase,
      tagline: "Practice behavioral questions, project walkthroughs, and executive self-introductions.",
      samplePrompt: "Tell me about a time you had to deliver a complex engineering project under tight deadlines with shifting requirements.",
      targetEye: "88% Direct Focus",
      targetWpm: "130–145 WPM",
      targetPosture: "Professional & Engaged"
    },
    {
      id: "public-speaking",
      title: "Public Speaking & Keynotes",
      icon: Mic2,
      tagline: "Overcome stage nervousness, project your voice clearly, and command room presence.",
      samplePrompt: "Deliver a 2-minute opening talk on how curiosity and relentless iteration drive breakthrough technological innovation.",
      targetEye: "90% Direct Focus",
      targetWpm: "135–150 WPM",
      targetPosture: "Upright & Confident"
    },
    {
      id: "startup-pitches",
      title: "Startup & Project Pitches",
      icon: Zap,
      tagline: "Pitch your ideas, hackathon projects, and business proposals with clarity and energy.",
      samplePrompt: "Present your project's unique value proposition in 60 seconds and explain why existing alternatives fail.",
      targetEye: "94% Direct Focus",
      targetWpm: "140–155 WPM",
      targetPosture: "Dynamic & Upright"
    },
    {
      id: "group-discussions",
      title: "Group Discussions (GD)",
      icon: Users,
      tagline: "Practice entering discussions smoothly, structuring points, and summarizing arguments.",
      samplePrompt: "Initiate a mock group discussion examining remote work productivity versus in-office collaborative dynamics.",
      targetEye: "90% Direct Focus",
      targetWpm: "135–148 WPM",
      targetPosture: "Attentive & Open"
    },
    {
      id: "debates-mun",
      title: "Debates & Model UN",
      icon: Scale,
      tagline: "Deliver persuasive arguments, rebuttals, and structured points under time pressure.",
      samplePrompt: "Present a 90-second opening statement arguing for ethical AI governance in higher education institutions.",
      targetEye: "92% Direct Focus",
      targetWpm: "145–160 WPM",
      targetPosture: "Steadfast & Direct"
    },
    {
      id: "team-presentations",
      title: "Presentations & Meetings",
      icon: Presentation,
      tagline: "Practice slide commentary, weekly team updates, and stakeholder executive briefings.",
      samplePrompt: "Walk your leadership team through quarterly progress, key bottlenecks, and resource allocation priorities.",
      targetEye: "88% Direct Focus",
      targetWpm: "130–142 WPM",
      targetPosture: "Calm & Natural"
    }
  ];

  const handleLaunchCategory = (cat: typeof categories[0]) => {
    sessionStorage.setItem('practiceQuestion', JSON.stringify({
      question: cat.samplePrompt,
      outline: ["State your core premise clearly", "Provide 1-2 supporting metrics or examples", "Conclude with a memorable summary"]
    }));
    sessionStorage.setItem('preferredTopic', cat.title);
    setLocation('/practice');
  };

  const previewTabs = [
    {
      id: 'practice' as const,
      label: 'Live Practice Studio',
      icon: Video,
      image: '/images/practice-preview-v3.png',
      badge: 'Real-Time In-Browser Feedback',
      heading: 'Live Eye Gaze, Posture & Transcript Analysis',
      description: 'Practice directly on camera. VaniDarpan calculates your real-time eye gaze percentage, upright posture stability, speaking tempo (WPM), and live speech transcript with 100% in-browser WebAssembly.'
    },
    {
      id: 'scenarios' as const,
      label: 'Curated Scenarios',
      icon: Compass,
      image: '/images/scenarios-preview-v3.png',
      badge: '100+ Pre-Built Prompts',
      heading: '1-Click Launch Across Placement & Speaking Tracks',
      description: 'Choose from Campus HR rounds, Technical Project Defenses, Group Discussions, and MUN Debates. Each track comes with curated questions and benchmark focus targets.'
    },
    {
      id: 'dashboard' as const,
      label: 'Analytics Dashboard',
      icon: BarChart3,
      image: '/images/dashboard-preview-v3.png',
      badge: 'Personalized Scorecard',
      heading: 'Comparative Analytics: Baseline vs Current Session',
      description: 'Review your total practice sessions, composite confidence score (0-100), time invested, and comparative improvements across eye contact, posture, and pacing.'
    },
    {
      id: 'trajectory' as const,
      label: 'Session Trajectory Curve',
      icon: TrendingUp,
      image: '/images/trajectory-preview-v3.png',
      badge: 'Progress Visualization',
      heading: 'Historical Multi-Metric Improvement Trajectory',
      description: 'Visualize your progress over time with interactive growth curves tracking your eye contact stability and composite confidence across all completed mock sessions.'
    }
  ];

  const activePreview = previewTabs.find(t => t.id === activePreviewTab) || previewTabs[0];

  const faqs = [
    {
      q: "What is VaniDarpan and who is it built for?",
      a: "VaniDarpan is an AI practice mirror for anyone who wants to speak with confidence. Whether you are preparing for a public speech, a college debate, a startup pitch, a job interview, or a team presentation, VaniDarpan gives you real-time visual and audio feedback on how you look and sound."
    },
    {
      q: "How does the real-time AI eye contact and posture tracking work?",
      a: "VaniDarpan runs lightweight computer vision models directly inside your browser using WebAssembly. It tracks your facial orientation, eye gaze direction towards the camera lens, and posture alignment at 60 FPS in real time with zero latency."
    },
    {
      q: "Are my camera video or audio recordings uploaded to any server?",
      a: "No. All camera processing and vision inference happen 100% locally on your own computer or phone. Video frames never leave your device, ensuring complete privacy while you practice."
    },
    {
      q: "How can university placement cells and TPOs use VaniDarpan?",
      a: "Colleges deploy VaniDarpan across entire student cohorts. The Institutional TPO Portal provides aggregate department heatmaps, candidate readiness scorecards, and one-click CSV dossier exports for Day-1 and mass recruiter drives."
    },
    {
      q: "Can I practice my own custom speeches or scripts?",
      a: "Yes! VaniDarpan includes a built-in smart teleprompter. You can paste any speech, pitch deck notes, or interview script, adjust the font size, and practice reading while maintaining direct eye contact with the camera."
    },
    {
      q: "What is the recommended speaking speed (WPM)?",
      a: "For impactful professional interviews and speeches, the optimal conversational pacing is between 130 and 155 Words Per Minute (WPM). Speaking faster than 165 WPM often sounds rushed, while speaking below 120 WPM can lead to disengagement."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* ── Top Announcement Bar ── */}
      <div className="border-b border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/80 dark:bg-indigo-950/40 py-2 px-4 text-center">
        <p className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="font-semibold">Live AI Practice Mirror:</span> 
          <span>Real-time feedback on eye contact, posture, speaking pace, and clarity — 100% private in your browser.</span>
        </p>
      </div>

      {/* ── 1. HERO SECTION (Crisp, Impactful, Bold) ── */}
      <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1322] overflow-hidden">
        
        {/* Exotic Multi-Layer Floating Background Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              x: [0, 30, -25, 0],
              y: [0, -35, 20, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/4 left-1/4 w-[480px] h-[320px] bg-gradient-to-r from-indigo-500/15 via-blue-500/15 to-purple-500/10 rounded-full blur-3xl opacity-70"
          />
          <motion.div
            animate={{
              x: [0, -35, 25, 0],
              y: [0, 30, -25, 0],
              scale: [0.95, 1.08, 1, 0.95],
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-1/4 right-1/4 w-[420px] h-[300px] bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-indigo-500/15 rounded-full blur-3xl opacity-60"
          />
        </div>

        <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Practice Mirror for Speeches, Interviews & Campus Placements</span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="space-y-3.5"
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">speak with impact</span> and confidence.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Level up your campus placement interviews, startup pitches, and public speeches with instant in-browser biometric feedback on your camera eye gaze, body posture, and conversational cadence.
            </p>
          </motion.div>

          {/* Live Telemetry Equalizer Wave (Exotic Vocal Waveform) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-indigo-200/80 dark:border-indigo-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs text-xs"
          >
            <div className="flex items-center gap-1 h-4">
              {[4, 12, 18, 10, 22, 14, 8, 20, 16, 6, 15, 9].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{
                    height: [
                      `${Math.max(4, h * 0.4)}px`,
                      `${Math.min(20, h * 1.1)}px`,
                      `${Math.max(3, h * 0.3)}px`,
                      `${h}px`
                    ]
                  }}
                  transition={{
                    duration: 1.2 + (i % 4) * 0.25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.08
                  }}
                  className="w-0.5 rounded-full bg-indigo-500 dark:bg-indigo-400"
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">60 FPS</span>
              <span>Vision & Vocal Cadence Telemetry</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </motion.div>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1"
          >
            <Link href="/practice">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-transform hover:scale-[1.02]">
                <Play className="h-4 w-4 fill-current" />
                <span>Launch Practice Studio</span>
                <ArrowRight className="h-4 w-4 ml-0.5" />
              </Button>
            </Link>

            <Link href="/tpo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-11 px-6 gap-2 border-indigo-200 dark:border-indigo-800/80 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 shadow-2xs transition-transform hover:scale-[1.02] group">
                <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Institutional TPO Portal</span>
                <ArrowRight className="h-4 w-4 ml-0.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Privacy & Feature Guarantees */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">100% In-Browser Privacy</span>
              <span>(Zero video stored on servers)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Real-Time Camera Cues</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Personal Progress Dashboard</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── 2. PRACTICE SCENARIOS SECTION (Rich Interactive Selector) ── */}
      <section className="py-12 sm:py-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1322]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Choose what you want to practice
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Select any scenario below to view targeted focus metrics or launch directly into the mirror studio.
            </p>
            <div className="pt-1 flex items-center justify-center">
              <Link href="/scenarios">
                <Button variant="outline" size="sm" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 gap-1.5 h-8 px-4 rounded-full transition-all">
                  <span>View all 100+ scenarios</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Cards Grid: 6 Distinct High-Value Tracks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const isSelected = selectedCategoryIdx === idx;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryIdx(idx)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/25 shadow-xs'
                      : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 shadow-2xs'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{cat.title}</h3>
                      {isSelected && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {cat.tagline}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Scenario Preview Card */}
          <div className="mt-6 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-5 sm:p-6 text-left shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                    Selected Practice Track
                  </Badge>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {categories[selectedCategoryIdx].title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {categories[selectedCategoryIdx].tagline}
                </p>
              </div>

              <Button
                onClick={() => handleLaunchCategory(categories[selectedCategoryIdx])}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 h-9 gap-2 shrink-0 shadow-xs transition-transform hover:scale-[1.02]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Practice This Scenario</span>
              </Button>
            </div>

            {/* Prompt */}
            <div className="my-4 p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 border-l-4 border-l-indigo-600 shadow-2xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Sample Practice Question / Prompt:
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
                "{categories[selectedCategoryIdx].samplePrompt}"
              </p>
            </div>

            {/* Benchmark Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
                <span className="text-[10px] text-slate-400 font-medium block">Target Gaze Focus</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{categories[selectedCategoryIdx].targetEye}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
                <span className="text-[10px] text-slate-400 font-medium block">Optimal Pace</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{categories[selectedCategoryIdx].targetWpm}</span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950">
                <span className="text-[10px] text-slate-400 font-medium block">Body Posture</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{categories[selectedCategoryIdx].targetPosture}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. REAL PRODUCT APP PREVIEWS (Interactive Showcase) ── */}
      <section className="py-12 sm:py-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#090b10]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-0.5">
              Inside VaniDarpan Studio
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              See the actual practice studio in action.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Explore high-fidelity screenshots of the practice studio, scenario libraries, and progress analytics.
            </p>
          </div>

          {/* Interactive Showcase Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {previewTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePreviewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Showcase Display Card with Browser Chrome Frame */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e1322] shadow-xl overflow-hidden text-left">
            
            {/* Top Window Bar */}
            <div className="px-4 py-3 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs font-mono text-slate-500 ml-2">
                  vanidarpan.com/{activePreviewTab}
                </span>
              </div>
              <Badge variant="outline" className="border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px]">
                {activePreview.badge}
              </Badge>
            </div>

            {/* Main Screenshot & Description Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Image Preview Container with Exotic Floating Telemetry */}
              <div className="lg:col-span-8 rounded-xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-sm bg-slate-950 relative group">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activePreview.image}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.4 }}
                    transition={{ duration: 0.2 }}
                    src={activePreview.image} 
                    alt={activePreview.heading} 
                    className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-300"
                  />
                </AnimatePresence>

                {/* Floating Telemetry Badge Top-Right */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-3 right-3 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-emerald-500/40 text-[11px] text-white shadow-lg backdrop-blur-md"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold">Webcam Gaze: 88% Direct Lens Focus</span>
                </motion.div>

                {/* Floating Telemetry Badge Bottom-Left */}
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-3 left-3 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-indigo-500/40 text-[11px] text-white shadow-lg backdrop-blur-md"
                >
                  <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="font-semibold">Vocal Cadence: 142 WPM (Optimal Tempo)</span>
                </motion.div>
              </div>

              {/* Explanatory Details */}
              <div className="lg:col-span-4 space-y-4">
                <div className="space-y-1.5">
                  <Badge variant="secondary" className="bg-indigo-100/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-mono">
                    {activePreview.label}
                  </Badge>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {activePreview.heading}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activePreview.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link href={activePreviewTab === 'scenarios' ? '/scenarios' : activePreviewTab === 'dashboard' ? '/dashboard' : '/practice'}>
                    <Button size="sm" className="w-full text-xs font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
                      <span>Open {activePreview.label}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── 4. INSTITUTIONAL PLACEMENT & TPO SPOTLIGHT (Bold Main Site Section with Redirect) ── */}
      <section className="py-12 sm:py-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="rounded-3xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-10 lg:p-12 shadow-lg space-y-6">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Left Details */}
              <div className="space-y-3 max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/60 text-xs font-semibold">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>University Placement Cells & TPO Leadership</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Institutional Placement & TPO Intelligence Suite
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Equip campus placement coordinators with aggregated cohort communication readiness, 2D branch competency heatmaps, and downloadable candidate recruiter dossiers.
                </p>

                {/* Core Capabilities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>2D Department Competency Heatmaps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Day-1 Recruiter Ready Triage (80%+ Target)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>1-Click Recruiter Dossier CSV Exports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Automated Remedial Drill Assignments</span>
                  </div>
                </div>
              </div>

              {/* Right CTA Box with Direct Redirect Option */}
              <div className="lg:w-80 shrink-0 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3.5 text-center">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                  <Grid className="h-5 w-5" />
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Access TPO Portal
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Authorized placement officer workspace with one-click demo preview.
                  </p>
                </div>

                <Link href="/tpo">
                  <Button className="w-full text-xs font-semibold h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-transform hover:scale-[1.02]">
                    <Building2 className="h-4 w-4" />
                    <span>Open Institutional TPO Portal</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>

                <div className="text-[10px] text-slate-400 font-mono">
                  Sample Cohort Telemetry • NAAC Ready
                </div>
              </div>

            </div>

            {/* Quick Cohort Stats Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-left">
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Batch Candidates Monitored</span>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">1,480 Candidates</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Campus Readiness Index</span>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">77.4% (Day-1 Ready)</div>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Mock Practice Volume</span>
                <div className="text-lg font-bold font-mono text-indigo-600 dark:text-indigo-400">6,840+ Sessions</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── 5. WHAT VANIDARPAN ANALYZES IN REAL TIME ── */}
      <section className="py-12 sm:py-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1322]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-0.5 font-semibold">
              Multimodal Speaking Intelligence
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Real-time feedback on how you look and sound.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              In-browser computer vision and acoustic metrics measure your delivery with sub-second latency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
            
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19] p-5 sm:p-6 space-y-3 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Eye Gaze Engagement</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                60 FPS in-browser iris detection checks if you maintain steady eye engagement with the camera lens or look away.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19] p-5 sm:p-6 space-y-3 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Posture Alignment</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Detects slouching, leaning, or downward head tilt in real time so your physical presence projects authority.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19] p-5 sm:p-6 space-y-3 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
                <Gauge className="h-5 w-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Speaking Pace (WPM)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Measures words per minute live to keep your cadence in the ideal 130–155 WPM conversational clarity zone.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19] p-5 sm:p-6 space-y-3 hover:border-indigo-400 dark:hover:border-indigo-500/40 hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Smart Teleprompter</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste any custom speech, pitch notes, or presentation outline and read naturally while practicing on camera.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── 6. HOW IT WORKS (3 Simple Steps) ── */}
      <section className="py-12 sm:py-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0b0f19]">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Three simple steps to speaking mastery.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              No software installation required. Runs directly inside your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Step 1 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322] p-6 space-y-3 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">01</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pick a Scenario or Write a Script</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose a pre-built practice scenario or paste your custom speech notes into the smart teleprompter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322] p-6 space-y-3 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">02</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Practice with Live Visual Cues</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Speak on camera. VaniDarpan monitors your eye contact, posture, and speaking tempo with gentle on-screen cues.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322] p-6 space-y-3 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">03</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Review Diagnostic Scorecard</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get an instant breakdown of your confidence score, pacing, filler words, and personalized delivery advice.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── 7. FAQ SECTION ── */}
      <section className="py-10 sm:py-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1322]">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-8 space-y-1.5">
            <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-0.5">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Everything you need to know about VaniDarpan.
            </h2>
          </div>

          <div className="space-y-2.5 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090b12] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ml-2 ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 8. FINAL CALL TO ACTION ── */}
      <section className="py-12 sm:py-16 bg-slate-50/70 dark:bg-[#0b0f19] relative overflow-hidden">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-b from-indigo-50/80 via-white to-white dark:from-indigo-950/20 dark:via-[#0e1322] dark:to-[#0b0f19] p-6 sm:p-10 text-center space-y-4 shadow-sm">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-300 dark:border-indigo-500/40 bg-indigo-100/60 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Ready for your next speech or interview?</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-xl mx-auto">
              Speak with confidence every single time.
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Create your free account to track your speaking progress and save your session diagnostic history.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link href="/practice">
                <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-7 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                  <Play className="h-4 w-4 fill-current" />
                  <span>Launch Practice Studio</span>
                </Button>
              </Link>
              <Link href="/tpo">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-11 px-5 gap-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  <Building2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Open TPO Portal</span>
                </Button>
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-indigo-500" /> Free Account</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-indigo-500" /> Save Progress History</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-indigo-500" /> Instant Browser Launch</span>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
