// client/src/pages/home.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
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
  Video
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
      id: "public-speaking",
      title: "Public Speaking & Keynotes",
      icon: Mic2,
      tagline: "Overcome stage nervousness, project your voice clearly, and connect with your audience.",
      samplePrompt: "Deliver a 2-minute opening talk on how curiosity drives breakthrough innovation in modern technology.",
      targetEye: "90% Direct Focus",
      targetWpm: "135–150 WPM",
      targetPosture: "Upright & Confident"
    },
    {
      id: "job-interviews",
      title: "Job & Placement Interviews",
      icon: Briefcase,
      tagline: "Practice behavioral questions, project walkthroughs, and executive self-introductions.",
      samplePrompt: "Tell me about a time you had to deliver a complex project under tight deadlines with shifting requirements.",
      targetEye: "88% Direct Focus",
      targetWpm: "130–145 WPM",
      targetPosture: "Professional & Engaged"
    },
    {
      id: "startup-pitches",
      title: "Startup & Project Pitches",
      icon: Flame,
      tagline: "Pitch your ideas, hackathon projects, and business proposals with clarity and energy.",
      samplePrompt: "Present your project's unique value proposition in 60 seconds and explain why existing alternatives fail.",
      targetEye: "94% Direct Focus",
      targetWpm: "140–155 WPM",
      targetPosture: "Dynamic & Upright"
    },
    {
      id: "debates-mun",
      title: "Debates & Model UN",
      icon: Scale,
      tagline: "Deliver persuasive arguments, rebuttals, and structured points under time pressure.",
      samplePrompt: "Present a 90-second opening statement arguing for ethical AI governance in higher education.",
      targetEye: "92% Direct Focus",
      targetWpm: "145–160 WPM",
      targetPosture: "Steadfast & Direct"
    },
    {
      id: "team-presentations",
      title: "Presentations & Meetings",
      icon: Presentation,
      tagline: "Practice slide commentary, weekly team updates, and stakeholder briefings.",
      samplePrompt: "Walk your leadership team through quarterly progress, key roadblocks, and next priorities.",
      targetEye: "88% Direct Focus",
      targetWpm: "130–142 WPM",
      targetPosture: "Calm & Natural"
    },
    {
      id: "group-discussions",
      title: "Group Discussions (GD)",
      icon: Users,
      tagline: "Practice entering discussions smoothly, structuring points, and summarizing arguments.",
      samplePrompt: "Initiate a group discussion on remote work culture versus in-office collaboration.",
      targetEye: "90% Direct Focus",
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

  const previewTabs = [
    {
      id: 'practice' as const,
      label: 'Live Practice Studio',
      icon: Video,
      image: '/images/practice-preview-v3.png',
      badge: 'Real-Time In-Browser Feedback',
      heading: 'Live Eye Gaze, Posture & Transcript Analysis',
      description: 'Practice directly on camera. Miral calculates your real-time eye gaze percentage, upright posture stability, speaking tempo (WPM), and live speech transcript with 100% in-browser WebAssembly.'
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
      q: "What is Miral and who is it built for?",
      a: "Miral is an AI practice mirror for anyone who wants to speak with confidence. Whether you are preparing for a public speech, a college debate, a startup pitch, a job interview, or a team presentation, Miral gives you real-time visual and audio feedback on how you look and sound."
    },
    {
      q: "How does the real-time AI eye contact and posture tracking work?",
      a: "Miral runs lightweight computer vision models directly inside your browser using WebAssembly. It tracks your facial orientation, eye gaze direction towards the camera lens, and posture alignment at 60 FPS in real time with zero latency."
    },
    {
      q: "Are my camera video or audio recordings uploaded to any server?",
      a: "No. All camera processing and vision inference happen 100% locally on your own computer or phone. Video frames never leave your device, ensuring complete privacy while you practice."
    },
    {
      q: "Why should I create a free account?",
      a: "Creating a free account allows Miral to save your practice history, track your improvement over time on your personal dashboard, and preserve your past session scorecards and custom speech scripts."
    },
    {
      q: "Can I practice my own custom speeches or scripts?",
      a: "Yes! Miral includes a built-in smart teleprompter. You can paste any speech, pitch deck notes, or interview script, adjust the font size, and practice reading while maintaining direct eye contact with the camera."
    },
    {
      q: "What is the recommended speaking speed (WPM)?",
      a: "For impactful public speaking, presentations, and interviews, the optimal conversational pacing is between 130 and 155 Words Per Minute (WPM). Speaking faster than 170 WPM often sounds rushed, while speaking below 115 WPM can lead to disengagement."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/70 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      
      {/* Top Announcement Bar */}
      <div className="border-b border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/70 dark:bg-indigo-950/30 py-2 px-4 text-center">
        <p className="text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300">
          <span className="font-semibold mr-1.5">✦ Live AI Practice Mirror:</span> 
          Real-time feedback on your eye contact, posture, speaking pace, and clarity — 100% private in your browser.
        </p>
      </div>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1322]">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>AI Practice Mirror for Speeches, Pitches, Interviews & Debates</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3.5">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Everything you need to <span className="text-indigo-600 dark:text-indigo-400">speak with impact</span> and confidence.
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Level up your public speaking, project pitches, job interviews, and debates with instant AI feedback on your eye contact, body posture, pacing (WPM), and speech clarity.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            {user ? (
              <Link href="/practice">
                <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                  <Play className="h-4 w-4 fill-current" />
                  <span>Launch Practice Studio</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                    <UserPlus className="h-4 w-4" />
                    <span>Create Free Account</span>
                    <ArrowRight className="h-4 w-4 ml-0.5" />
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-11 px-6 gap-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Play className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 fill-current" />
                    <span>Try Instant Practice Session</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Privacy & Feature Guarantees */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
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
          </div>

        </div>
      </section>

      {/* ===================== PRACTICE SCENARIOS SECTION ===================== */}
      <section className="py-8 sm:py-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1322]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Choose what you want to practice
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select any scenario below or paste your custom script to start.
              </p>
            </div>
            <Link href="/scenarios">
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 gap-1 h-8 px-2.5">
                <span>View all scenarios</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Cards Row */}
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
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-500 shadow-xs'
                      : 'bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${
                    isSelected 
                      ? 'bg-indigo-600 text-white dark:bg-indigo-500/20 dark:text-indigo-400' 
                      : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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

          {/* Selected Scenario Preview Card */}
          <div className="mt-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-5 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 h-9 gap-1.5 shrink-0 shadow-xs"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Practice This Scenario</span>
              </Button>
            </div>

            {/* Prompt */}
            <div className="my-3 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Sample Practice Question / Prompt:
              </span>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
                "{categories[selectedCategoryIdx].samplePrompt}"
              </p>
            </div>

            {/* Benchmark Targets */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 font-medium block">Target Gaze Focus</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{categories[selectedCategoryIdx].targetEye}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 font-medium block">Optimal Pace</span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{categories[selectedCategoryIdx].targetWpm}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 font-medium block">Body Posture</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{categories[selectedCategoryIdx].targetPosture}</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ===================== REAL PRODUCT APP PREVIEWS (Engaging & Visual) ===================== */}
      <section className="py-10 sm:py-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#090b10]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-0.5">
              Inside Miral
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              See the actual practice studio in action.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Explore real screenshots of the practice studio, scenario libraries, and performance dashboards.
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
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
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
                  miral.app/{activePreviewTab}
                </span>
              </div>
              <Badge variant="outline" className="border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px]">
                {activePreview.badge}
              </Badge>
            </div>

            {/* Main Screenshot & Description Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Image Preview Container */}
              <div className="lg:col-span-8 rounded-xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden shadow-sm bg-slate-950">
                <img 
                  src={activePreview.image} 
                  alt={activePreview.heading} 
                  className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-300"
                />
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

      {/* ===================== WHAT MIRAL ANALYZES IN REAL TIME ===================== */}
      <section className="py-8 sm:py-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1322]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-1.5">
            <Badge variant="outline" className="border-indigo-300 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs px-2.5 py-0.5">
              Multimodal Speaking Intelligence
            </Badge>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Real-time feedback on how you look and sound.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            
            {/* Feature 1 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19] p-4 space-y-2 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all">
              <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                <Eye className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Eye Gaze Engagement</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                60 FPS in-browser iris detection checks if you maintain steady eye engagement with the camera lens or look away.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19] p-4 space-y-2 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all">
              <div className="h-9 w-9 rounded-lg bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400 flex items-center justify-center">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Posture Alignment</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Detects slouching, leaning, or downward head tilt in real time so your physical presence projects confidence.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19] p-4 space-y-2 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all">
              <div className="h-9 w-9 rounded-lg bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
                <Gauge className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Speaking Pace (WPM)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Measures words per minute live to keep your cadence in the ideal 130–155 WPM conversational clarity zone.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0b0f19] p-4 space-y-2 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all">
              <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Teleprompter</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Paste any custom speech, pitch notes, or presentation outline and read naturally while on camera.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== HOW IT WORKS (3 Simple Steps) ===================== */}
      <section className="py-8 sm:py-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0b0f19]">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Three simple steps to speaking mastery.
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No software installation required. Runs directly in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            
            {/* Step 1 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322] p-5 space-y-2">
              <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">01</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pick a Scenario or Write a Script</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose a pre-built practice scenario or paste your own custom speech notes into the teleprompter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322] p-5 space-y-2">
              <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">02</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Practice with Live Visual Cues</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Speak on camera. Miral monitors your eye contact, posture, and speaking tempo with gentle on-screen cues.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322] p-5 space-y-2">
              <div className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">03</div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Review Diagnostic Scorecard</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get an instant breakdown of your confidence score, pacing, filler words, and personalized delivery advice.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== FAQ SECTION ===================== */}
      <section className="py-8 sm:py-12 border-b border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0e1322]">
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

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="py-10 sm:py-14 bg-slate-50/70 dark:bg-[#0b0f19] relative overflow-hidden">
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
              {user ? (
                <Link href="/practice">
                  <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-7 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                    <Play className="h-4 w-4 fill-current" />
                    <span>Launch Practice Studio</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-11 px-7 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20">
                    <UserPlus className="h-4 w-4" />
                    <span>Create Free Account</span>
                  </Button>
                </Link>
              )}
              <Link href="/scenarios">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-11 px-5 gap-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  <Compass className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Browse All Scenarios</span>
                </Button>
              </Link>
            </div>

            <div className="pt-2 flex items-center justify-center gap-5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>✓ Free Account</span>
              <span>✓ Save Progress History</span>
              <span>✓ Instant Browser Launch</span>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
