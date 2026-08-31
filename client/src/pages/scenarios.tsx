// client/src/pages/scenarios.tsx
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Plane, 
  Code, 
  MessageSquare, 
  Users, 
  LineChart, 
  Zap, 
  ArrowRight,
  Sparkles,
  ShieldCheck,
  PlayCircle,
  HelpCircle
} from 'lucide-react';

export interface PracticeQuestion {
  id: string;
  question: string;
  outline: string[];
}

export interface Scenario {
  id: string;
  title: string;
  category: 'placement' | 'aviation' | 'tech' | 'executive';
  description: string;
  icon: any;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  duration: string;
  skills: string[];
  questions: PracticeQuestion[];
}

export const PRACTICE_SCENARIOS: Scenario[] = [
  {
    id: 'campus-placement-hr',
    title: 'Campus Placement HR & Behavioral',
    category: 'placement',
    description: 'Master standard HR screening questions and STAR-formatted behavioral responses for placement drives.',
    icon: Briefcase,
    difficulty: 'Foundation',
    duration: '5-15 min',
    skills: ['STAR Structure', 'Eye Contact', 'Pacing'],
    questions: [
      {
        id: 'hr-intro',
        question: 'Introduce yourself and walk me through your technical background and career goals.',
        outline: ['1. Academic foundation', '2. Key projects & tech stack', '3. Why you are enthusiastic about this role']
      },
      {
        id: 'hr-conflict',
        question: 'Describe a challenging bug or team conflict you encountered and how you resolved it using the STAR method.',
        outline: ['1. Situation: Project context', '2. Task: Your responsibility', '3. Action: Specific steps taken', '4. Result: Measurable outcome']
      },
      {
        id: 'hr-strengths',
        question: 'What are your core technical strengths, and what is one area you are actively improving?',
        outline: ['1. Primary strength with evidence', '2. Constructive area of growth', '3. Action taken to improve']
      },
      {
        id: 'hr-why-hire',
        question: 'Why should our company hire you over other qualified candidates in this placement drive?',
        outline: ['1. Alignment with company culture', '2. Fast learning agility', '3. Drive to deliver impact']
      }
    ]
  },
  {
    id: 'cabin-crew-gd',
    title: 'Cabin Crew & Aviation GD',
    category: 'aviation',
    description: 'Practice grooming, posture composure, visual warmth, and structured group discussion for airline selections.',
    icon: Plane,
    difficulty: 'Intermediate',
    duration: '5-10 min',
    skills: ['Poise & Posture', 'Courteous Modulation', 'Composure'],
    questions: [
      {
        id: 'crew-intro',
        question: 'Introduce yourself and explain why you want to represent our airline as a flight attendant.',
        outline: ['1. Warm opening & background', '2. Passion for hospitality & aviation safety', '3. Alignment with our airline values']
      },
      {
        id: 'crew-turbulence',
        question: 'How would you handle an anxious or demanding passenger refusing seatbelt instructions during severe turbulence?',
        outline: ['1. Stay calm & empathetic', '2. Explain safety protocol clearly', '3. Offer reassuring assistance without compromising flight rules']
      },
      {
        id: 'crew-gd-topic',
        question: 'GD Topic: What is more critical in commercial aviation — absolute punctuality or passenger empathy?',
        outline: ['1. Acknowledge both operational safety and customer satisfaction', '2. Give a balanced real-world example', '3. Synthesize a unified conclusion']
      },
      {
        id: 'crew-teamwork',
        question: 'Describe a situation where you had to coordinate with a difficult team member under tight time constraints.',
        outline: ['1. Focus on mutual goal', '2. Direct, respectful communication', '3. Successful team delivery']
      }
    ]
  },
  {
    id: 'campus-gd-debate',
    title: 'Group Discussion & Debate',
    category: 'placement',
    description: 'Learn to initiate discussions, present clear arguments, avoid filler words, and summarize effectively.',
    icon: MessageSquare,
    difficulty: 'Intermediate',
    duration: '5-10 min',
    skills: ['Assertive Articulation', 'No Fillers', 'Cadence'],
    questions: [
      {
        id: 'debate-ai',
        question: 'Debate Opening: Will Generative AI eliminate software engineering jobs or amplify developer productivity?',
        outline: ['1. Strong opening stance', '2. Empirical evidence / developer tools', '3. Evolution of software craftsmanship']
      },
      {
        id: 'debate-remote',
        question: 'GD Topic: Remote work vs Return to office in corporate India — which model fosters sustainable career growth?',
        outline: ['1. Flexibility vs in-person mentorship', '2. Productivity metrics & work-life integration', '3. Hybrid consensus recommendation']
      },
      {
        id: 'debate-social',
        question: 'Debate: Social media impact on youth — democratization of knowledge vs attention deficit crisis.',
        outline: ['1. Information access benefits', '2. Cognitive attention costs', '3. Digital mindfulness framework']
      },
      {
        id: 'debate-ev',
        question: 'GD Summary: Electric vehicle infrastructure in developing economies — opportunities and bottlenecks.',
        outline: ['1. Environmental & economic imperative', '2. Grid & charging hurdles', '3. Forward-looking summary']
      }
    ]
  },
  {
    id: 'sde-technical-walkthrough',
    title: 'Software Engineering (SDE) Walkthrough',
    category: 'tech',
    description: 'Communicate complex system architecture, database choices, and algorithms clearly to technical interviewers.',
    icon: Code,
    difficulty: 'Advanced',
    duration: '10-20 min',
    skills: ['Technical Clarity', 'Conciseness', 'Flow'],
    questions: [
      {
        id: 'sde-arch',
        question: 'Walk through the high-level architecture, database choices, and scalability of your flagship full-stack project.',
        outline: ['1. High-level architecture diagram in words', '2. SQL/NoSQL schema tradeoffs', '3. Handling concurrency & auth']
      },
      {
        id: 'sde-opt',
        question: 'Explain how you identify performance bottlenecks and optimize database queries under high concurrent load.',
        outline: ['1. Profiling tools & indexing', '2. Caching layers (Redis)', '3. Connection pooling & async workers']
      },
      {
        id: 'sde-tradeoff',
        question: 'Tell me about a time you made a deliberate technical compromise between shipping quickly and long-term code quality.',
        outline: ['1. Product constraint & deadline', '2. The shortcut taken vs risk mitigation', '3. Technical debt payback plan']
      }
    ]
  },
  {
    id: 'consulting-case-presentation',
    title: 'Consulting & Case Analysis',
    category: 'executive',
    description: 'Structure root-cause analysis, frame hypotheses, and present data-backed recommendations with authority.',
    icon: LineChart,
    difficulty: 'Advanced',
    duration: '10-15 min',
    skills: ['Structured Thinking', 'Executive Tone', 'Clarity'],
    questions: [
      {
        id: 'case-margin',
        question: 'Case Prompt: A retail supermarket chain is seeing a 20% margin decline in urban centers. Structure your diagnosis.',
        outline: ['1. Clarifying questions & scope', '2. Revenue vs Cost breakdown', '3. Recommendation & next steps']
      },
      {
        id: 'case-entry',
        question: 'Market Entry: How would you evaluate whether an EV scooter company should expand into Southeast Asia?',
        outline: ['1. Market attractiveness (TAM, regulatory)', '2. Competitive landscape', '3. Financial feasibility & supply chain']
      }
    ]
  },
  {
    id: 'sales-executive-pitch',
    title: 'Executive Pitch & Keynote',
    category: 'executive',
    description: 'Deliver persuasive product propositions, handle objections calmly, and engage professional stakeholders.',
    icon: Zap,
    difficulty: 'Advanced',
    duration: '5-10 min',
    skills: ['Persuasion', 'Vocal Energy', 'Engagement'],
    questions: [
      {
        id: 'pitch-elevator',
        question: 'Deliver a compelling 2-minute elevator pitch for your startup vision or enterprise software proposition.',
        outline: ['1. The sharp burning problem', '2. Your unique product solution', '3. Clear business upside & CTA']
      },
      {
        id: 'pitch-budget',
        question: 'Present an executive proposal to leadership requesting budget approval for an engineering modernization initiative.',
        outline: ['1. Current efficiency losses & risks', '2. Projected ROI & cost savings', '3. Phased rollout timeline']
      }
    ]
  },
];

export default function Scenarios() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredScenarios = selectedCategory === 'all'
    ? PRACTICE_SCENARIOS
    : PRACTICE_SCENARIOS.filter(s => s.category === selectedCategory);

  const startScenario = (scenario: Scenario, question?: PracticeQuestion) => {
    const topic = question ? `${scenario.title}: ${question.question.substring(0, 45)}...` : scenario.title;
    sessionStorage.setItem('preferredTopic', topic);
    if (question) {
      sessionStorage.setItem('practiceQuestion', JSON.stringify(question));
    } else {
      sessionStorage.removeItem('practiceQuestion');
    }
    setLocation(`/practice?scenario=${scenario.id}&topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="border-b border-border/40 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              <ShieldCheck className="h-4 w-4" />
              Role-Specific Practice Tracks & Curated Scripts
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Interview, Speech & Debate Scenarios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a dedicated track or launch straight into curated real-world questions with live teleprompter key points.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/40 text-xs">
            {[
              { id: 'all', label: 'All Tracks' },
              { id: 'placement', label: 'Campus Placements' },
              { id: 'aviation', label: 'Aviation & Cabin Crew' },
              { id: 'tech', label: 'Technical SDE' },
              { id: 'executive', label: 'Executive & Pitch' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scenario Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredScenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <Card
                key={scenario.id}
                className="border border-border/60 hover:border-primary/40 transition-all duration-200 shadow-xs flex flex-col justify-between bg-card"
              >
                <div>
                  <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-xs font-medium border-border/80">
                          {scenario.duration}
                        </Badge>
                      </div>
                      <Badge variant="secondary" className="text-[11px]">
                        {scenario.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground">
                      {scenario.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {scenario.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-4">
                    {/* Key Evaluation Focus */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-medium text-muted-foreground">Focus:</span>
                      {scenario.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px] font-normal py-0.5 px-2">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Curated Question Scripts */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <HelpCircle className="h-3.5 w-3.5 text-primary" />
                        <span>Curated Practice Questions (Click to Launch):</span>
                      </div>

                      <div className="space-y-1.5">
                        {scenario.questions.map((q, idx) => (
                          <div
                            key={q.id}
                            onClick={() => startScenario(scenario, q)}
                            className="p-2.5 rounded-lg bg-muted/40 hover:bg-primary/10 border border-border/40 hover:border-primary/30 transition-all cursor-pointer group/q flex items-start justify-between gap-2 text-xs"
                          >
                            <div className="space-y-1 flex-1">
                              <span className="font-medium text-foreground group-hover/q:text-primary transition-colors block">
                                Q{idx + 1}: {q.question}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span>Guide: {q.outline.join(' • ')}</span>
                              </div>
                            </div>
                            <PlayCircle className="h-4 w-4 text-muted-foreground group-hover/q:text-primary transition-colors shrink-0 mt-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-4 pt-0 border-t border-border/30 bg-muted/5 mt-2">
                  <Button 
                    variant="outline"
                    className="w-full text-xs font-semibold justify-between hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => startScenario(scenario)}
                  >
                    <span>Launch Open {scenario.title} Session</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}
