// client/src/pages/report.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Eye, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Zap, 
  Sparkles, 
  Loader2,
  Printer,
  Shield,
  Download,
  Share2,
  Volume2,
  FileText,
  BookOpen,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { Session } from '@shared/schema';

// Safe metric extraction helper
const getConfidence = (s: any): number => Math.round(s?.confidenceScore ?? s?.confidence_score ?? 0);
const getEyeContact = (s: any): number => Math.round(s?.eyeContactPercentage ?? s?.eye_contact_percentage ?? 0);
const getPosture = (s: any): number => Math.round(s?.postureScore ?? s?.posture_score ?? 0);
const getWpm = (s: any): number => Math.round(s?.wordsPerMinute ?? s?.words_per_minute ?? 0);
const getFillers = (s: any): number => Number(s?.fillerWordsCount ?? s?.filler_words_count ?? 0);
const getDuration = (s: any): number => Number(s?.duration ?? 0);

interface AICoachSectionProps {
  session: Session;
}

function AICoachSection({ session }: AICoachSectionProps) {
  const topic = session.topic || 'General Speech Practice';
  const eye = getEyeContact(session);
  const posture = getPosture(session);
  const wpm = getWpm(session);
  const fillers = getFillers(session);

  const insights = useMemo(() => {
    return {
      presence: {
        title: "Visual Connection & Non-Verbal Presence",
        text: eye >= 75 && posture >= 75
          ? `Exceptional visual engagement on "${topic}". Maintaining ${eye}% camera/audience gaze with stable posture (${posture}%) projects composure and authenticity.`
          : eye < 75
          ? `Good physical presence on "${topic}". Focus on holding eye contact forward towards your audience (${eye}%). Looking directly ahead establishes immediate authority and rapport.`
          : `Good energy on "${topic}". Keep your spine erect and shoulders square (${posture}%) to reinforce non-verbal conviction.`,
        status: eye >= 75 && posture >= 75 ? "Strong Composure" : "Gaze Focus Needed",
      },
      delivery: {
        title: "Vocal Pacing & Cadence",
        text: wpm >= 125 && wpm <= 165
          ? `Optimal speaking cadence at ${wpm} WPM. This rate allows listeners to comfortably absorb ideas and complex arguments without cognitive fatigue.`
          : wpm > 0 && wpm < 125
          ? `Speaking rhythm was measured at ${wpm} WPM. In public speaking, debates, and presentations, aim for 130–155 WPM with expressive vocal inflection.`
          : wpm > 165
          ? `You spoke rapidly at ${wpm} WPM. Use deliberate 1-second pauses before key takeaways to let critical arguments sink in.`
          : `Maintain continuous, confident speech flow to build momentum in your delivery.`,
        status: wpm >= 125 && wpm <= 165 ? "Optimal Rhythm" : "Pacing Adjustment",
      },
      clarity: {
        title: "Articulation & Hesitation Control",
        text: fillers === 0
          ? `Zero filler words detected. Articulation was disciplined, concise, and clean.`
          : `Detected ${fillers} filler phrase(s). Practice replacing hesitation sounds ("um", "like", "matlab") with a calm, silent breath.`,
        status: fillers <= 1 ? "Crisp Fluency" : "Hesitation Noted",
      },
      strategy: {
        title: "Delivery Strategy & Impact Tip",
        text: `For speeches and presentations on "${topic}", structure points using the Rule of Three (Point 1 -> Point 2 -> Point 3) and close with a definitive call-to-action or summary.`,
        status: "Core Delivery Technique",
      }
    };
  }, [topic, eye, posture, wpm, fillers]);

  return (
    <Card className="border border-border/60 shadow-xs bg-card">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              AI Speech & Communication Coach Diagnostics
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            Automated Speech & Vision Audit
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-4 rounded-lg bg-muted/30 border border-border/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{insights.presence.title}</span>
            <Badge variant="secondary" className="text-[10px]">{insights.presence.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{insights.presence.text}</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{insights.delivery.title}</span>
            <Badge variant="secondary" className="text-[10px]">{insights.delivery.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{insights.delivery.text}</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{insights.clarity.title}</span>
            <Badge variant="secondary" className="text-[10px]">{insights.clarity.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{insights.clarity.text}</p>
        </div>

        <div className="p-4 rounded-lg bg-muted/30 border border-border/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">{insights.strategy.title}</span>
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Delivery Technique</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{insights.strategy.text}</p>
        </div>

      </CardContent>
    </Card>
  );
}

function VocabularyUpgradeSection({ transcript }: { transcript: string }) {
  const upgrades = useMemo(() => {
    const list: { from: string; to: string; explanation: string }[] = [];
    const text = (transcript || '').toLowerCase();

    const vocabularyBank = [
      {
        pattern: /\b(did work|worked on|worked in|worked)\b/i,
        from: "worked on / did work",
        to: "architected / spearheaded / implemented",
        explanation: "Conveys direct ownership and technical leadership rather than passive participation."
      },
      {
        pattern: /\b(big problem|huge problem|hard thing|trouble)\b/i,
        from: "big problem / hard thing",
        to: "critical operational bottleneck",
        explanation: "Frames challenges as objective engineering problems with professional composure."
      },
      {
        pattern: /\b(very good|really good|nice|great work)\b/i,
        from: "very good / great",
        to: "high-throughput / substantial ROI",
        explanation: "Quantifies results with measurable business impact."
      },
      {
        pattern: /\b(told them|told my team|said to them)\b/i,
        from: "told them",
        to: "aligned cross-functional stakeholders",
        explanation: "Demonstrates managerial empathy and executive communication."
      },
      {
        pattern: /\b(made it fast|very fast|speed up)\b/i,
        from: "made it fast / speed up",
        to: "optimized algorithmic latency",
        explanation: "Highlights exact technical depth and performance metrics."
      },
      {
        pattern: /\b(i think that|i feel that|maybe)\b/i,
        from: "I think that / maybe",
        to: "Empirical metrics demonstrate that",
        explanation: "Eliminates hesitant fillers and projects assertive conviction."
      }
    ];

    vocabularyBank.forEach(item => {
      if (item.pattern.test(text) || list.length < 4) {
        list.push({
          from: item.from,
          to: item.to,
          explanation: item.explanation
        });
      }
    });

    return list.slice(0, 4);
  }, [transcript]);

  return (
    <Card className="border border-border/60 shadow-xs bg-card">
      <CardHeader className="border-b border-border/40 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
              Executive Vocabulary & Phrasing Upgrades (ESL Bridge)
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            Vocabulary Polishing
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {upgrades.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-lg bg-muted/20 border border-border/40 text-xs space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                <span>Informal / Colloquial</span>
                <span>Executive Upgrade</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/40 font-mono text-xs gap-2">
                <span className="text-muted-foreground line-through truncate max-w-[45%]">{item.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-primary font-bold text-right truncate max-w-[50%]">{item.to}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">{item.explanation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SessionFeedbackCard({ sessionId }: { sessionId: string }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hadIssue, setHadIssue] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          rating,
          hadIssue,
          comment: comment.trim() || null,
        }),
      });
      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "Feedback Recorded",
          description: "Thank you for helping us improve MIRAL for your placement drive!",
        });
      }
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border border-green-500/30 bg-green-500/5 shadow-xs">
        <CardContent className="p-4 flex items-center gap-3 text-xs text-foreground">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <span>Feedback submitted successfully. Thank you for helping us improve MIRAL!</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/60 shadow-xs bg-card">
      <CardHeader className="border-b border-border/40 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
              Pilot Experience Feedback
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/60">
            Quick 10s Rating
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold text-foreground">How helpful was this practice session?</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`h-7 w-7 rounded border text-xs font-bold transition-all ${
                    rating >= star
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground'
                  }`}
                >
                  {star}★
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={hadIssue}
              onChange={(e) => setHadIssue(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span className="text-muted-foreground text-xs">Did anything lag, freeze, or feel inaccurate?</span>
          </label>

          <div className="space-y-1">
            <Input
              placeholder="Optional: What would make your next attempt even better?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-xs h-8"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold h-8 px-4 gap-1.5"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Submit Feedback</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function Report() {
  const [, params] = useRoute('/report/:id');
  const [, setLocation] = useLocation();
  const sessionId = params?.id;

  const { data: session, isLoading, error } = useQuery<Session>({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId,
    retry: 2,
  });

  const handlePrintSummary = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!session || error) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Session Report Unavailable</h2>
        <p className="text-sm text-muted-foreground">The requested practice session could not be retrieved.</p>
        <Button onClick={() => setLocation('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  const confidence = getConfidence(session);
  const eye = getEyeContact(session);
  const posture = getPosture(session);
  const wpm = getWpm(session);
  const fillers = getFillers(session);
  const duration = getDuration(session);
  const durationMins = Math.floor(duration / 60);
  const durationSecs = duration % 60;

  const performanceTier = confidence >= 85 
    ? "Advanced Delivery — Stage & Interview Ready"
    : confidence >= 70
    ? "Competent Delivery — Strong Foundation"
    : "Developing Delivery — Continued Practice Recommended";

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between print:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-xs font-semibold"
              onClick={handlePrintSummary}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export Performance PDF</span>
            </Button>
            <Button 
              size="sm" 
              className="gap-2 text-xs font-semibold"
              onClick={() => setLocation('/scenarios')}
            >
              <span>Practice Next Session</span>
            </Button>
          </div>
        </div>

        {/* Executive Speech Performance Summary Card */}
        <div className="border border-border/60 rounded-xl bg-card p-6 md:p-8 shadow-xs relative overflow-hidden print:border-black print:shadow-none">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/50 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                <Activity className="h-4 w-4" />
                Session Performance Analysis
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {session.topic || 'General Practice Session'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Recorded on {new Date(session.createdAt || new Date()).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} | Duration: {durationMins}m {durationSecs}s
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[11px] text-muted-foreground uppercase block font-medium">Readiness Level</span>
              <Badge variant="outline" className="text-xs border-primary/40 text-primary font-medium mt-1">
                {performanceTier}
              </Badge>
            </div>
          </div>

          {/* Primary Speech & Vision Metric Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-border/50">
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Overall Score</span>
              <span className="text-2xl font-bold text-primary">{confidence} <span className="text-xs font-normal text-muted-foreground">/ 100</span></span>
              <span className="text-[10px] text-muted-foreground block">Composite Confidence</span>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Visual Engagement</span>
              <span className="text-2xl font-bold text-foreground">{eye}%</span>
              <span className="text-[10px] text-muted-foreground block">{eye >= 75 ? 'Direct Focus' : 'Gaze Shift Noted'}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Posture Stability</span>
              <span className="text-2xl font-bold text-foreground">{posture}%</span>
              <span className="text-[10px] text-muted-foreground block">{posture >= 75 ? 'Upright & Centered' : 'Adjustment Suggested'}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Cadence & Fillers</span>
              <span className="text-2xl font-bold text-foreground">{wpm} <span className="text-xs font-normal text-muted-foreground">WPM</span></span>
              <span className="text-[10px] text-muted-foreground block">{fillers === 0 ? 'Zero Fillers' : `${fillers} Fillers Counted`}</span>
            </div>
          </div>

          {/* Transcript & Articulation Section */}
          <div className="pt-6 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Spoken Transcript & Articulation Log
            </div>
            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/40 text-xs text-foreground/90 font-mono leading-relaxed">
              {session.transcript || 'No continuous spoken audio recorded during this session.'}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 mt-6 gap-2">
            <span>Powered by MIRAL Multi-Modal AI (3D Facial Vision & Speech Engine)</span>
            <span className="font-medium text-foreground/80">Speech & Confidence Mastery Platform</span>
          </div>
        </div>

        {/* Structured AI Coach, Vocabulary Upgrade, and Feedback Sections */}
        <div className="space-y-6 print:hidden">
          <AICoachSection session={session} />
          <VocabularyUpgradeSection transcript={session.transcript || ''} />
          {sessionId && <SessionFeedbackCard sessionId={sessionId} />}
        </div>

      </div>
    </div>
  );
}
