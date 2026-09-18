// client/src/pages/scenarios.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  Code, 
  Sparkles, 
  ArrowRight,
  FileText,
  Play,
  RotateCcw,
  CheckCircle2,
  Mic
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface PracticeQuestion {
  id: string;
  question: string;
  outline: string[];
}

export interface Scenario {
  id: string;
  title: string;
  category: 'placement' | 'gd' | 'tech' | 'pitch' | 'debate';
  description: string;
  icon: any;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  duration: string;
  questions: PracticeQuestion[];
}

export const PRACTICE_SCENARIOS: Scenario[] = [
  {
    id: 'campus-placement-hr',
    title: 'Campus Placement & HR Round',
    category: 'placement',
    description: 'Essential behavioral & self-introduction questions asked across on-campus recruitment drives.',
    icon: Briefcase,
    difficulty: 'Foundation',
    duration: '5-10 min',
    questions: [
      {
        id: 'hr-intro',
        question: 'Introduce yourself, your academic background, and what drives your career ambitions.',
        outline: ['Educational background', 'Key technical strengths & projects', 'Why you want this role']
      },
      {
        id: 'hr-challenge',
        question: 'Describe a challenging project or conflict you solved using the STAR method.',
        outline: ['Situation & context', 'Your specific role & action', 'Measurable result & learning']
      },
      {
        id: 'hr-why-hire',
        question: 'Why should we select you over other qualified candidates from your batch?',
        outline: ['Core skills alignment', 'Fast learning agility', 'Drive to add measurable value']
      }
    ]
  },
  {
    id: 'group-discussion-gd',
    title: 'Group Discussion (GD) & Debates',
    category: 'gd',
    description: 'Practice crisp opening statements, logical arguments, and polite turn-taking for GD screenings.',
    icon: Users,
    difficulty: 'Intermediate',
    duration: '5-10 min',
    questions: [
      {
        id: 'gd-ai-jobs',
        question: 'GD Topic: Will generative AI displace knowledge workers or create higher-order opportunities?',
        outline: ['Opening stance & balance', 'Real-world industry example', 'Forward-looking conclusion']
      },
      {
        id: 'gd-speed-quality',
        question: 'GD Topic: What matters more in fast-paced teams — rapid speed to market or absolute perfection?',
        outline: ['Acknowledge trade-offs', 'Provide context-based reasoning', 'Synthesize balanced middle ground']
      },
      {
        id: 'gd-remote-work',
        question: 'GD Topic: Is fully remote work sustainable for entry-level engineering and product teams?',
        outline: ['Benefits of flexibility vs collaboration', 'Mentorship challenges', 'Hybrid solution']
      }
    ]
  },
  {
    id: 'technical-project-defense',
    title: 'Technical Project Defense & Viva',
    category: 'tech',
    description: 'Explain complex engineering architectures, database decisions, and bug-fixing trade-offs calmly.',
    icon: Code,
    difficulty: 'Intermediate',
    duration: '5-10 min',
    questions: [
      {
        id: 'tech-architecture',
        question: 'Walk me through the end-to-end architecture of your most impactful project.',
        outline: ['Problem solved & user base', 'Tech stack & database decisions', 'Key bottlenecks resolved']
      },
      {
        id: 'tech-tradeoff',
        question: 'Describe a major technical compromise or design trade-off you had to make.',
        outline: ['Why the trade-off was necessary', 'Alternatives evaluated', 'Outcome & retrospection']
      }
    ]
  },
  {
    id: 'debate-public-speaking',
    title: 'Debate & Public Speaking',
    category: 'debate',
    description: 'Master persuasive speech structuring, rebuttals, and confident body language without filler words.',
    icon: Mic,
    difficulty: 'Intermediate',
    duration: '5-10 min',
    questions: [
      {
        id: 'debate-motion',
        question: 'Motion: Is rapid technological disruption making formal college degrees obsolete?',
        outline: ['Define terms & context', 'Present 2 strong supporting arguments', 'Conclude with high-impact summary']
      },
      {
        id: 'debate-rebuttal',
        question: 'Deliver a structured 90-second rebuttal against an opposing argument calmly and convincingly.',
        outline: ['Acknowledge counterpoint respectfully', 'Highlight factual or logical fallacy', 'Re-anchor core thesis']
      }
    ]
  },
  {
    id: 'executive-pitch',
    title: '60-Second Pitch & Self-Marketing',
    category: 'pitch',
    description: 'Deliver concise, impactful 60-second value propositions for leadership reviews and client pitches.',
    icon: Sparkles,
    difficulty: 'Advanced',
    duration: '2-5 min',
    questions: [
      {
        id: 'pitch-60s',
        question: 'Deliver your 60-second personal elevator pitch to an executive or recruiter.',
        outline: ['Who you are & core superpower', 'What problems you solve', 'Definitive call to action']
      }
    ]
  }
];

export default function Scenarios() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Custom Script State
  const [customTopic, setCustomTopic] = useState('');
  const [customScript, setCustomScript] = useState('');

  // Auto-scroll to track if specified in URL hash or search params
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash.replace('#', '');
      const searchParams = new URLSearchParams(window.location.search);
      const trackParam = searchParams.get('track');
      const targetId = hash || trackParam;

      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-primary', 'transition-all');
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-primary');
            }, 2500);
          }
        }, 150);
      }
    };

    handleHashScroll();
  }, []);

  const handleLaunchCustom = () => {
    if (!customScript.trim() && !customTopic.trim()) {
      toast({
        title: "Please enter your script or topic",
        description: "Paste your speech or enter a topic to launch practice.",
        variant: "destructive"
      });
      return;
    }

    const topicTitle = customTopic.trim() || 'Custom Prepared Speech';
    sessionStorage.setItem('preferredTopic', topicTitle);
    sessionStorage.setItem('practiceScript', customScript.trim());
    sessionStorage.removeItem('practiceQuestion');

    toast({
      title: "Teleprompter Ready",
      description: "Launching practice room with your custom speech script...",
    });

    setLocation(`/practice?topic=${encodeURIComponent(topicTitle)}`);
  };

  const handleLaunchQuestion = (scenario: Scenario, q: PracticeQuestion) => {
    sessionStorage.setItem('preferredTopic', `${scenario.title} — ${q.question.substring(0, 35)}...`);
    sessionStorage.setItem('practiceQuestion', JSON.stringify({
      question: q.question,
      outline: q.outline
    }));
    sessionStorage.removeItem('practiceScript');

    setLocation(`/practice?topic=${encodeURIComponent(scenario.title)}`);
  };

  const setScriptTemplate = (templateType: 'intro' | 'star' | 'pitch') => {
    if (templateType === 'intro') {
      setCustomTopic('Campus HR Self-Introduction');
      setCustomScript(`Good morning. My name is [Your Name], and I am currently completing my degree in [Your Major] at [Your University].

Over the past two years, I have focused extensively on [Key Skill 1, e.g. Full-Stack Development] and [Key Skill 2, e.g. Data Structures]. In my latest project, I architected a [Brief project description] which helped [Key metric or user outcome].

I am excited about this opportunity because your team's work in [Company domain/product] directly aligns with my goal to build high-performance systems.`);
    } else if (templateType === 'star') {
      setCustomTopic('STAR Story — Technical Challenge');
      setCustomScript(`Situation: During our final semester capstone project, our application began experiencing intermittent 500 latency spikes.

Task: As the lead backend engineer, my responsibility was to diagnose the database bottleneck and restore response times under 200ms.

Action: I profiled our SQL queries, added composite indexing, and migrated our session storage to Redis caching.

Result: This reduced peak response times by 68% and allowed our service to handle 500 concurrent mock users without errors.`);
    } else if (templateType === 'pitch') {
      setCustomTopic('60-Second Elevator Pitch');
      setCustomScript(`Hi, I'm [Your Name]. I specialize in translating complex technical requirements into clean, user-friendly digital products.

Unlike typical developers who only focus on code syntax, I focus on business outcomes and clear communication. 

I'm looking to join a fast-moving team where I can take ownership of critical features and deliver immediate impact from day one.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 py-10 relative overflow-hidden">

      {/* Aurora background blobs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full bg-violet-600/8 blur-[100px]" />
      </div>

      <div className="relative z-10 container max-w-5xl mx-auto px-4 sm:px-6 space-y-10">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5" data-reveal>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Practice Modes &amp; Scenarios</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight gradient-text">
            Choose What You Want to Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Paste your own prepared script to practice with our live teleprompter, or select a standard placement scenario below.
          </p>
        </div>

        {/* 1. Custom Speech / Script Notepad Card (Prominent & Top) */}
        <div
          className="bg-white/[0.04] backdrop-blur-xl border border-indigo-500/20 rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.1)] overflow-hidden"
          data-reveal
          data-delay="100"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(255,255,255,0.02) 100%)' }}
        >
          {/* Card Header */}
          <div className="border-b border-white/[0.07] px-5 pt-5 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span className="text-sm md:text-base font-bold text-white">
                  Practice Your Own Prepared Speech / Script
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 w-fit">
                Live Teleprompter + Eye Gaze Audit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Have your own resume intro, project speech, or GD notes prepared? Paste it here to read while MIRAL tracks your eye contact and vocal pace.
            </p>
          </div>

          {/* Card Content */}
          <div className="p-4 sm:p-6 space-y-4">

            {/* Quick Templates */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Quick Templates:</span>
              <button
                type="button"
                onClick={() => setScriptTemplate('intro')}
                className="text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.04] hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 transition-all font-medium"
              >
                Self-Intro Template
              </button>
              <button
                type="button"
                onClick={() => setScriptTemplate('star')}
                className="text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.04] hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 transition-all font-medium"
              >
                STAR Story Template
              </button>
              <button
                type="button"
                onClick={() => setScriptTemplate('pitch')}
                className="text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/[0.04] hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-300 hover:text-indigo-300 transition-all font-medium"
              >
                60s Pitch Template
              </button>
              {(customScript || customTopic) && (
                <button
                  type="button"
                  onClick={() => { setCustomScript(''); setCustomTopic(''); }}
                  className="text-xs text-slate-500 hover:text-red-400 transition-colors ml-auto font-medium"
                >
                  Clear Notepad
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="custom-topic" className="text-xs font-semibold text-slate-300">
                  Speech / Topic Name (Optional)
                </label>
                <Input
                  id="custom-topic"
                  placeholder="e.g., My TCS HR Self-Introduction, GD Opening on AI"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="text-xs h-9 bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus-visible:ring-indigo-500/30"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="custom-script-text" className="text-xs font-semibold text-slate-300">
                  Your Prepared Speech Script or Bullet Points
                </label>
                <Textarea
                  id="custom-script-text"
                  placeholder="Paste your speech here... (e.g. Good morning, my name is... In my project I built...)"
                  value={customScript}
                  onChange={(e) => setCustomScript(e.target.value)}
                  className="text-xs font-mono min-h-32 leading-relaxed bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus-visible:ring-indigo-500/30"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleLaunchCustom}
                className="inline-flex items-center gap-2 text-xs font-semibold h-9 px-5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] transition-all w-full sm:w-auto justify-center"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Launch Teleprompter &amp; Camera Practice</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Standard Curated Practice Scenarios */}
        <div className="space-y-4" data-reveal data-delay="200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Or Choose a Curated Placement Track
            </h2>
            <span className="text-xs text-slate-500">1-Click Launch</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-reveal data-delay="250">
            {PRACTICE_SCENARIOS.map((scenario) => {
              const Icon = scenario.icon;
              return (
                <div
                  key={scenario.id}
                  id={scenario.id}
                  className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-xl transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col justify-between scroll-mt-24"
                >
                  {/* Scenario Card Header */}
                  <div className="pb-3 border-b border-white/[0.06] px-4 pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {scenario.title}
                          </p>
                          <span className="text-[11px] text-slate-500">
                            {scenario.duration} • {scenario.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  {/* Scenario Card Content */}
                  <div className="p-4 space-y-2 flex-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Select Question to Practice:
                    </span>
                    {scenario.questions.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => handleLaunchQuestion(scenario, q)}
                        className="w-full text-left p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group flex items-center justify-between gap-3"
                      >
                        <span className="text-xs text-slate-300 font-medium group-hover:text-indigo-300 transition-colors line-clamp-2">
                          "{q.question}"
                        </span>
                        <div className="h-6 w-6 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 shrink-0 transition-colors">
                          <Play className="h-2.5 w-2.5 ml-0.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
