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
  ShieldCheck
} from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  category: 'placement' | 'aviation' | 'tech' | 'executive';
  description: string;
  icon: any;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  duration: string;
  skills: string[];
  sampleQuestion: string;
}

const PRACTICE_SCENARIOS: Scenario[] = [
  {
    id: 'campus-placement-hr',
    title: 'Campus Placement HR & Behavioral',
    category: 'placement',
    description: 'Master standard HR screening questions and STAR-formatted behavioral responses for placement drives.',
    icon: Briefcase,
    difficulty: 'Foundation',
    duration: '5-15 min',
    skills: ['STAR Structure', 'Eye Contact', 'Pacing'],
    sampleQuestion: 'Walk me through your resume and describe a challenging conflict you resolved in a team project.',
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
    sampleQuestion: 'How would you calm an anxious passenger during severe turbulence while maintaining crew protocol?',
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
    sampleQuestion: 'Artificial Intelligence in education: Enhancing learning or degrading critical thinking?',
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
    sampleQuestion: 'Explain the architecture of your full-stack project, trade-offs made, and how you handled concurrency.',
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
    sampleQuestion: 'A leading retail chain is seeing a 20% margin decline in urban centers. Structure your diagnosis.',
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
    sampleQuestion: 'Present a 3-minute executive summary pitch for an enterprise SaaS product to C-level stakeholders.',
  },
];

export default function Scenarios() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredScenarios = selectedCategory === 'all'
    ? PRACTICE_SCENARIOS
    : PRACTICE_SCENARIOS.filter(s => s.category === selectedCategory);

  const startScenario = (scenario: Scenario) => {
    sessionStorage.setItem('preferredTopic', scenario.title);
    setLocation(`/practice?scenario=${scenario.id}&topic=${encodeURIComponent(scenario.title)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="border-b border-border/40 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              <ShieldCheck className="h-4 w-4" />
              Role-Specific Practice Tracks
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Interview & Speech Scenarios
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select your targeted career track to practice with specialized computer vision and speech coaching criteria.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <Card
                key={scenario.id}
                className="border border-border/60 hover:border-primary/40 transition-all duration-200 shadow-xs flex flex-col justify-between group bg-card hover:bg-muted/10"
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-xs font-medium border-border/80">
                        {scenario.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {scenario.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {scenario.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="p-2.5 rounded-md bg-muted/40 border border-border/30 text-xs">
                      <span className="font-semibold text-foreground/90 block mb-0.5">Sample Focus Prompt:</span>
                      <p className="text-muted-foreground italic">"{scenario.sampleQuestion}"</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground block mb-1.5">Evaluation Metrics:</span>
                      <div className="flex flex-wrap gap-1">
                        {scenario.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-[11px] font-normal py-0.5 px-2">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-6 pt-0 mt-2">
                  <Button 
                    className="w-full text-xs font-semibold justify-between group-hover:bg-primary"
                    onClick={() => startScenario(scenario)}
                  >
                    <span>Launch Scenario</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
