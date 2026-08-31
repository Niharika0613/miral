import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, Zap, Users, ExternalLink } from 'lucide-react';

const LEARNING_RESOURCES = [
  {
    id: 1,
    title: 'Your Body Language May Shape Who You Are',
    description: 'Amy Cuddy\'s famous TED Talk on power posing and building confidence through body language',
    type: 'Video',
    icon: Video,
    duration: '21 min watch',
    level: 'Beginner',
    url: 'https://www.youtube.com/watch?v=Unzc731iCUY',
    source: 'TED',
    color: 'from-red-500/20 to-red-600/20',
  },
  {
    id: 2,
    title: 'How to Speak So That People Want to Listen',
    description: 'Julian Treasure\'s TED Talk on vocal techniques and speaking with impact',
    type: 'Video',
    icon: Video,
    duration: '10 min watch',
    level: 'Beginner',
    url: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
    source: 'TED',
    color: 'from-blue-500/20 to-blue-600/20',
  },
  {
    id: 3,
    title: 'The Power of Vulnerability',
    description: 'Brené Brown\'s inspiring talk on authentic communication and connection',
    type: 'Video',
    icon: Video,
    duration: '20 min watch',
    level: 'Intermediate',
    url: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
    source: 'TED',
    color: 'from-green-500/20 to-green-600/20',
  },
  {
    id: 4,
    title: 'Public Speaking Tips from Toastmasters',
    description: 'Official guide on improving speech delivery, reducing filler words, and building confidence',
    type: 'Article',
    icon: BookOpen,
    duration: '8 min read',
    level: 'Beginner',
    url: 'https://www.toastmasters.org/education/pathways/presentation-mastery',
    source: 'Toastmasters',
    color: 'from-purple-500/20 to-purple-600/20',
  },
  {
    id: 5,
    title: 'Body Language Guide for Presentations',
    description: 'Harvard Business Review\'s comprehensive guide on nonverbal communication',
    type: 'Article',
    icon: BookOpen,
    duration: '12 min read',
    level: 'Intermediate',
    url: 'https://hbr.org/2021/01/how-to-give-a-killer-presentation',
    source: 'Harvard Business Review',
    color: 'from-orange-500/20 to-orange-600/20',
  },
  {
    id: 6,
    title: 'Overcoming Public Speaking Anxiety',
    description: 'Psychology Today\'s evidence-based strategies for managing presentation nerves',
    type: 'Article',
    icon: BookOpen,
    duration: '10 min read',
    level: 'Beginner',
    url: 'https://www.psychologytoday.com/us/blog/the-science-success/201501/how-overcome-fear-public-speaking',
    source: 'Psychology Today',
    color: 'from-pink-500/20 to-pink-600/20',
  },
  {
    id: 7,
    title: 'The Secret Structure of Great Talks',
    description: 'Nancy Duarte reveals the hidden structure behind powerful presentations',
    type: 'Video',
    icon: Video,
    duration: '18 min watch',
    level: 'Advanced',
    url: 'https://www.youtube.com/watch?v=1nYFpuc2Umk',
    source: 'TEDx',
    color: 'from-cyan-500/20 to-cyan-600/20',
  },
  {
    id: 8,
    title: 'Effective Communication Skills',
    description: 'MindTools comprehensive guide to professional communication and presentation skills',
    type: 'Guide',
    icon: Zap,
    duration: '15 min read',
    level: 'Intermediate',
    url: 'https://www.mindtools.com/CommSkll/CommunicationIntro.htm',
    source: 'MindTools',
    color: 'from-indigo-500/20 to-indigo-600/20',
  },
  {
    id: 9,
    title: 'How Great Leaders Inspire Action',
    description: 'Simon Sinek\'s famous TED Talk on the power of \'why\' in communication',
    type: 'Video',
    icon: Video,
    duration: '18 min watch',
    level: 'Advanced',
    url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
    source: 'TED',
    color: 'from-teal-500/20 to-teal-600/20',
  },
  {
    id: 10,
    title: 'Presentation Skills Masterclass',
    description: 'Coursera\'s comprehensive course on professional presentation and public speaking',
    type: 'Course',
    icon: Users,
    duration: '4 week course',
    level: 'Intermediate',
    url: 'https://www.coursera.org/learn/presentation-skills',
    source: 'Coursera',
    color: 'from-violet-500/20 to-violet-600/20',
  },
];

export default function LearningResources() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Learning Resources</h1>
          <p className="text-muted-foreground">Master the skills to become a confident public speaker with curated content from industry experts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEARNING_RESOURCES.map((resource) => {
            const Icon = resource.icon;
            const levelColor: Record<string, string> = {
              Beginner: 'bg-green-500/20 text-green-700 dark:text-green-400',
              Intermediate: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
              Advanced: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
            };
            return (
              <Card
                key={resource.id}
                className="border-2 border-primary/10 hover:border-primary/30 transition-all hover-elevate overflow-hidden"
              >
                <CardHeader className={`bg-gradient-to-r ${resource.color}`}>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{resource.description}</p>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline">{resource.type}</Badge>
                    <Badge className={levelColor[resource.level as keyof typeof levelColor]}>
                      {resource.level}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{resource.duration}</span>
                    <span className="font-medium">{resource.source}</span>
                  </div>

                  <Button 
                    className="w-full gap-2" 
                    variant="secondary"
                    onClick={() => window.open(resource.url, '_blank')}
                    data-testid={`button-resource-${resource.id}`}
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Recommended Learning Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <Badge className="mb-2">Week 1: Foundations</Badge>
              <p className="text-muted-foreground">Start with beginner resources on eye contact, pacing, and managing anxiety</p>
            </div>
            <div>
              <Badge className="mb-2">Week 2-3: Build Skills</Badge>
              <p className="text-muted-foreground">Progress to intermediate content on posture, storytelling, and engagement</p>
            </div>
            <div>
              <Badge className="mb-2">Week 4+: Master</Badge>
              <p className="text-muted-foreground">Explore advanced techniques and combine multiple skills for professional delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
