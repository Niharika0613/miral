import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Mic, Users, Briefcase, Trophy, Award } from 'lucide-react';

const PRACTICE_SCENARIOS = [
  {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Practice technical and behavioral interview questions',
    icon: Briefcase,
    difficulty: 'Intermediate',
    duration: '15-30 min',
    skills: ['Communication', 'Confidence', 'Clarity'],
    color: 'from-blue-500/20 to-blue-600/20',
  },
  {
    id: 'presentation',
    title: 'Business Presentation',
    description: 'Present ideas to stakeholders and colleagues',
    icon: Video,
    difficulty: 'Intermediate',
    duration: '10-25 min',
    skills: ['Eye Contact', 'Pacing', 'Engagement'],
    color: 'from-purple-500/20 to-purple-600/20',
  },
  {
    id: 'sales-pitch',
    title: 'Sales Pitch',
    description: 'Pitch products or services convincingly',
    icon: Mic,
    difficulty: 'Advanced',
    duration: '5-10 min',
    skills: ['Persuasion', 'Enthusiasm', 'Filler Words'],
    color: 'from-green-500/20 to-green-600/20',
  },
  {
    id: 'public-speaking',
    title: 'Public Speaking',
    description: 'Deliver speeches with confidence',
    icon: Users,
    difficulty: 'Advanced',
    duration: '3-5 min',
    skills: ['Posture', 'Vocal Variety', 'Engagement'],
    color: 'from-orange-500/20 to-orange-600/20',
  },
  {
    id: 'social-event',
    title: 'Social Event Talk',
    description: 'Practice networking and casual conversations',
    icon: Trophy,
    difficulty: 'Beginner',
    duration: '5-10 min',
    skills: ['Confidence', 'Listening', 'Body Language'],
    color: 'from-pink-500/20 to-pink-600/20',
  },
  {
    id: 'award-speech',
    title: 'Award/Thank You Speech',
    description: 'Deliver emotional and impactful speeches',
    icon: Award,
    difficulty: 'Intermediate',
    duration: '2-3 min',
    skills: ['Emotion', 'Pacing', 'Memory'],
    color: 'from-yellow-500/20 to-yellow-600/20',
  },
];

export default function Scenarios() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Practice Scenarios</h1>
          <p className="text-muted-foreground">Choose a scenario to practice and get personalized AI feedback</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRACTICE_SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <Card
                key={scenario.id}
                className={`border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer`}
                onClick={() => setLocation(`/practice?scenario=${scenario.id}`)}
              >
                <CardHeader className={`bg-gradient-to-r ${scenario.color}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{scenario.title}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </div>
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{scenario.difficulty}</Badge>
                    <Badge variant="outline">{scenario.duration}</Badge>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Key Skills</p>
                    <div className="flex gap-1 flex-wrap">
                      {scenario.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => setLocation(`/practice?scenario=${scenario.id}`)}>
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
