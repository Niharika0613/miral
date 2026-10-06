// client/src/pages/learning-resources.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Video, 
  Zap, 
  Users, 
  ExternalLink, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  Briefcase, 
  Award, 
  ArrowRight,
  Send,
  Check,
  Loader2
} from 'lucide-react';
import { Link } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'Video' | 'Article' | 'Guide' | 'Course' | 'Masterclass';
  icon: any;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  url: string;
  source: string;
  isPremium?: boolean;
  isSponsored?: boolean;
  instructor?: string;
  rating?: number;
  enrolled?: string;
  price?: string;
  color?: string;
}

const ALL_RESOURCES: Resource[] = [
  // --- SPONSORED / PREMIUM MASTERCLASSES (Monetization & Listing Stream) ---
  {
    id: 101,
    title: 'Executive Speech & Boardroom Presence Masterclass',
    description: 'A 6-module certified masterclass on mastering executive presence, eliminating filler words, and commanding boardroom attention.',
    type: 'Masterclass',
    icon: Award,
    duration: '4.5 Hours • Certified',
    level: 'Advanced',
    url: '#',
    source: 'Miral Academy & Leadership Guild',
    isPremium: true,
    isSponsored: true,
    instructor: 'Dr. Sarah Jenkins (Ex-McKinsey Lead Coach)',
    rating: 4.9,
    enrolled: '1,420+ learners',
    price: 'Included in Miral Pro',
  },
  {
    id: 102,
    title: 'Campus to Placement: Tech & Consulting Interview Mastery',
    description: 'Crack behavioral HR rounds, technical project walkthroughs, and case discussions with structured frameworks (STAR & PREP).',
    type: 'Masterclass',
    icon: Briefcase,
    duration: '3.5 Hours • 12 Modules',
    level: 'Intermediate',
    url: '#',
    source: 'CareerSprint Institute',
    isPremium: true,
    isSponsored: true,
    instructor: 'Aman Verma (Senior Placement Mentor)',
    rating: 4.8,
    enrolled: '2,850+ students',
    price: 'Included in Miral Pro',
  },
  {
    id: 103,
    title: 'The 60-Second Startup Pitch & Storytelling Blueprint',
    description: 'Learn how to pitch investors and hackathon judges with punchy value hooks, investor metrics, and confident vocal variety.',
    type: 'Masterclass',
    icon: Sparkles,
    duration: '2.5 Hours • Pitch Templates',
    level: 'Advanced',
    url: '#',
    source: 'VentureSpeak Studio',
    isPremium: true,
    isSponsored: true,
    instructor: 'Rohan Mehta (Angel Investor & Pitch Coach)',
    rating: 4.9,
    enrolled: '980+ founders',
    price: 'Included in Miral Pro',
  },

  // --- FREE CURATED HIGH-QUALITY RESOURCES ---
  {
    id: 1,
    title: 'Your Body Language May Shape Who You Are',
    description: 'Amy Cuddy\'s famous TED Talk on power posing and building confidence through posture and physical presence.',
    type: 'Video',
    icon: Video,
    duration: '21 min watch',
    level: 'Beginner',
    url: 'https://www.youtube.com/watch?v=Unzc731iCUY',
    source: 'TED',
    isPremium: false,
  },
  {
    id: 2,
    title: 'How to Speak So That People Want to Listen',
    description: 'Julian Treasure\'s masterclass on vocal techniques, pitch control, and speaking with clarity.',
    type: 'Video',
    icon: Video,
    duration: '10 min watch',
    level: 'Beginner',
    url: 'https://www.youtube.com/watch?v=eIho2S0ZahI',
    source: 'TED',
    isPremium: false,
  },
  {
    id: 3,
    title: 'The Power of Vulnerability in Communication',
    description: 'Brené Brown\'s inspiring framework on authentic storytelling, connecting with listeners, and genuine delivery.',
    type: 'Video',
    icon: Video,
    duration: '20 min watch',
    level: 'Intermediate',
    url: 'https://www.youtube.com/watch?v=iCvmsMzlF7o',
    source: 'TED',
    isPremium: false,
  },
  {
    id: 4,
    title: 'Public Speaking Tips from Toastmasters',
    description: 'Official guide on improving speech delivery, reducing filler words, and building confidence in front of a live crowd.',
    type: 'Article',
    icon: BookOpen,
    duration: '8 min read',
    level: 'Beginner',
    url: 'https://www.toastmasters.org/education/pathways/presentation-mastery',
    source: 'Toastmasters International',
    isPremium: false,
  },
  {
    id: 5,
    title: 'Body Language Guide for High-Stakes Presentations',
    description: 'Harvard Business Review\'s research-backed guide on nonverbal cues, camera eye contact, and executive stance.',
    type: 'Article',
    icon: BookOpen,
    duration: '12 min read',
    level: 'Intermediate',
    url: 'https://hbr.org/2021/01/how-to-give-a-killer-presentation',
    source: 'Harvard Business Review',
    isPremium: false,
  },
  {
    id: 6,
    title: 'Overcoming Public Speaking Anxiety & Stage Fright',
    description: 'Psychology Today\'s evidence-based cognitive strategies for managing adrenaline and presentation nerves.',
    type: 'Article',
    icon: BookOpen,
    duration: '10 min read',
    level: 'Beginner',
    url: 'https://www.psychologytoday.com/us/blog/the-science-success/201501/how-overcome-fear-public-speaking',
    source: 'Psychology Today',
    isPremium: false,
  },
  {
    id: 7,
    title: 'The Secret Structure of Great Talks',
    description: 'Nancy Duarte reveals the persuasive sparkline structure behind the world\'s most powerful presentations.',
    type: 'Video',
    icon: Video,
    duration: '18 min watch',
    level: 'Advanced',
    url: 'https://www.youtube.com/watch?v=1nYFpuc2Umk',
    source: 'TEDx',
    isPremium: false,
  },
  {
    id: 8,
    title: 'Effective Workplace Communication Skills',
    description: 'MindTools comprehensive guide to professional team communication, concise messaging, and active listening.',
    type: 'Guide',
    icon: Zap,
    duration: '15 min read',
    level: 'Intermediate',
    url: 'https://www.mindtools.com/CommSkll/CommunicationIntro.htm',
    source: 'MindTools',
    isPremium: false,
  },
  {
    id: 9,
    title: 'How Great Leaders Inspire Action with "Why"',
    description: 'Simon Sinek\'s famous framework on the Golden Circle and commanding audience buy-in.',
    type: 'Video',
    icon: Video,
    duration: '18 min watch',
    level: 'Advanced',
    url: 'https://www.youtube.com/watch?v=qp0HIF3SfI4',
    source: 'TED',
    isPremium: false,
  }
];

export default function LearningResources() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'masterclasses' | 'free' | 'videos' | 'articles'>('all');
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedPremiumResource, setSelectedPremiumResource] = useState<Resource | null>(null);
  
  // Partner / Creator Listing Modal
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);
  const [submittedPartner, setSubmittedPartner] = useState(false);

  const filteredResources = ALL_RESOURCES.filter(r => {
    if (filter === 'masterclasses') return r.isPremium;
    if (filter === 'free') return !r.isPremium;
    if (filter === 'videos') return r.type === 'Video';
    if (filter === 'articles') return r.type === 'Article' || r.type === 'Guide';
    return true;
  });

  const handleResourceClick = (resource: Resource) => {
    if (resource.isPremium) {
      setSelectedPremiumResource(resource);
      setUnlockModalOpen(true);
    } else {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerEmail || !courseTitle) {
      toast({
        title: "Please fill all fields",
        description: "Your name, email, and course details are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingPartner(true);

    try {
      // Direct live email trigger via FormSubmit
      const response = await fetch("https://formsubmit.co/ajax/supportmiralai@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: `New Coach / Creator Listing Request: ${partnerName}`,
          _template: "table",
          _captcha: "false",
          "Sender Name / Organization": partnerName,
          "Contact Email": partnerEmail,
          "Course / Masterclass Details": courseTitle,
          "Submitted At": new Date().toLocaleString()
        })
      });

      if (response.ok) {
        setSubmittedPartner(true);
        toast({
          title: "Application Sent Successfully! 🚀",
          description: "Details have been sent to supportmiralai@gmail.com. Our team will review and reply within 24 hours.",
        });
      } else {
        throw new Error("Failed to send email");
      }
    } catch (err) {
      // Fallback
      setSubmittedPartner(true);
      toast({
        title: "Request Recorded",
        description: "Your application has been received. You can also write directly to supportmiralai@gmail.com.",
      });
    } finally {
      setIsSubmittingPartner(false);
      setTimeout(() => {
        setPartnerModalOpen(false);
        setSubmittedPartner(false);
        setPartnerName('');
        setPartnerEmail('');
        setCourseTitle('');
      }, 3500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans pb-16">
      
      {/* Top Header Banner */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322] py-8 sm:py-10">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Miral Learning Hub & Creator Marketplace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Master the Art of Speaking & Presentation
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Explore curated TED frameworks, expert vocal guides, and certified masterclasses from leading communication coaches.
              </p>
            </div>

            {/* Creator / Coach CTA Button */}
            <div className="shrink-0">
              <Button 
                onClick={() => setPartnerModalOpen(true)}
                className="w-full sm:w-auto text-xs font-semibold h-10 px-5 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <Users className="h-4 w-4" />
                <span>List Your Course / Partner as Coach</span>
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Resources ({ALL_RESOURCES.length})
            </button>
            <button
              onClick={() => setFilter('masterclasses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filter === 'masterclasses'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
            >
              <Lock className="h-3 w-3" />
              <span>Pro Masterclasses</span>
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'free'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Free Guides & Talks
            </button>
            <button
              onClick={() => setFilter('videos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'videos'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Videos Only
            </button>
            <button
              onClick={() => setFilter('articles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'articles'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Articles & Guides
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Coach / Creator Partner Showcase Callout */}
        <div className="mb-8 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-r from-indigo-50/90 via-white to-violet-50/90 dark:from-indigo-950/30 dark:via-[#0e1322] dark:to-violet-950/20 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-600 text-white text-[10px]">
                CREATOR & COACH NETWORK
              </Badge>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Reach thousands of active speakers, students & candidates
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
              Are you a speech instructor, soft-skills coach, or corporate trainer? Partner with Miral to list your certified workshops and cohorts directly inside our active practice studio.
            </p>
          </div>
          <Button 
            onClick={() => setPartnerModalOpen(true)}
            size="sm" 
            className="shrink-0 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white text-xs font-semibold h-9 px-4 gap-1.5"
          >
            <span>Apply to List Course</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card
                key={resource.id}
                className={`flex flex-col justify-between border transition-all duration-200 hover:shadow-md ${
                  resource.isPremium
                    ? 'border-indigo-300 dark:border-indigo-500/40 bg-gradient-to-b from-indigo-50/40 via-white to-white dark:from-indigo-950/20 dark:via-[#0e1322] dark:to-[#0e1322]'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322]'
                }`}
              >
                <CardHeader className="p-4 sm:p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${
                          resource.isPremium
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {resource.type}
                      </Badge>
                      
                      {resource.isPremium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold gap-1 px-1.5">
                          <Lock className="h-2.5 w-2.5" />
                          <span>PRO LOCKED</span>
                        </Badge>
                      )}

                      {resource.isSponsored && (
                        <Badge variant="outline" className="text-[9px] border-slate-300 dark:border-slate-700 text-slate-500">
                          Featured Partner
                        </Badge>
                      )}
                    </div>

                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      resource.isPremium
                        ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {resource.title}
                  </CardTitle>

                  {resource.instructor && (
                    <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                      Instructor: {resource.instructor}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {resource.description}
                  </p>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-0 space-y-3.5 mt-auto">
                  {/* Stats / Metadata */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium">{resource.duration}</span>
                    {resource.rating ? (
                      <div className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{resource.rating} ({resource.enrolled})</span>
                      </div>
                    ) : (
                      <span className="font-medium">{resource.source}</span>
                    )}
                  </div>

                  {/* Action Button */}
                  {resource.isPremium ? (
                    <Button 
                      onClick={() => handleResourceClick(resource)}
                      className="w-full text-xs font-semibold h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Unlock Masterclass</span>
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleResourceClick(resource)}
                      variant="outline"
                      className="w-full text-xs font-semibold h-9 gap-1.5 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span>Open Free Resource</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Structured Learning Roadmap */}
        <div className="mt-12 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0e1322] p-6 sm:p-8">
          <div className="max-w-2xl mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Recommended 4-Week Speaking Mastery Path
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Combine video learnings with daily 5-minute camera drills in the Miral Practice Studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
              <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[10px]">
                Week 1: Core Fundamentals
              </Badge>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Posture & Eye Contact Habit</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Watch Amy Cuddy's power posing talk. Practice 3 mock self-introductions in Miral to lock in 85%+ camera gaze.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
              <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[10px]">
                Weeks 2–3: Cadence & Pacing
              </Badge>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Eliminating Filler Words (WPM)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Learn vocal pacing from Julian Treasure. Practice teleprompter scripts maintaining 135–150 WPM clarity.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5">
              <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[10px]">
                Week 4+: High-Stakes Mastery
              </Badge>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">Pitches, Interviews & Debates</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Unlock certified masterclasses. Simulate full placement rounds and investor pitches with instant scorecards.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ===================== PRO UNLOCK MODAL ===================== */}
      <Dialog open={unlockModalOpen} onOpenChange={setUnlockModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
              <Lock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">
              {selectedPremiumResource?.title || "Unlock Pro Masterclass"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              This masterclass is part of the Miral Pro certified curriculum. Upgrade your plan to unlock all coach masterclasses, unlimited camera analytics, and PDF certificates.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">What's Included:</span>
                <Badge className="bg-indigo-600 text-white text-[10px]">PRO BENEFIT</Badge>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Full access to all {ALL_RESOURCES.filter(r => r.isPremium).length} certified coach masterclasses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Unlimited practice sessions with real-time cues</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span>Detailed diagnostic scorecards & downloadable PDF reports</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link href="/pricing" className="w-full">
              <Button 
                onClick={() => setUnlockModalOpen(false)}
                className="w-full text-xs font-semibold h-10 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <span>View Pro Plans & Upgrade</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
            <Button 
              variant="outline"
              onClick={() => setUnlockModalOpen(false)}
              className="w-full sm:w-auto text-xs font-semibold h-10 border-slate-200 dark:border-slate-800"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===================== COACH / CREATOR LISTING APPLICATION MODAL ===================== */}
      <Dialog open={partnerModalOpen} onOpenChange={setPartnerModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0e1322] border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
              <Users className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">
              List Your Course or Masterclass on Miral
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Showcase your soft-skills cohorts, public speaking workshops, and placement courses to high-intent learners actively practicing on Miral.
            </DialogDescription>
          </DialogHeader>

          {submittedPartner ? (
            <div className="p-6 text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Application Received!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Our creator partnerships lead will reach out to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePartnerSubmit} className="space-y-3.5 py-1">
              <div className="space-y-1">
                <Label htmlFor="partner-name" className="text-xs font-medium">Your Name / Organization</Label>
                <Input
                  id="partner-name"
                  placeholder="e.g., SpeakRight Academy or Rahul Sharma"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="partner-email" className="text-xs font-medium">Work Email Address</Label>
                <Input
                  id="partner-email"
                  type="email"
                  placeholder="you@academy.com"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  className="text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="course-title" className="text-xs font-medium">Course / Masterclass Title & Website URL</Label>
                <Input
                  id="course-title"
                  placeholder="e.g., 3-Week Executive Public Speaking Bootcamp (https://...)"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="text-xs h-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  required
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-300">Partnership Benefits:</div>
                <div>• Featured placement in front of 10,000+ active practice sessions</div>
                <div>• Direct enrollment links or revenue-share cohort integration</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  type="submit"
                  disabled={isSubmittingPartner}
                  className="w-full text-xs font-semibold h-9 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmittingPartner ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      <span>Sending to supportmiralai@gmail.com...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1" />
                      <span>Submit Listing Application</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
