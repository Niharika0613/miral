// client/src/pages/home.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ShieldCheck, 
  Check, 
  ChevronDown, 
  Users,
  Briefcase,
  Mic2,
  Presentation,
  Scale,
  Compass,
  BarChart3,
  TrendingUp,
  Video,
  Building2,
  FileText,
  Play
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
      title: "Campus placement interviews",
      icon: Briefcase,
      tagline: "Practice behavioral questions, project walkthroughs, and HR self-introductions.",
      samplePrompt: "Tell me about a time you had to deliver a complex project under tight deadlines with shifting requirements.",
      targetEye: "88% direct focus",
      targetWpm: "130–145 wpm",
      targetPosture: "Professional and engaged"
    },
    {
      id: "public-speaking",
      title: "Public speaking and keynotes",
      icon: Mic2,
      tagline: "Overcome stage nervousness, project your voice clearly, and connect with your audience.",
      samplePrompt: "Deliver a two-minute opening talk on how curiosity drives breakthrough innovation in modern technology.",
      targetEye: "90% direct focus",
      targetWpm: "135–150 wpm",
      targetPosture: "Upright and steady"
    },
    {
      id: "startup-pitches",
      title: "Startup and project pitches",
      icon: Presentation,
      tagline: "Pitch your ideas, hackathon projects, and business proposals with clarity and energy.",
      samplePrompt: "Present your project's value proposition in 60 seconds and explain why existing alternatives fail.",
      targetEye: "92% direct focus",
      targetWpm: "140–155 wpm",
      targetPosture: "Dynamic and upright"
    },
    {
      id: "debates-mun",
      title: "Debates and Model UN",
      icon: Scale,
      tagline: "Deliver persuasive arguments, structured rebuttals, and counter-points under time limits.",
      samplePrompt: "Present a 90-second opening statement arguing for ethical AI governance in higher education.",
      targetEye: "92% direct focus",
      targetWpm: "145–160 wpm",
      targetPosture: "Steadfast and direct"
    },
    {
      id: "team-presentations",
      title: "Presentations and meetings",
      icon: FileText,
      tagline: "Practice slide commentary, weekly team updates, and stakeholder briefings.",
      samplePrompt: "Walk your project team through sprint progress, key roadblocks, and upcoming delivery priorities.",
      targetEye: "88% direct focus",
      targetWpm: "130–142 wpm",
      targetPosture: "Calm and natural"
    },
    {
      id: "group-discussions",
      title: "Group discussions",
      icon: Users,
      tagline: "Practice entering discussions smoothly, structuring points, and summarizing arguments.",
      samplePrompt: "Initiate a group discussion on remote work culture versus in-office collaboration.",
      targetEye: "90% direct focus",
      targetWpm: "135–148 wpm",
      targetPosture: "Attentive and open"
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
      label: 'Live practice studio',
      icon: Video,
      image: '/images/practice-preview-v3.png',
      badge: 'In-browser analysis',
      heading: 'Live eye contact, posture, and speech cadence',
      description: 'Practice directly in front of your camera. VaniDarpan measures camera gaze, spinal alignment, speaking speed (WPM), and filler words directly on your device.'
    },
    {
      id: 'scenarios' as const,
      label: 'Curated scenarios',
      icon: Compass,
      image: '/images/scenarios-preview-v3.png',
      badge: 'Prompt library',
      heading: 'Structured practice across placement and speaking tracks',
      description: 'Choose from campus HR rounds, technical project defenses, group discussions, and debates. Each track comes with curated questions and benchmark focus targets.'
    },
    {
      id: 'dashboard' as const,
      label: 'Analytics dashboard',
      icon: BarChart3,
      image: '/images/dashboard-preview-v3.png',
      badge: 'Student progress',
      heading: 'Session comparisons and delivery scorecards',
      description: 'Review your total practice sessions, composite confidence score, time invested, and comparative improvements across eye contact, posture, and pacing.'
    },
    {
      id: 'trajectory' as const,
      label: 'Progress trajectory',
      icon: TrendingUp,
      image: '/images/trajectory-preview-v3.png',
      badge: 'Growth curve',
      heading: 'Historical multi-session improvement curves',
      description: 'Visualize your progress over time with clean trendlines tracking your eye contact stability and composite confidence across all completed mock sessions.'
    }
  ];

  const activePreview = previewTabs.find(t => t.id === activePreviewTab) || previewTabs[0];

  const faqs = [
    {
      q: "What is VaniDarpan and who is it built for?",
      a: "VaniDarpan is a private AI practice mirror for public speaking and interviews. Built for Indian college students and placement cells, it helps speakers see what they cannot see themselves: eye contact, posture, pace, and filler words."
    },
    {
      q: "How does the real-time eye contact and posture tracking work?",
      a: "VaniDarpan runs lightweight computer vision models directly inside your browser. It tracks facial orientation, camera lens gaze direction, and posture alignment in real time with sub-second feedback."
    },
    {
      q: "Are my camera video or audio recordings uploaded to any server?",
      a: "No. Your video is analysed on your device and is not uploaded. Camera frames never leave your computer or phone, ensuring complete privacy during every practice session."
    },
    {
      q: "Why should I create a free account?",
      a: "Creating an account lets you save your practice history, track your improvement over time on your dashboard, and preserve past session scorecards and custom speech scripts."
    },
    {
      q: "Can I practice my own custom speeches or scripts?",
      a: "Yes. VaniDarpan includes a built-in teleprompter. You can paste any speech, pitch outline, or interview answer, adjust the font size, and practice speaking while maintaining eye contact with the camera."
    },
    {
      q: "What is the recommended speaking speed (WPM)?",
      a: "For interviews and presentations, the recommended conversational pacing is between 130 and 150 words per minute. Pacing faster than 160 words per minute can sound rushed, while pacing below 120 words per minute may feel hesitant."
    }
  ];

  // College placement readiness heatmap sample data
  const heatmapData = [
    { branch: "Computer Science", eye: 84, pace: 88, posture: 82, clarity: 86, overall: 85 },
    { branch: "Information Technology", eye: 82, pace: 80, posture: 79, clarity: 84, overall: 81 },
    { branch: "Electronics & Comm.", eye: 76, pace: 74, posture: 78, clarity: 75, overall: 76 },
    { branch: "Mechanical Engineering", eye: 68, pace: 70, posture: 72, clarity: 69, overall: 70 },
    { branch: "Civil Engineering", eye: 62, pace: 65, posture: 66, clarity: 64, overall: 64 },
  ];

  const getHeatmapColor = (score: number) => {
    if (score >= 85) return 'bg-[#1F4FBF] text-white';
    if (score >= 80) return 'bg-[#5280D8] text-white';
    if (score >= 70) return 'bg-[#8FB0EC] text-ink';
    if (score >= 60) return 'bg-[#C5D6F6] text-ink';
    return 'bg-[#EAF0FC] text-ink';
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-text font-sans antialiased">

      {/* ===================== HERO SECTION ===================== */}
      <section className="py-16 md:py-24 bg-surface border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline, subtext, actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <h1 className="text-3xl sm:text-5xl lg:text-[44px] font-semibold tracking-[-0.01em] text-ink leading-[1.14]">
                Practice speaking in front of the camera, with feedback you can trust.
              </h1>

              <p className="text-base sm:text-lg text-text max-w-xl leading-relaxed">
                VaniDarpan tracks eye contact, posture, pace, and filler words on your device so you speak with confidence in interviews, pitches, and presentations.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/practice">
                  <Button className="h-10 px-6 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover border-transparent transition-colors">
                    Start practice
                  </Button>
                </Link>
                <Link href="/report/sample">
                  <Button variant="outline" className="h-10 px-6 text-sm font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface transition-colors">
                    See a sample report
                  </Button>
                </Link>
              </div>

              {/* Factual Privacy Reassurance */}
              <div className="flex items-center gap-2 pt-2 text-sm text-muted">
                <ShieldCheck className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                <span>Your video is analysed on your device and is not uploaded.</span>
              </div>
            </div>

            {/* Right Column: The Mirror Frame with 3 metric chips */}
            <div className="lg:col-span-5">
              <div className="relative bg-studio rounded-lg border border-hairline p-5 sm:p-6 shadow-sm aspect-[4/3] flex flex-col justify-between overflow-hidden">
                
                {/* Mirror Frame Viewfinder Markings */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Top tick */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-darpan-blue/80" />
                  {/* Bottom tick */}
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-darpan-blue/80" />
                  {/* Left tick */}
                  <div className="absolute top-1/2 left-2.5 -translate-y-1/2 w-0.5 h-4 bg-darpan-blue/80" />
                  {/* Right tick */}
                  <div className="absolute top-1/2 right-2.5 -translate-y-1/2 w-0.5 h-4 bg-darpan-blue/80" />
                  
                  {/* Corner viewfinder brackets */}
                  <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-white/20" />
                  <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-white/20" />
                  <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-white/20" />
                  <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-white/20" />

                  {/* Center subtle focal ring */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-darpan-blue/80" />
                  </div>
                </div>

                {/* Top Row: Camera Active Indicator */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#1B1F26] border border-[#262B35] text-xs text-slate-200">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Camera active</span>
                  </div>

                  {/* Metric Chip 1: Eye Contact */}
                  <div className="bg-paper text-ink rounded-md border border-hairline px-3 py-2 text-left shadow-sm">
                    <div className="text-[11px] text-muted">Eye contact</div>
                    <div className="text-sm font-semibold tabular-nums text-success flex items-center gap-1">
                      <span>88%</span>
                      <span className="text-[10px] text-muted font-normal">target met</span>
                    </div>
                  </div>
                </div>

                {/* Center Speaker Outline (Quiet Silhouette) */}
                <div className="relative z-0 flex flex-col items-center justify-center my-auto opacity-75">
                  <div className="w-16 h-16 rounded-full border border-white/15 bg-white/5 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/10" />
                  </div>
                  <div className="w-32 h-10 mt-1 rounded-t-full bg-white/5 border-t border-white/15" />
                </div>

                {/* Bottom Row: Pace & Fillers Metric Chips */}
                <div className="relative z-10 flex items-center justify-between gap-3">
                  {/* Metric Chip 2: Pace */}
                  <div className="bg-paper text-ink rounded-md border border-hairline px-3 py-2 text-left shadow-sm">
                    <div className="text-[11px] text-muted">Pace</div>
                    <div className="text-sm font-semibold tabular-nums text-ink">
                      142 wpm
                    </div>
                  </div>

                  {/* Metric Chip 3: Fillers */}
                  <div className="bg-paper text-ink rounded-md border border-hairline px-3 py-2 text-left shadow-sm">
                    <div className="text-[11px] text-muted">Fillers</div>
                    <div className="text-sm font-semibold tabular-nums text-caution">
                      2 detected
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== HOW A SESSION WORKS ===================== */}
      <section className="py-20 md:py-24 bg-paper border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              How a session works
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Three steps from launch to diagnostic report. Everything runs in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Step 1 */}
            <div className="bg-surface border border-hairline rounded-lg p-6 space-y-3">
              <div className="text-sm font-semibold text-darpan-blue tabular-nums">01</div>
              <h3 className="text-base font-semibold text-ink">Choose a scenario</h3>
              <p className="text-sm text-text leading-relaxed">
                Select a placement interview, campus debate, startup pitch, or paste a custom script into the teleprompter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-surface border border-hairline rounded-lg p-6 space-y-3">
              <div className="text-sm font-semibold text-darpan-blue tabular-nums">02</div>
              <h3 className="text-base font-semibold text-ink">Speak to the camera</h3>
              <p className="text-sm text-text leading-relaxed">
                Deliver your speech. Real-time on-device vision and acoustic analysis measures gaze, posture, and pacing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-surface border border-hairline rounded-lg p-6 space-y-3">
              <div className="text-sm font-semibold text-darpan-blue tabular-nums">03</div>
              <h3 className="text-base font-semibold text-ink">Read your report</h3>
              <p className="text-sm text-text leading-relaxed">
                Review an objective breakdown of your filler words, cadence curve, and a single concrete next step to improve.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== PRACTICE SCENARIOS SECTION ===================== */}
      <section className="py-20 md:py-24 bg-surface border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              Practice scenarios
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Choose a scenario below to load recommended benchmarks and practice prompts.
            </p>
          </div>

          {/* Cards Grid: 6 cards in a 3-column layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const isSelected = selectedCategoryIdx === idx;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryIdx(idx)}
                  className={`p-5 rounded-lg border transition-all cursor-pointer text-left flex items-start gap-4 ${
                    isSelected
                      ? 'bg-paper border-darpan-blue ring-1 ring-darpan-blue'
                      : 'bg-paper border-hairline hover:border-gray-300'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${
                    isSelected 
                      ? 'bg-darpan-blue-tint text-darpan-blue' 
                      : 'bg-surface text-muted'
                  }`}>
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-ink truncate">{cat.title}</h3>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {cat.tagline}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Scenario Preview Card */}
          <div className="mt-6 rounded-lg border border-hairline bg-paper p-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-darpan-blue bg-darpan-blue-tint px-2 py-0.5 rounded-md">
                    Selected scenario
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {categories[selectedCategoryIdx].title}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {categories[selectedCategoryIdx].tagline}
                </p>
              </div>

              <Button
                onClick={() => handleLaunchCategory(categories[selectedCategoryIdx])}
                className="h-10 px-5 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover shrink-0 transition-colors"
              >
                Practice this scenario
              </Button>
            </div>

            {/* Prompt */}
            <div className="my-5 p-4 rounded-md bg-surface border border-hairline">
              <span className="text-xs text-muted block mb-1 font-medium">
                Sample prompt
              </span>
              <p className="text-sm text-ink leading-relaxed">
                "{categories[selectedCategoryIdx].samplePrompt}"
              </p>
            </div>

            {/* Benchmark Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-md border border-hairline bg-surface">
                <span className="text-xs text-muted block">Target gaze focus</span>
                <span className="text-sm font-semibold text-ink tabular-nums">{categories[selectedCategoryIdx].targetEye}</span>
              </div>
              <div className="p-3 rounded-md border border-hairline bg-surface">
                <span className="text-xs text-muted block">Optimal pace</span>
                <span className="text-sm font-semibold text-ink tabular-nums">{categories[selectedCategoryIdx].targetWpm}</span>
              </div>
              <div className="p-3 rounded-md border border-hairline bg-surface">
                <span className="text-xs text-muted block">Body posture</span>
                <span className="text-sm font-semibold text-ink">{categories[selectedCategoryIdx].targetPosture}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-hairline flex justify-end">
              <Link href="/scenarios" className="text-xs font-medium text-darpan-blue hover:underline">
                Browse all scenarios
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ===================== REPORT PREVIEWS WITH SCREENSHOTS ===================== */}
      <section className="py-20 md:py-24 bg-paper border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              Objective feedback on how you speak
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Review actual measurements from the practice studio and diagnostic report.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-hairline pb-4 mb-6">
            {previewTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePreviewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePreviewTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors border ${
                    isActive
                      ? 'bg-darpan-blue border-darpan-blue text-white'
                      : 'bg-surface border-hairline text-text hover:text-ink hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preview Container */}
          <div className="rounded-lg border border-hairline bg-paper overflow-hidden text-left">
            
            {/* Window Bar */}
            <div className="px-4 py-3 bg-surface border-b border-hairline flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                </div>
                <span className="text-xs text-muted font-medium">
                  vanidarpan.app/{activePreviewTab}
                </span>
              </div>
              <span className="text-xs text-muted bg-paper border border-hairline px-2 py-0.5 rounded-md">
                {activePreview.badge}
              </span>
            </div>

            {/* Content Grid */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 rounded-lg border border-hairline overflow-hidden bg-studio">
                <img 
                  src={activePreview.image} 
                  alt={activePreview.heading} 
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-ink leading-snug">
                    {activePreview.heading}
                  </h3>
                  <p className="text-sm text-text leading-relaxed">
                    {activePreview.description}
                  </p>
                </div>

                <div className="pt-2">
                  <Link href={activePreviewTab === 'scenarios' ? '/scenarios' : activePreviewTab === 'dashboard' ? '/dashboard' : '/practice'}>
                    <Button variant="outline" className="h-10 text-sm font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface">
                      Open {activePreview.label.toLowerCase()}
                    </Button>
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ===================== FOR COLLEGES INSTITUTIONAL BAND ===================== */}
      <section className="py-20 md:py-24 bg-surface border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="space-y-2 text-left max-w-2xl">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
                  For colleges and placement cells
                </h2>
                <Badge variant="outline" className="border-hairline bg-paper text-muted text-xs font-normal px-2 py-0.5">
                  Sample data
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-muted">
                See how ready a batch is before campus drives begin. Identify students who need support and track progress across branches.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/tpo">
                <Button className="h-10 px-5 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover transition-colors">
                  Open college overview
                </Button>
              </Link>
              <Link href="/contact?type=pilot">
                <Button variant="outline" className="h-10 px-5 text-sm font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface transition-colors">
                  Request a pilot
                </Button>
              </Link>
            </div>
          </div>

          {/* Readiness Heatmap Card */}
          <div className="bg-paper border border-hairline rounded-lg p-6 text-left space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div>
                <h3 className="text-base font-semibold text-ink">Placement readiness by branch and skill</h3>
                <p className="text-xs text-muted mt-0.5">Aggregated metrics from recent student practice sessions</p>
              </div>
              <div className="text-xs text-muted font-medium">Batch of 2026</div>
            </div>

            {/* Heatmap Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-hairline text-xs font-medium text-muted">
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3 text-right">Eye contact</th>
                    <th className="py-2.5 px-3 text-right">Pace</th>
                    <th className="py-2.5 px-3 text-right">Posture</th>
                    <th className="py-2.5 px-3 text-right">Clarity</th>
                    <th className="py-2.5 px-3 text-right">Overall readiness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {heatmapData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface transition-colors">
                      <td className="py-3 px-3 font-medium text-ink">{row.branch}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-block w-14 py-1 text-center rounded-sm text-xs font-medium tabular-nums ${getHeatmapColor(row.eye)}`}>
                          {row.eye}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-block w-14 py-1 text-center rounded-sm text-xs font-medium tabular-nums ${getHeatmapColor(row.pace)}`}>
                          {row.pace}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-block w-14 py-1 text-center rounded-sm text-xs font-medium tabular-nums ${getHeatmapColor(row.posture)}`}>
                          {row.posture}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-block w-14 py-1 text-center rounded-sm text-xs font-medium tabular-nums ${getHeatmapColor(row.clarity)}`}>
                          {row.clarity}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-block w-14 py-1 text-center rounded-sm text-xs font-medium tabular-nums ${getHeatmapColor(row.overall)}`}>
                          {row.overall}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Heatmap Legend */}
            <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-4 text-xs text-muted">
              <span className="font-medium">Readiness scale:</span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#EAF0FC] border border-hairline" />
                  <span>&lt;60% Needs support</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#C5D6F6]" />
                  <span>60–70% Developing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#8FB0EC]" />
                  <span>70–80% Competent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#5280D8]" />
                  <span>80–90% Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#1F4FBF]" />
                  <span>90%+ Outstanding</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== PLANS IN THREE COLUMNS ===================== */}
      <section className="py-20 md:py-24 bg-paper border-b border-hairline">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              Plans and access
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Individual practice for students, and batch analytics for universities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Free Candidate */}
            <div className="bg-paper border border-hairline rounded-lg p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-ink">Free candidate</h3>
                  <p className="text-xs text-muted">For students starting self-practice.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-ink tabular-nums">₹0</span>
                  <span className="text-xs text-muted">/ free</span>
                </div>

                <ul className="space-y-2.5 text-xs text-text pt-2 border-t border-hairline">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>3 practice sessions per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Real-time eye contact tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Posture stability alerts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Pacing gauge (WPM)</span>
                  </li>
                </ul>
              </div>

              <Link href="/practice">
                <Button variant="outline" className="w-full h-10 text-sm font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface">
                  Start practice
                </Button>
              </Link>
            </div>

            {/* Student Pro */}
            <div className="bg-paper border-2 border-darpan-blue rounded-lg p-6 flex flex-col justify-between space-y-6 relative shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">Student Pro</h3>
                  <span className="text-[11px] font-semibold text-brass bg-[#FDF1DC] border border-[#F5E6CC] px-2 py-0.5 rounded-sm">
                    Pro
                  </span>
                </div>
                <p className="text-xs text-muted">For thorough placement and interview preparation.</p>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-ink tabular-nums">₹499</span>
                  <span className="text-xs text-muted">/ month</span>
                </div>

                <ul className="space-y-2.5 text-xs text-text pt-2 border-t border-hairline">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Unlimited practice sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Full filler word analysis and transcript</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Historical progress curves</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Verifiable completion certificate</span>
                  </li>
                </ul>
              </div>

              <Link href="/pricing">
                <Button className="w-full h-10 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover">
                  Choose Student Pro
                </Button>
              </Link>
            </div>

            {/* College Campus Pilot */}
            <div className="bg-paper border border-hairline rounded-lg p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-ink">College campus pilot</h3>
                  <p className="text-xs text-muted">For placement cells, HODs, and faculty.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-ink">Custom</span>
                  <span className="text-xs text-muted">/ institutional</span>
                </div>

                <ul className="space-y-2.5 text-xs text-text pt-2 border-t border-hairline">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Department readiness heatmaps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Students needing support lists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Batch CSV exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
                    <span>Dedicated onboarding and pilot review</span>
                  </li>
                </ul>
              </div>

              <Link href="/contact?type=pilot">
                <Button variant="outline" className="w-full h-10 text-sm font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface">
                  Request campus pilot
                </Button>
              </Link>
            </div>

          </div>

          <div className="mt-8 text-center">
            <Link href="/pricing" className="text-xs font-medium text-darpan-blue hover:underline">
              View detailed pricing comparison
            </Link>
          </div>

        </div>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section className="py-20 md:py-24 bg-surface border-b border-hairline">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          
          <div className="text-left mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              Frequently asked questions
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Common questions about on-device analysis, privacy, and practice modes.
            </p>
          </div>

          <div className="space-y-3 text-left">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-lg border border-hairline bg-paper overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-medium text-sm text-ink hover:text-darpan-blue transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-muted transition-transform duration-200 shrink-0 ml-3 ${isOpen ? 'rotate-180 text-darpan-blue' : ''}`} strokeWidth={1.75} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-sm text-text leading-relaxed border-t border-hairline pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ===================== READY TO PRACTICE CTA ===================== */}
      <section className="py-20 md:py-24 bg-paper text-center">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 space-y-6">
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              Start your first practice session
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-lg mx-auto">
              Practice in front of the camera and get instant feedback on eye contact, posture, and pacing.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/practice">
              <Button className="h-10 px-6 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover transition-colors">
                Start practice
              </Button>
            </Link>
            <Link href="/report/sample">
              <Button variant="outline" className="h-10 px-6 text-sm font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface transition-colors">
                See a sample report
              </Button>
            </Link>
          </div>

          <div className="pt-2 text-xs text-muted">
            Your video is analysed on your device and is not uploaded.
          </div>

        </div>
      </section>

    </div>
  );
}
