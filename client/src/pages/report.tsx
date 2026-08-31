// client/src/pages/report.tsx
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
  FileText
} from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Session } from '@shared/schema';

interface AICoachSectionProps {
  session: Session;
}

function AICoachSection({ session }: AICoachSectionProps) {
  const topic = session.topic || 'General Speech Practice';
  const eye = Math.round(session.eyeContactPercentage || 0);
  const posture = Math.round(session.postureScore || 0);
  const wpm = Math.round(session.wordsPerMinute || 0);
  const fillers = session.fillerWordsCount || 0;

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
          : `Detected ${fillers} filler phrase(s). Practice replacing hesitation sounds ("um", "like") with a calm, silent breath.`,
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

  const confidence = Math.round(session.confidenceScore || 0);
  const eye = Math.round(session.eyeContactPercentage || 0);
  const posture = Math.round(session.postureScore || 0);
  const wpm = Math.round(session.wordsPerMinute || 0);
  const fillers = session.fillerWordsCount || 0;
  const durationMins = Math.floor((session.duration || 0) / 60);
  const durationSecs = (session.duration || 0) % 60;

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
                Recorded on {new Date(session.createdAt).toLocaleDateString(undefined, { 
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

        {/* Structured AI Coach Section */}
        <div className="print:hidden">
          <AICoachSection session={session} />
        </div>

      </div>
    </div>
  );
}
