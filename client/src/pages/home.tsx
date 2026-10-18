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
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shuffle,
  Eye,
  Activity,
  Target,
  Award,
  Zap,
  CheckCircle2,
  Volume2,
  Gauge,
  Sliders
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/utils/auth';

export default function Home() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  // Hero Interactive Coaching Simulator State (Yoodli & Blomma style)
  const [simulatorTab, setSimulatorTab] = useState<'telemetry' | 'cues' | 'transcript' | 'scorecard'>('telemetry');
  const [isSimulatingLive, setIsSimulatingLive] = useState(true);
  const [simulatedWpm, setSimulatedWpm] = useState(138);
  const [simulatedGaze, setSimulatedGaze] = useState(89);

  // Blomma-style Sticky Scroll Step State
  const [activeStep, setActiveStep] = useState<number>(1);

  // Selected Category / Scenario State
  const [selectedCategoryIdx, setSelectedCategoryIdx] = useState(0);

  // Interactive 60-Second Table Topics / Impromptu Drill State (Yoodli style)
  const [impromptuIdx, setImpromptuIdx] = useState(0);

  // Product Screenshot Showcase Tab
  const [activePreviewTab, setActivePreviewTab] = useState<'practice' | 'scenarios' | 'dashboard' | 'trajectory'>('practice');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  // Simulate realistic breathing telemetry in Hero Studio Mock
  useEffect(() => {
    if (!isSimulatingLive) return;
    const interval = setInterval(() => {
      setSimulatedWpm(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = prev + delta;
        return next > 146 ? 142 : next < 132 ? 136 : next;
      });
      setSimulatedGaze(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next > 94 ? 90 : next < 84 ? 86 : next;
      });
    }, 2400);
    return () => clearInterval(interval);
  }, [isSimulatingLive]);

  // Practice Scenarios (Placement, Pitches, Keynotes, Debates, Presentations, GD)
  const categories = [
    {
      id: "job-interviews",
      title: "Campus placement interviews",
      categoryName: "Placement HR & Technical",
      icon: Briefcase,
      tagline: "Practice behavioral questions, project walkthroughs, and HR self-introductions.",
      samplePrompt: "Tell me about a time you had to deliver a complex project under tight deadlines with shifting requirements.",
      targetEye: "88% direct focus",
      targetWpm: "130–145 wpm",
      targetPosture: "Professional and engaged",
      keyChecklist: [
        "Frame using the STAR methodology (Situation, Task, Action, Result)",
        "Highlight your specific contribution versus team efforts",
        "Quantify the outcome with measurable performance metrics"
      ],
      curatedQuestions: [
        "Tell me about a time you had to deliver a complex project under tight deadlines.",
        "Why do you want to join our organization and how does your skill set align?",
        "Describe a critical technical bug you encountered and how you diagnosed it."
      ]
    },
    {
      id: "public-speaking",
      title: "Public speaking and keynotes",
      categoryName: "Keynotes & Auditorium",
      icon: Mic2,
      tagline: "Overcome stage nervousness, project your voice clearly, and connect with your audience.",
      samplePrompt: "Deliver a two-minute opening talk on how curiosity drives breakthrough innovation in modern technology.",
      targetEye: "90% direct focus",
      targetWpm: "135–150 wpm",
      targetPosture: "Upright and steady",
      keyChecklist: [
        "Open with a compelling narrative hook in the first 15 seconds",
        "Vary your vocal pitch between key points to hold audience attention",
        "Conclude with a memorable call-to-action or thoughtful summary"
      ],
      curatedQuestions: [
        "Deliver a two-minute opening talk on how curiosity drives breakthrough innovation.",
        "Explain a difficult engineering concept in simple terms for a general audience.",
        "Share an inspiring personal story that shaped your ethical values."
      ]
    },
    {
      id: "startup-pitches",
      title: "Startup and project pitches",
      categoryName: "Ventures & Hackathons",
      icon: Presentation,
      tagline: "Pitch your ideas, hackathon projects, and business proposals with clarity and energy.",
      samplePrompt: "Present your project's value proposition in 60 seconds and explain why existing alternatives fail.",
      targetEye: "92% direct focus",
      targetWpm: "140–155 wpm",
      targetPosture: "Dynamic and upright",
      keyChecklist: [
        "Articulate the customer pain point within 10 seconds",
        "Demonstrate the unique technical moat or differentiation",
        "State your traction, user feedback, and upcoming milestone"
      ],
      curatedQuestions: [
        "Present your project's value proposition in 60 seconds.",
        "How does your product solve unit economics better than incumbent solutions?",
        "Pitch your hackathon prototype to an angel investor panel."
      ]
    },
    {
      id: "debates-mun",
      title: "Debates and Model UN",
      categoryName: "Parliamentary & MUN",
      icon: Scale,
      tagline: "Deliver persuasive arguments, structured rebuttals, and counter-points under time limits.",
      samplePrompt: "Present a 90-second opening statement arguing for ethical AI governance in higher education.",
      targetEye: "92% direct focus",
      targetWpm: "145–160 wpm",
      targetPosture: "Steadfast and direct",
      keyChecklist: [
        "Structure arguments into Assertion, Reasoning, and Empirical Evidence",
        "Address opposing arguments proactively before concluding",
        "Keep rhetorical pauses crisp to maximize timing efficiency"
      ],
      curatedQuestions: [
        "Present a 90-second opening statement on ethical AI governance in education.",
        "Deliver a counter-rebuttal against universal basic income in developing markets.",
        "Argue whether space exploration should prioritize private or public funding."
      ]
    },
    {
      id: "team-presentations",
      title: "Presentations and meetings",
      categoryName: "Workplace & Standups",
      icon: FileText,
      tagline: "Practice slide commentary, weekly team updates, and stakeholder briefings.",
      samplePrompt: "Walk your project team through sprint progress, key roadblocks, and upcoming delivery priorities.",
      targetEye: "88% direct focus",
      targetWpm: "130–142 wpm",
      targetPosture: "Calm and natural",
      keyChecklist: [
        "State the bottom line and decisions required upfront",
        "Briefly summarize progress before detailing technical blockers",
        "Assign clear action items with owners and target dates"
      ],
      curatedQuestions: [
        "Walk your project team through sprint progress, blockers, and next steps.",
        "Brief department leaders on a proposed architectural refactor.",
        "Present quarterly project accomplishments to non-technical stakeholders."
      ]
    },
    {
      id: "group-discussions",
      title: "Group discussions",
      categoryName: "Campus GD & Roundtables",
      icon: Users,
      tagline: "Practice entering discussions smoothly, structuring points, and summarizing arguments.",
      samplePrompt: "Initiate a group discussion on remote work culture versus in-office collaboration.",
      targetEye: "90% direct focus",
      targetWpm: "135–148 wpm",
      targetPosture: "Attentive and open",
      keyChecklist: [
        "Enter politely with acknowledgment: 'Building upon that perspective...'",
        "Introduce fresh dimensions (socio-economic, technical, operational)",
        "Maintain open posture and avoid interrupting aggressively"
      ],
      curatedQuestions: [
        "Initiate a group discussion on remote work culture versus in-office collaboration.",
        "Provide a balanced intervention on the role of social media in public discourse.",
        "Summarize the consensus of a heated discussion in 60 seconds."
      ]
    }
  ];

  // Quick 60-Second Impromptu Speech Prompts (Yoodli Table Topics style)
  const impromptuPrompts = [
    {
      category: "Engineering & Innovation",
      question: "Defend why failure is an essential prerequisite for breakthrough engineering innovation.",
      roadmap: [
        "Hook (0-15s): State your central thesis on how testing assumptions uncovers truth",
        "Evidence (15-45s): Cite a real example (e.g., aerospace testing, compiler debugging)",
        "Takeaway (45-60s): Conclude with how deliberate failure accelerates learning"
      ]
    },
    {
      category: "Placement Behavioral",
      question: "Tell me about a time you handled a difficult disagreement with a team member.",
      roadmap: [
        "Situation (0-15s): Set up the technical disagreement without placing blame",
        "Action (15-45s): Explain how you used data, benchmarks, or prototypes to align",
        "Result (45-60s): Share the successful project delivery and preserved relationship"
      ]
    },
    {
      category: "Startup Elevator Pitch",
      question: "Pitch your favorite open-source project to a developer in 60 seconds.",
      roadmap: [
        "Problem (0-15s): What developer frustration does it immediately solve?",
        "Solution (15-40s): How does its architecture achieve superior speed or clarity?",
        "Call to Action (40-60s): How can they install it or contribute today?"
      ]
    },
    {
      category: "Spontaneous Public Speaking",
      question: "If you could teach one universal skill to every first-year engineering student, what would it be?",
      roadmap: [
        "Choice (0-15s): Name the skill clearly (e.g., clear communication, debugging)",
        "Rationale (15-45s): Explain why technical talent fails without this capability",
        "Vision (45-60s): Paint a picture of what university outcomes look like when mastered"
      ]
    }
  ];

  const handleLaunchCategory = (cat: typeof categories[0], promptText?: string) => {
    sessionStorage.setItem('practiceQuestion', JSON.stringify({
      question: promptText || cat.samplePrompt,
      outline: cat.keyChecklist
    }));
    sessionStorage.setItem('preferredTopic', cat.title);
    setLocation('/practice');
  };

  const handleLaunchImpromptu = (prompt: typeof impromptuPrompts[0]) => {
    sessionStorage.setItem('practiceQuestion', JSON.stringify({
      question: prompt.question,
      outline: prompt.roadmap
    }));
    sessionStorage.setItem('preferredTopic', prompt.category);
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
    <div className="flex flex-col min-h-screen bg-surface text-text font-sans antialiased selection:bg-darpan-blue-tint selection:text-darpan-blue">

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative py-14 sm:py-20 lg:py-24 bg-surface border-b border-hairline overflow-hidden">
        {/* Subtle grid background texture */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#1F4FBF 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline, subtext, actions */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-paper border border-hairline shadow-xs">
                <span className="h-2 w-2 rounded-full bg-darpan-blue animate-pulse shrink-0" />
                <span className="text-xs font-medium text-ink">
                  On-device AI speech mirror • Zero cloud video storage
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[46px] font-semibold tracking-[-0.015em] text-ink leading-[1.12]">
                Speak with authority. Coached in real time.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-text max-w-xl leading-relaxed">
                Practice campus interviews, pitches, and presentations in front of your camera. Get instant, objective feedback on eye contact, posture, pacing, and filler words — completely private on your device.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/practice">
                  <Button className="h-11 px-6 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover border-transparent transition-all shadow-xs flex items-center gap-2">
                    <span>Start free practice</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </Button>
                </Link>
                <a href="#interactive-simulator">
                  <Button variant="outline" className="h-11 px-5 text-sm font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface transition-colors flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-darpan-blue" />
                    <span>Explore simulator</span>
                  </Button>
                </a>
              </div>

              {/* Value Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-hairline max-w-lg">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-ink">100% On-device</div>
                  <div className="text-[11px] text-muted">No video uploaded</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-ink">Sub-second</div>
                  <div className="text-[11px] text-muted">Live coaching nudges</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-ink">Verifiable</div>
                  <div className="text-[11px] text-muted">Progress scorecards</div>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Coaching Studio Simulator (Yoodli & Blomma style) */}
            <div id="interactive-simulator" className="lg:col-span-6">
              <div className="rounded-xl border border-hairline bg-paper shadow-institutional overflow-hidden text-left">
                
                {/* Simulator Mode Tabs Header */}
                <div className="px-4 py-3 bg-surface border-b border-hairline flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 p-1 bg-paper border border-hairline rounded-lg">
                    <button
                      onClick={() => setSimulatorTab('telemetry')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        simulatorTab === 'telemetry' 
                          ? 'bg-darpan-blue text-white' 
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      Live HUD
                    </button>
                    <button
                      onClick={() => setSimulatorTab('cues')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        simulatorTab === 'cues' 
                          ? 'bg-darpan-blue text-white' 
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      AI Cues
                    </button>
                    <button
                      onClick={() => setSimulatorTab('transcript')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        simulatorTab === 'transcript' 
                          ? 'bg-darpan-blue text-white' 
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      Fillers
                    </button>
                    <button
                      onClick={() => setSimulatorTab('scorecard')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        simulatorTab === 'scorecard' 
                          ? 'bg-darpan-blue text-white' 
                          : 'text-muted hover:text-ink'
                      }`}
                    >
                      Scorecard
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsSimulatingLive(!isSimulatingLive)}
                      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors px-2 py-0.5 rounded border border-hairline bg-paper"
                      title="Toggle live telemetry simulation"
                    >
                      <span className={`h-2 w-2 rounded-full ${isSimulatingLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className="tabular-nums">{isSimulatingLive ? 'Simulating' : 'Paused'}</span>
                    </button>
                  </div>
                </div>

                {/* Studio Screen Display Area */}
                <div className="relative bg-studio p-5 sm:p-6 text-white min-h-[340px] flex flex-col justify-between overflow-hidden">
                  
                  {/* TAB 1: Live HUD Telemetry View */}
                  {simulatorTab === 'telemetry' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Top status bar */}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1B1F26] border border-[#262B35] text-xs text-slate-200">
                          <Eye className="h-3.5 w-3.5 text-darpan-blue" />
                          <span>Iris gaze vector active</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 font-mono">01:42 / 03:00</span>
                        </div>
                      </div>

                      {/* Center Viewfinder & Face Crosshair */}
                      <div className="relative h-44 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center overflow-hidden">
                        {/* Crosshairs */}
                        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-px bg-white/10" />
                        <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-px bg-white/10" />
                        
                        {/* Target Focal Ring */}
                        <div className="relative w-24 h-24 rounded-full border border-darpan-blue/40 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full border border-darpan-blue/80 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-darpan-blue animate-ping" />
                          </div>
                        </div>

                        {/* Floating live gaze score chip */}
                        <div className="absolute top-3 right-3 bg-paper text-ink px-2.5 py-1 rounded text-xs font-semibold shadow-xs">
                          Gaze: <span className="text-success tabular-nums">{simulatedGaze}%</span>
                        </div>

                        {/* Alignment guides */}
                        <div className="absolute bottom-3 left-3 text-[11px] text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                          Shoulders: Level
                        </div>
                      </div>

                      {/* Bottom Live Metrics Row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[#1B1F26] border border-[#262B35] rounded-md p-2.5 text-left">
                          <div className="text-[10px] text-slate-400">Eye contact</div>
                          <div className="text-sm font-semibold text-emerald-400 tabular-nums">
                            {simulatedGaze}% target met
                          </div>
                        </div>
                        <div className="bg-[#1B1F26] border border-[#262B35] rounded-md p-2.5 text-left">
                          <div className="text-[10px] text-slate-400">Speaking pace</div>
                          <div className="text-sm font-semibold text-slate-100 tabular-nums">
                            {simulatedWpm} WPM
                          </div>
                        </div>
                        <div className="bg-[#1B1F26] border border-[#262B35] rounded-md p-2.5 text-left">
                          <div className="text-[10px] text-slate-400">Posture stability</div>
                          <div className="text-sm font-semibold text-emerald-400 tabular-nums">
                            94% upright
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Real-Time AI Coach Cues */}
                  {simulatorTab === 'cues' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-darpan-blue" />
                          Sub-second coaching cues
                        </span>
                        <span>Non-intrusive HUD</span>
                      </div>

                      {/* Toast Cues Sequence */}
                      <div className="space-y-2.5 py-2">
                        <div className="bg-[#1B1F26] border border-emerald-500/40 rounded-lg p-3 flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 text-xs font-semibold">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-100">Direct camera connection locked</div>
                            <div className="text-[11px] text-slate-400">Eye contact steady at 89% for 45 consecutive seconds.</div>
                          </div>
                        </div>

                        <div className="bg-[#1B1F26] border border-darpan-blue/40 rounded-lg p-3 flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-darpan-blue/20 text-darpan-blue flex items-center justify-center shrink-0 text-xs font-semibold">
                            <Gauge className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-100">Conversational rhythm optimal</div>
                            <div className="text-[11px] text-slate-400">Speaking at 138 WPM. Perfect for interviewer comprehension.</div>
                          </div>
                        </div>

                        <div className="bg-[#1B1F26] border border-amber-500/40 rounded-lg p-3 flex items-start gap-3">
                          <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xs font-semibold">
                            <Volume2 className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-100">Hesitation detected</div>
                            <div className="text-[11px] text-slate-400">Repeated 'basically'. Insert a 1-second silent breath instead.</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 text-right">
                        <span className="text-[11px] text-slate-400">Feedback runs locally with zero audio lag</span>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Filler Words & Live Transcript */}
                  {simulatorTab === 'transcript' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-semibold text-slate-200">Live Speech Transcription</span>
                        </div>
                        <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                          2 fillers detected
                        </span>
                      </div>

                      {/* Spoken Text Stream with Highlighted Fillers */}
                      <div className="bg-[#1B1F26] rounded-lg p-3.5 border border-[#262B35] text-xs font-mono leading-relaxed text-slate-300">
                        <p>
                          "When approaching our capstone project, our primary goal was <span className="text-amber-400 underline decoration-amber-400 font-semibold bg-amber-500/10 px-1 rounded">basically</span> to reduce latency on distributed microservices. We chose Go and gRPC because, <span className="text-amber-400 underline decoration-amber-400 font-semibold bg-amber-500/10 px-1 rounded">like</span>, serialization overhead was causing bottlenecks in client responses..."
                        </p>
                      </div>

                      {/* Filler Word Tag Breakdown */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-[#1B1F26] p-2 rounded border border-[#262B35]">
                          <div className="text-amber-400 font-bold tabular-nums">1</div>
                          <div className="text-[10px] text-slate-400">'basically'</div>
                        </div>
                        <div className="bg-[#1B1F26] p-2 rounded border border-[#262B35]">
                          <div className="text-amber-400 font-bold tabular-nums">1</div>
                          <div className="text-[10px] text-slate-400">'like'</div>
                        </div>
                        <div className="bg-[#1B1F26] p-2 rounded border border-[#262B35]">
                          <div className="text-emerald-400 font-bold tabular-nums">0</div>
                          <div className="text-[10px] text-slate-400">'um' / 'uh'</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Filler frequency: 1.4% (Benchmark: below 3% is considered executive standard)
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Post-Session Diagnostic Scorecard */}
                  {simulatorTab === 'scorecard' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="text-xs font-semibold text-slate-200">Diagnostic Summary</span>
                        <span className="text-xs font-semibold text-darpan-blue bg-darpan-blue-tint px-2 py-0.5 rounded">
                          Session Verified
                        </span>
                      </div>

                      {/* Composite Score Circle & Metrics */}
                      <div className="flex items-center gap-6 py-2">
                        <div className="relative w-20 h-20 rounded-full border-4 border-darpan-blue flex flex-col items-center justify-center shrink-0 bg-white/5">
                          <span className="text-2xl font-bold text-white tabular-nums">87</span>
                          <span className="text-[9px] uppercase tracking-wider text-slate-400">Score</span>
                        </div>
                        <div className="space-y-2 flex-1 text-xs">
                          <div>
                            <div className="flex justify-between text-slate-300 mb-1">
                              <span>Camera Gaze</span>
                              <span className="font-semibold text-emerald-400">89%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-emerald-400 w-[89%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-slate-300 mb-1">
                              <span>Pacing Stability</span>
                              <span className="font-semibold text-slate-100">138 WPM</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full bg-darpan-blue w-[92%]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Targeted Drill Recommendation */}
                      <div className="bg-[#1B1F26] border border-[#262B35] rounded-lg p-3 text-left">
                        <div className="text-[11px] font-semibold text-brass flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5" />
                          Recommended Next Drill:
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          "Practice 60s behavioral response using STAR framework with silent transitions."
                        </p>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link href="/report/sample" className="text-xs text-darpan-blue hover:underline">
                          Inspect full interactive report
                        </Link>
                      </div>
                    </div>
                  )}

                </div>

                {/* Simulator Bottom Bar */}
                <div className="px-5 py-3.5 bg-paper border-t border-hairline flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="text-muted">
                    Ready to practice on your own camera?
                  </span>
                  <Link href="/practice">
                    <Button size="sm" className="h-8 px-4 text-xs font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover">
                      Launch practice studio
                    </Button>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== BLOMMA-STYLE STICKY SCROLL FEATURE RAIL ===================== */}
      <section className="py-20 md:py-24 bg-paper border-b border-hairline">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-14 space-y-2">
            <div className="text-xs font-semibold text-darpan-blue tracking-wide uppercase">
              The Coaching Methodology
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-[-0.015em] text-ink">
              Three steps from launch to objective mastery
            </h2>
            <p className="text-base text-muted">
              Built on cognitive coaching research and real-time biometric feedback. Everything happens in your browser.
            </p>
          </div>

          {/* Sticky Side-by-Side 3-Step Walkthrough */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Steps Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              
              {/* Step 1 */}
              <div 
                onClick={() => setActiveStep(1)}
                className={`p-6 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 1 
                    ? 'bg-surface border-darpan-blue ring-1 ring-darpan-blue shadow-xs' 
                    : 'bg-paper border-hairline hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    activeStep === 1 ? 'bg-darpan-blue text-white' : 'bg-surface text-muted'
                  }`}>
                    01
                  </span>
                  <h3 className="text-lg font-semibold text-ink">Private On-Device Vision</h3>
                </div>
                <p className="text-sm text-text leading-relaxed">
                  Select a placement round, debate, or custom speech. Our in-browser WebAssembly engine tracks 468 facial landmarks and pupil gaze coordinates locally. Your video frames never leave your computer.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1 bg-paper border border-hairline px-2 py-1 rounded">
                    <Check className="h-3 w-3 text-darpan-blue" /> Zero server uploads
                  </span>
                  <span className="inline-flex items-center gap-1 bg-paper border border-hairline px-2 py-1 rounded">
                    <Check className="h-3 w-3 text-darpan-blue" /> 30 FPS landmark tracking
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div 
                onClick={() => setActiveStep(2)}
                className={`p-6 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 2 
                    ? 'bg-surface border-darpan-blue ring-1 ring-darpan-blue shadow-xs' 
                    : 'bg-paper border-hairline hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    activeStep === 2 ? 'bg-darpan-blue text-white' : 'bg-surface text-muted'
                  }`}>
                    02
                  </span>
                  <h3 className="text-lg font-semibold text-ink">Sub-Second Acoustic & Posture Telemetry</h3>
                </div>
                <p className="text-sm text-text leading-relaxed">
                  As you speak, non-intrusive visual cues help you calibrate pace and posture. The pacing speedometer indicates if you drop below 120 WPM or rush past 160 WPM, helping you stay in the executive cadence zone.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1 bg-paper border border-hairline px-2 py-1 rounded">
                    <Check className="h-3 w-3 text-darpan-blue" /> 130–150 WPM target guide
                  </span>
                  <span className="inline-flex items-center gap-1 bg-paper border border-hairline px-2 py-1 rounded">
                    <Check className="h-3 w-3 text-darpan-blue" /> Live hesitation detector
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => setActiveStep(3)}
                className={`p-6 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 3 
                    ? 'bg-surface border-darpan-blue ring-1 ring-darpan-blue shadow-xs' 
                    : 'bg-paper border-hairline hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    activeStep === 3 ? 'bg-darpan-blue text-white' : 'bg-surface text-muted'
                  }`}>
                    03
                  </span>
                  <h3 className="text-lg font-semibold text-ink">Actionable Diagnostic Blueprint</h3>
                </div>
                <p className="text-sm text-text leading-relaxed">
                  Receive an objective report dissecting your delivery: exact filler words (`um`, `like`, `basically`), speaking cadence timeline, and a single targeted drill to master before your next session.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                  <span className="inline-flex items-center gap-1 bg-paper border border-hairline px-2 py-1 rounded">
                    <Check className="h-3 w-3 text-darpan-blue" /> Filler word heatmap
                  </span>
                  <span className="inline-flex items-center gap-1 bg-paper border border-hairline px-2 py-1 rounded">
                    <Check className="h-3 w-3 text-darpan-blue" /> Verifiable certificate
                  </span>
                </div>
              </div>

            </div>

            {/* Right Interactive Sticky Display Rail */}
            <div className="lg:col-span-6 sticky top-24">
              <div className="rounded-xl border border-hairline bg-surface p-6 shadow-xs text-left space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-hairline">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-darpan-blue" />
                    <span className="text-xs font-semibold text-ink">
                      {activeStep === 1 && "Milestone 01: In-Browser Vision Stack"}
                      {activeStep === 2 && "Milestone 02: Real-Time Telemetry HUD"}
                      {activeStep === 3 && "Milestone 03: Post-Speech Diagnostic Matrix"}
                    </span>
                  </div>
                  <span className="text-xs text-muted font-mono">Step {activeStep} of 3</span>
                </div>

                {/* Step 1 Visual Showcase */}
                {activeStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 rounded-lg bg-paper border border-hairline space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-ink">Client-Side WASM Pipeline</span>
                        <span className="text-success font-semibold flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> 100% On-Device
                        </span>
                      </div>
                      <div className="space-y-2 text-xs text-muted">
                        <div className="flex justify-between py-1 border-b border-hairline">
                          <span>Camera Video Stream</span>
                          <span className="font-mono text-ink">1280x720 • 30 FPS</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-hairline">
                          <span>Facial Mesh Landmarks</span>
                          <span className="font-mono text-ink">468 3D Points</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-hairline">
                          <span>Pupil Gaze Vector Model</span>
                          <span className="font-mono text-ink">Sub-second Latency</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Server Upload Status</span>
                          <span className="font-semibold text-emerald-600">Zero Bytes Sent</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-darpan-blue-tint/60 border border-darpan-blue/20 text-xs text-darpan-blue">
                      You maintain complete privacy. No camera recording is ever stored or transmitted across external networks.
                    </div>
                  </div>
                )}

                {/* Step 2 Visual Showcase */}
                {activeStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 rounded-lg bg-paper border border-hairline space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-ink">Live Pace & Alignment Gauge</span>
                        <span className="text-darpan-blue font-semibold">138 WPM</span>
                      </div>
                      
                      {/* Pacing Scale */}
                      <div className="space-y-1">
                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden relative">
                          <div className="absolute left-[30%] right-[30%] h-full bg-emerald-400" />
                          <div className="absolute left-[54%] w-1.5 h-full bg-ink z-10" />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted font-mono">
                          <span>&lt;120 (Hesitant)</span>
                          <span className="font-semibold text-emerald-600">130–150 (Optimal)</span>
                          <span>&gt;165 (Rushed)</span>
                        </div>
                      </div>

                      {/* Live Alignment Status */}
                      <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                        <div className="p-2 rounded bg-surface border border-hairline">
                          <div className="text-[10px] text-muted">Eye Focus</div>
                          <div className="font-semibold text-ink">88% (Direct)</div>
                        </div>
                        <div className="p-2 rounded bg-surface border border-hairline">
                          <div className="text-[10px] text-muted">Posture Alignment</div>
                          <div className="font-semibold text-ink">Level Shoulders</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-paper border border-hairline text-xs text-text">
                      Discreet visual cues appear without disturbing your train of thought, training instinctive muscle memory.
                    </div>
                  </div>
                )}

                {/* Step 3 Visual Showcase */}
                {activeStep === 3 && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 rounded-lg bg-paper border border-hairline space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-ink">Diagnostic Delivery Audit</span>
                        <Badge variant="outline" className="text-[10px] text-darpan-blue border-darpan-blue/30">
                          Comprehensive
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-hairline">
                          <span className="text-muted">Fillers Detected</span>
                          <span className="font-semibold text-caution">2 words (1.4%)</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-hairline">
                          <span className="text-muted">Average Conversational Pace</span>
                          <span className="font-semibold text-ink">138 WPM</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-hairline">
                          <span className="text-muted">Gaze Stability</span>
                          <span className="font-semibold text-success">89%</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted">Composite Delivery Score</span>
                          <span className="font-semibold text-darpan-blue text-sm">87 / 100</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-darpan-blue-tint/60 border border-darpan-blue/20 text-xs text-darpan-blue">
                      Every diagnostic report concludes with a single targeted 60-second exercise to cement improvement.
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-between items-center">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <button
                        key={step}
                        onClick={() => setActiveStep(step)}
                        className={`h-2 rounded-full transition-all ${
                          activeStep === step ? 'w-6 bg-darpan-blue' : 'w-2 bg-gray-300'
                        }`}
                        aria-label={`Go to step ${step}`}
                      />
                    ))}
                  </div>

                  <Link href="/practice">
                    <Button variant="outline" size="sm" className="h-8 text-xs font-medium bg-paper border-hairline text-ink hover:bg-surface">
                      Try live studio
                    </Button>
                  </Link>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== INTERACTIVE 60-SECOND IMPROMPTU DRILL WIDGET (Yoodli Style) ===================== */}
      <section className="py-20 md:py-24 bg-surface border-b border-hairline">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-10 space-y-2">
            <div className="text-xs font-semibold text-darpan-blue tracking-wide uppercase">
              Instant Warm-Up
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              Try a 60-second impromptu speech drill
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Select or randomize a prompt below. Review the 3-part talking framework, then launch directly into the camera studio.
            </p>
          </div>

          {/* Drill Interactive Card */}
          <div className="rounded-xl border border-hairline bg-paper p-6 sm:p-8 text-left shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-darpan-blue bg-darpan-blue-tint px-2.5 py-0.5 rounded-full">
                    {impromptuPrompts[impromptuIdx].category}
                  </span>
                  <span className="text-xs text-muted">Prompt {impromptuIdx + 1} of {impromptuPrompts.length}</span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-ink pt-1">
                  "{impromptuPrompts[impromptuIdx].question}"
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImpromptuIdx((prev) => (prev + 1) % impromptuPrompts.length)}
                  className="h-9 px-3 text-xs font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface flex items-center gap-1.5"
                >
                  <Shuffle className="h-3.5 w-3.5 text-darpan-blue" />
                  <span>Randomize topic</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleLaunchImpromptu(impromptuPrompts[impromptuIdx])}
                  className="h-9 px-4 text-xs font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover flex items-center gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Practice in Studio</span>
                </Button>
              </div>
            </div>

            {/* 3-Part Talking Points Roadmap */}
            <div>
              <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
                Recommended 60-Second Speaking Blueprint:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {impromptuPrompts[impromptuIdx].roadmap.map((point, pIdx) => {
                  const [phase, ...details] = point.split(':');
                  return (
                    <div key={pIdx} className="p-3.5 rounded-lg border border-hairline bg-surface space-y-1">
                      <div className="text-xs font-semibold text-darpan-blue">{phase}</div>
                      <div className="text-xs text-text leading-relaxed">{details.join(':').trim()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-muted border-t border-hairline">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-darpan-blue" />
                Practice runs privately in your browser without saving video
              </span>
              <span className="font-mono text-ink font-medium">Recommended target: 130–150 WPM</span>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== PRACTICE SCENARIOS SECTION ===================== */}
      <section className="py-20 md:py-24 bg-paper border-b border-hairline">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-10 space-y-2">
            <div className="text-xs font-semibold text-darpan-blue tracking-wide uppercase">
              Curated Track Library
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              Choose your practice scenario
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Select a specialized track below to review curated questions, talking outlines, and benchmark targets.
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
                      ? 'bg-paper border-darpan-blue ring-1 ring-darpan-blue shadow-xs'
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
          <div className="mt-8 rounded-xl border border-hairline bg-surface p-6 sm:p-8 text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-hairline">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-darpan-blue bg-darpan-blue-tint px-2.5 py-0.5 rounded-full">
                    {categories[selectedCategoryIdx].categoryName}
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
                className="h-10 px-5 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover shrink-0 transition-colors flex items-center gap-2"
              >
                <span>Practice this scenario</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Prompt with 3 Curated Questions */}
            <div className="space-y-3">
              <span className="text-xs text-muted block font-semibold uppercase tracking-wider">
                Curated Practice Questions:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {categories[selectedCategoryIdx].curatedQuestions.map((qText, qIdx) => (
                  <div 
                    key={qIdx} 
                    className="p-4 rounded-lg bg-paper border border-hairline flex flex-col justify-between space-y-3"
                  >
                    <p className="text-xs sm:text-sm text-ink leading-relaxed font-medium">
                      "{qText}"
                    </p>
                    <button
                      onClick={() => handleLaunchCategory(categories[selectedCategoryIdx], qText)}
                      className="text-xs font-semibold text-darpan-blue hover:underline text-left inline-flex items-center gap-1"
                    >
                      <span>Practice this question</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmark Targets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-md border border-hairline bg-paper">
                <span className="text-xs text-muted block">Target gaze focus</span>
                <span className="text-sm font-semibold text-ink tabular-nums">{categories[selectedCategoryIdx].targetEye}</span>
              </div>
              <div className="p-3.5 rounded-md border border-hairline bg-paper">
                <span className="text-xs text-muted block">Optimal speaking pace</span>
                <span className="text-sm font-semibold text-ink tabular-nums">{categories[selectedCategoryIdx].targetWpm}</span>
              </div>
              <div className="p-3.5 rounded-md border border-hairline bg-paper">
                <span className="text-xs text-muted block">Expected posture</span>
                <span className="text-sm font-semibold text-ink">{categories[selectedCategoryIdx].targetPosture}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-hairline flex justify-end">
              <Link href="/scenarios" className="text-xs font-semibold text-darpan-blue hover:underline">
                Browse full scenario library (30+ questions) →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ===================== BEFORE VS AFTER BENCHMARK TRANSFORMATION ===================== */}
      <section className="py-20 md:py-24 bg-surface border-b border-hairline">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-12 space-y-2">
            <div className="text-xs font-semibold text-darpan-blue tracking-wide uppercase">
              Measured Progress
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              The transformation from first mock to mastery
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Here is what happens when a student practices with objective on-device telemetry over just three deliberate sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
            
            {/* Before Card */}
            <div className="rounded-xl border border-hairline bg-paper p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider block">First Mock Session</span>
                  <h3 className="text-base font-semibold text-ink">Without Objective Telemetry</h3>
                </div>
                <span className="text-xs font-semibold text-risk bg-risk-tint px-2.5 py-1 rounded-md">
                  Untrained
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-muted mb-1">
                    <span>Camera Eye Contact</span>
                    <span className="font-semibold text-risk tabular-nums">54% (Looking down)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-risk w-[54%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-muted mb-1">
                    <span>Speaking Pacing</span>
                    <span className="font-semibold text-risk tabular-nums">176 WPM (Rushed cadence)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-amber-500 w-[88%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-surface border border-hairline">
                    <span className="text-muted block text-[11px]">Filler words detected</span>
                    <span className="text-base font-semibold text-risk tabular-nums">14 fillers</span>
                    <span className="text-[10px] text-muted block mt-0.5">'um', 'like', 'basically'</span>
                  </div>
                  <div className="p-3 rounded-lg bg-surface border border-hairline">
                    <span className="text-muted block text-[11px]">Posture stability</span>
                    <span className="text-base font-semibold text-risk tabular-nums">58% alignment</span>
                    <span className="text-[10px] text-muted block mt-0.5">Slouching / leaning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* After Card */}
            <div className="rounded-xl border-2 border-darpan-blue bg-paper p-6 sm:p-7 space-y-5 relative shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <span className="text-xs font-semibold text-darpan-blue uppercase tracking-wider block">After 3 Practice Sessions</span>
                  <h3 className="text-base font-semibold text-ink">Coached with VaniDarpan</h3>
                </div>
                <span className="text-xs font-semibold text-success bg-success-tint px-2.5 py-1 rounded-md">
                  Placement Ready
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-muted mb-1">
                    <span>Camera Eye Contact</span>
                    <span className="font-semibold text-success tabular-nums">89% (+35% improvement)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-success w-[89%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-muted mb-1">
                    <span>Speaking Pacing</span>
                    <span className="font-semibold text-success tabular-nums">138 WPM (Executive cadence)</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-darpan-blue w-[92%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-darpan-blue-tint/50 border border-darpan-blue/20">
                    <span className="text-darpan-blue block text-[11px]">Filler words detected</span>
                    <span className="text-base font-semibold text-success tabular-nums">2 fillers (-86%)</span>
                    <span className="text-[10px] text-muted block mt-0.5">Replaced with silent pauses</span>
                  </div>
                  <div className="p-3 rounded-lg bg-darpan-blue-tint/50 border border-darpan-blue/20">
                    <span className="text-darpan-blue block text-[11px]">Posture stability</span>
                    <span className="text-base font-semibold text-success tabular-nums">94% alignment</span>
                    <span className="text-[10px] text-muted block mt-0.5">Upright and centered</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== REPORT PREVIEWS WITH SCREENSHOTS ===================== */}
      <section className="py-20 md:py-24 bg-paper border-b border-hairline">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-10 space-y-2">
            <div className="text-xs font-semibold text-darpan-blue tracking-wide uppercase">
              Product Walkthrough
            </div>
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
          <div className="rounded-xl border border-hairline bg-paper overflow-hidden text-left shadow-xs">
            
            {/* Window Bar */}
            <div className="px-4 py-3 bg-surface border-b border-hairline flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                </div>
                <span className="text-xs text-muted font-medium font-mono">
                  vanidarpan.app/{activePreviewTab}
                </span>
              </div>
              <span className="text-xs text-muted bg-paper border border-hairline px-2 py-0.5 rounded-md">
                {activePreview.badge}
              </span>
            </div>

            {/* Content Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 rounded-lg border border-hairline overflow-hidden bg-studio shadow-xs">
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
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
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
          <div className="bg-paper border border-hairline rounded-xl p-6 sm:p-7 text-left space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div>
                <h3 className="text-base font-semibold text-ink">Placement readiness by branch and skill</h3>
                <p className="text-xs text-muted mt-0.5">Aggregated metrics from recent student practice sessions</p>
              </div>
              <div className="text-xs text-muted font-medium font-mono">Batch of 2026</div>
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
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          
          <div className="max-w-2xl text-left mb-12 space-y-2">
            <div className="text-xs font-semibold text-darpan-blue tracking-wide uppercase">
              Transparent Pricing
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
              Plans and institutional access
            </h2>
            <p className="text-sm sm:text-base text-muted">
              Individual practice for students, and batch analytics for universities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Free Candidate */}
            <div className="bg-paper border border-hairline rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-ink">Free candidate</h3>
                  <p className="text-xs text-muted">For students starting self-practice.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-semibold text-ink tabular-nums">₹0</span>
                  <span className="text-xs text-muted">/ free forever</span>
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
            <div className="bg-paper border-2 border-darpan-blue rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-ink">Student Pro</h3>
                  <span className="text-[11px] font-semibold text-brass bg-[#FDF1DC] border border-[#F5E6CC] px-2.5 py-0.5 rounded-sm">
                    Recommended
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
            <div className="bg-paper border border-hairline rounded-xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xs">
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
            <Link href="/pricing" className="text-xs font-semibold text-darpan-blue hover:underline">
              View detailed pricing comparison table →
            </Link>
          </div>

        </div>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section className="py-20 md:py-24 bg-surface border-b border-hairline">
        <div className="max-w-[840px] mx-auto px-4 sm:px-6">
          
          <div className="text-left mb-10 space-y-2">
            <div className="text-xs font-semibold text-darpan-blue tracking-wide uppercase">
              Got Questions?
            </div>
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
                  className="rounded-xl border border-hairline bg-paper overflow-hidden shadow-xs transition-colors"
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
            <h2 className="text-2xl sm:text-4xl font-semibold tracking-[-0.015em] text-ink">
              Start your first practice session now
            </h2>
            <p className="text-sm sm:text-base text-muted max-w-lg mx-auto">
              Test your eye contact, posture, and pacing in front of your camera. Free forever with zero installation required.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/practice">
              <Button className="h-11 px-6 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover transition-colors flex items-center gap-2 shadow-xs">
                <span>Start free practice</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/report/sample">
              <Button variant="outline" className="h-11 px-6 text-sm font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface transition-colors">
                See a sample report
              </Button>
            </Link>
          </div>

          <div className="pt-2 text-xs text-muted flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-darpan-blue shrink-0" />
            <span>Your video is analysed on your device and is not uploaded.</span>
          </div>

        </div>
      </section>

    </div>
  );
}
