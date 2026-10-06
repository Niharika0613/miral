// client/src/pages/home.tsx
import { useState, useEffect } from 'react';
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
  Compass, 
  Flame, 
  Check, 
  LogIn, 
  Mic, 
  Sliders, 
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
  Target,
  BarChart3,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/utils/auth';

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  
  // Interactive Speech Pace Dial
  const [interactiveWpm, setInteractiveWpm] = useState(142);
  const [paceTextIndex, setPaceTextIndex] = useState(0);

  // Selected Category / Scenario State
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const samplePassages = [
    "Good communication is about structuring your core points clearly so your listeners stay engaged throughout your delivery.",
    "During my project presentation, our team addressed a major performance issue, improving responsiveness by thirty-five percent under load.",
    "Confident speakers don't rush. They pause calmly before answering, look directly at the audience, and articulate with steady clarity."
  ];

  // Practice Scenarios (Covering speeches, pitches, interviews, debates, meetings, presentations)
  const categories = [
    {
      id: "public-speaking",
      title: "Public Speaking & Keynotes",
      icon: Mic2,
      tagline: "Overcome stage nervousness, refine vocal projection, and command the room.",
      samplePrompt: "Deliver a 2-minute opening statement on how curiosity drives breakthrough innovation in modern technology.",
      targetEye: "90% Focus",
      targetWpm: "135–150 WPM",
      targetPosture: "Upright & Confident"
    },
    {
      id: "job-interviews",
      title: "Job & Placement Interviews",
      icon: Briefcase,
      tagline: "Practice behavioral questions, technical walkthroughs, and self-introductions.",
      samplePrompt: "Tell me about a time you had to deliver a complex project under tight deadlines with shifting requirements.",
      targetEye: "88% Focus",
      targetWpm: "130–145 WPM",
      targetPosture: "Professional & Engaged"
    },
    {
      id: "startup-pitches",
      title: "Startup & Project Pitches",
      icon: Flame,
      tagline: "Pitch your ideas, hackathon projects, and proposals with clarity and energy.",
      samplePrompt: "Present your project's unique value proposition in 60 seconds and explain why existing alternatives fail.",
      targetEye: "94% Focus",
      targetWpm: "140–155 WPM",
      targetPosture: "Dynamic & Upright"
    },
    {
      id: "debates-mun",
      title: "Debates & Model UN",
      icon: Scale,
      tagline: "Deliver persuasive arguments, rebuttals, and structured points under time limits.",
      samplePrompt: "Present a 90-second opening statement arguing for ethical AI governance in higher education.",
      targetEye: "92% Focus",
      targetWpm: "145–160 WPM",
      targetPosture: "Steadfast & Direct"
    },
    {
      id: "team-presentations",
      title: "Presentations & Meetings",
      icon: Presentation,
      tagline: "Practice slide commentary, weekly team updates, and stakeholder briefings.",
      samplePrompt: "Walk your leadership team through quarterly progress, key roadblocks, and next priorities.",
      targetEye: "88% Focus",
      targetWpm: "130–142 WPM",
      targetPosture: "Calm & Natural"
    },
    {
      id: "group-discussions",
      title: "Group Discussions (GD)",
      icon: Users,
      tagline: "Practice entering discussions smoothly, structuring points, and summarizing arguments.",
      samplePrompt: "Initiate a group discussion on remote work culture versus in-office collaboration.",
      targetEye: "90% Focus",
      targetWpm: "135–148 WPM",
      targetPosture: "Attentive & Open"
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
      a: "Miral is an AI-powered practice mirror for anyone who wants to speak with clarity and confidence. Whether you are preparing for a public speech, a college debate, a startup pitch, a job interview, or a team presentation, Miral gives you private, real-time feedback on how you look and sound."
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
      a: "Yes! Miral includes a built-in smart teleprompter. You can paste any speech, pitch deck notes, or interview script, adjust the font size, and practice reading while maintaining direct eye contact with the camera."
    },
    {
      q: "What is the recommended speaking speed (WPM)?",
      a: "For impactful public speaking, presentations, and interviews, the optimal conversational pacing is between 130 and 155 Words Per Minute (WPM). Speaking faster than 170 WPM often sounds rushed, while speaking below 115 WPM can lead to disengagement."
    },
    {
      q: "Does Miral work on mobile phones?",
      a: "Yes. Miral is fully responsive and works directly in mobile browsers like Chrome on Android and Safari on iOS with continuous speech transcription and audio pacing detection."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-[#090b10] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Subtle Ambient Gradient Header */}
      <div className="relative overflow-hidden border-b border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0c0e17]">
        
        {/* Soft Background Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_70%)] pointer-events-none" />

        {/* Top Announcement Bar */}
        <div className="border-b border-slate-100 dark:border-white/[0.06] bg-indigo-50/60 dark:bg-indigo-950/20 py-2 px-4 text-center">
          <p className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
            <span className="font-semibold mr-1.5">✦ Live AI Mirror:</span> 
            Real-time feedback on your eye contact, posture, and speaking pace — 100% private in your browser.
          </p>
        </div>

        {/* ===================== HERO SECTION ===================== */}
        <div className="container max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16 text-center space-y-6 relative">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Practice Mirror for Speeches, Pitches, Interviews & Debates</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3.5 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Everything you need to <span className="text-indigo-600 dark:text-indigo-400">speak with impact</span> and confidence.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Level up your public speaking, project pitches, job interviews, and debates with instant AI feedback on your eye contact, posture, pacing, and speech clarity.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <Link href="/practice">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-8 gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all">
                <Play className="h-4 w-4 fill-current" />
                <span>Get started for free</span>
                <ArrowRight className="h-4 w-4 ml-0.5" />
              </Button>
            </Link>

            <Link href="/scenarios">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-11 px-6 gap-2 border-slate-300 dark:border-white/15 bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.08]">
                <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Explore Practice Scenarios</span>
              </Button>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-5 sm:gap-8 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">100% In-Browser Privacy</span>
              <span>(Zero video stored)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Real-Time 60 FPS Feedback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Smart Script Teleprompter</span>
            </div>
          </div>

        </div>

      </div>

      {/* ===================== PRACTICE SCENARIOS SECTION (Compact & Tight) ===================== */}
      <section className="py-8 sm:py-10 border-b border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0c0e17]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose what you want to practice
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select a scenario or paste your custom script to launch the AI mirror.
              </p>
            </div>
            <Link href="/scenarios">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 gap-1 h-8 px-2.5">
                <span>View all scenarios</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const isSelected = selectedCategoryIdx === idx;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryIdx(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between min-h-[110px] ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-600/15 border-indigo-400 dark:border-indigo-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-[#090b12] border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500/20 dark:text-indigo-400' 
                      : 'bg-slate-200/70 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{cat.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Scenario Drawer Card */}
          <div className="mt-3.5 rounded-xl border border-slate-200 dark:border-white/[0.10] bg-slate-50/70 dark:bg-[#090b12] p-4 sm:p-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/40 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px]">
                    Active Practice Mode
                  </Badge>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {categories[selectedCategoryIdx].title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {categories[selectedCategoryIdx].tagline}
                </p>
              </div>

              <Button
                onClick={() => handleLaunchCategory(categories[selectedCategoryIdx])}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs px-4 h-9 gap-1.5 shrink-0 shadow-xs"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Practice This Scenario</span>
              </Button>
            </div>

            {/* Prompt */}
            <div className="my-3 p-3 rounded-lg bg-white dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Sample Practice Prompt:
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
                "{categories[selectedCategoryIdx].samplePrompt}"
              </p>
            </div>

            {/* Target Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
                <span className="text-[10px] text-slate-400 font-medium block">Target Gaze Focus</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{categories[selectedCategoryIdx].targetEye}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
                <span className="text-[10px] text-slate-400 font-medium block">Optimal Pace</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{categories[selectedCategoryIdx].targetWpm}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-white/[0.06] bg-white dark:bg-white/[0.02]">
                <span className="text-[10px] text-slate-400 font-medium block">Body Posture</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{categories[selectedCategoryIdx].targetPosture}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===================== INTERACTIVE SPEECH PACE (WPM) SANDBOX ===================== */}
      <section className="py-8 sm:py-10 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#090b10]">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-6 space-y-1.5">
            <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-0.5">
              Interactive Speech Tempo Sandbox
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Discover your ideal speaking speed.
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drag the slider to understand how pacing affects audience retention and clarity.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-white/[0.10] bg-white dark:bg-[#0c0e17] p-4 sm:p-6 shadow-sm">
            
            {/* Sample Passage */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#090b12] border border-slate-200/80 dark:border-white/[0.08] space-y-1.5 text-left mb-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1 border-b border-slate-200 dark:border-white/[0.06]">
                <span className="font-mono text-[11px]">Passage {paceTextIndex + 1} of {samplePassages.length}</span>
                <button
                  type="button"
                  onClick={() => setPaceTextIndex((prev) => (prev + 1) % samplePassages.length)}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs"
                >
                  Try next passage →
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 italic leading-relaxed">
                "{samplePassages[paceTextIndex]}"
              </p>
            </div>

            {/* Interactive Slider Dial */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Speaking Pace:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white tabular-nums">{interactiveWpm} WPM</span>
                  <Badge 
                    variant="outline"
                    className={`text-[10px] ${
                      interactiveWpm >= 130 && interactiveWpm <= 155 
                        ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' 
                        : 'border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                    }`}
                  >
                    {interactiveWpm < 125 ? 'Too Slow' : interactiveWpm <= 155 ? 'Optimal Clarity Range' : 'Too Fast'}
                  </Badge>
                </div>
              </div>

              <input 
                type="range" 
                min={80} 
                max={220} 
                value={interactiveWpm} 
                onChange={(e) => setInteractiveWpm(Number(e.target.value))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer" 
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>80 WPM (Slow / Hesitant)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">130–155 WPM (Ideal Target)</span>
                <span>220 WPM (Rushing)</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== THE 4 PILLARS OF MIRAL (Unique Multimodal Concept) ===================== */}
      <section className="py-8 sm:py-12 border-b border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0c0e17]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-0.5">
              The Multimodal Speaking Mirror
            </Badge>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Real-time feedback on how you look and sound.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            
            {/* Pillar 1 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#090b12] p-4 space-y-2 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all">
              <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <Eye className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Eye Gaze Focus</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                60 FPS in-browser iris tracking ensures you maintain steady visual engagement with the camera lens.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#090b12] p-4 space-y-2 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all">
              <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 flex items-center justify-center">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Posture Alignment</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Detects slouching, leaning, or looking down in real time to keep your body language upright and calm.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#090b12] p-4 space-y-2 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all">
              <div className="h-9 w-9 rounded-lg bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
                <Gauge className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pacing (WPM) Meter</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tracks speaking cadence live and guides you into the optimal 130–155 WPM conversational rhythm.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-[#090b12] p-4 space-y-2 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all">
              <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Teleprompter</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste any custom speech, pitch deck outline, or presentation notes and read smoothly while on camera.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== HOW IT WORKS (3 Simple Steps) ===================== */}
      <section className="py-8 sm:py-12 border-b border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#090b10]">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Three simple steps to speaking mastery.
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No complex downloads. Works instantly in your web browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            
            {/* Step 1 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0c0e17] p-5 space-y-2">
              <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">01</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pick a Topic or Write a Script</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose from practice scenarios or paste your own custom speech into the built-in teleprompter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0c0e17] p-5 space-y-2">
              <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">02</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Practice with Real-Time HUD</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Speak on camera. Miral monitors your eye focus, posture, and speaking tempo with gentle on-screen cues.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0c0e17] p-5 space-y-2">
              <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">03</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Diagnostic Report</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get an instant breakdown of your confidence score, pacing, filler words, and personalized tips to improve.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== FAQ SECTION ===================== */}
      <section className="py-8 sm:py-12 border-b border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0c0e17]">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-8 space-y-1.5">
            <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-0.5">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Everything you need to know about Miral.
            </h2>
          </div>

          <div className="space-y-2.5 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-lg border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#090b12] overflow-hidden transition-all"
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
                    <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-white/[0.06] pt-2.5">
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
      <section className="py-10 sm:py-14 bg-slate-50/50 dark:bg-[#090b10] relative overflow-hidden">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-b from-indigo-50/80 via-white to-white dark:from-indigo-950/20 dark:via-[#0c0e17] dark:to-[#090b12] p-6 sm:p-10 text-center space-y-4 shadow-sm">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-indigo-300 dark:border-indigo-500/40 bg-indigo-100/60 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Ready for your next speech or interview?</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-xl mx-auto">
              Speak with confidence every single time.
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Open the practice studio directly in your browser. Completely free with zero sign-up required.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link href="/practice">
                <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-7 gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20">
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start Free Practice Session</span>
                </Button>
              </Link>
              <Link href="/scenarios">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-11 px-5 gap-2 border-slate-300 dark:border-white/15 bg-white dark:bg-white/[0.04] text-slate-700 dark:text-slate-200">
                  <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Browse All Scenarios</span>
                </Button>
              </Link>
            </div>

            <div className="pt-2 flex items-center justify-center gap-5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
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
