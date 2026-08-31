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
  ShieldCheck,
  Award,
  Download,
  Share2
} from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import type { Session } from '@shared/schema';

interface AICoachSectionProps {
  session: Session;
}

function AICoachSection({ session }: AICoachSectionProps) {
  const topic = session.topic || 'Interview Practice';
  const eye = Math.round(session.eyeContactPercentage || 0);
  const posture = Math.round(session.postureScore || 0);
  const wpm = Math.round(session.wordsPerMinute || 0);
  const fillers = session.fillerWordsCount || 0;

  const insights = useMemo(() => {
    return {
      presence: {
        title: "Executive Presence & Gaze",
        text: eye >= 75 && posture >= 75
          ? `Strong performance for "${topic}". Your visual focus (${eye}%) and posture (${posture}%) projected authority and self-assurance.`
          : eye < 75
          ? `Good progress on "${topic}". In virtual placements, direct eye engagement with the camera lens (${eye}%) establishes immediate confidence and rapport.`
          : `Good energy on "${topic}". Keep your spine upright and shoulders level (${posture}%) to reinforce non-verbal credibility.`,
        status: eye >= 75 && posture >= 75 ? "Optimal" : "Practice Needed",
      },
      delivery: {
        title: "Vocal Delivery & Pacing",
        text: wpm >= 125 && wpm <= 165
          ? `Excellent conversational pace at ${wpm} WPM. This cadence allows interviewers to absorb technical concepts clearly.`
          : wpm > 0 && wpm < 125
          ? `Speaking pace was measured at ${wpm} WPM. For campus placements and technical interviews, aim for 130–155 WPM with expressive inflection.`
          : wpm > 165
          ? `You spoke rapidly at ${wpm} WPM. Incorporate strategic 1-second pauses before key takeaways to maximize impact.`
          : `Focus on maintaining continuous, confident speech delivery throughout your response.`,
        status: wpm >= 125 && wpm <= 165 ? "Optimal" : "Pacing Adjustment",
      },
      clarity: {
        title: "Speech Clarity & Articulation",
        text: fillers === 0
          ? `Zero filler words detected. Articulation was disciplined and concise.`
          : `Detected ${fillers} filler word(s). Practice replacing hesitation sounds with brief silent pauses.`,
        status: fillers <= 1 ? "Optimal" : "High Hesitation",
      },
      starTip: {
        title: "Placement Strategy & STAR Technique",
        text: `For questions relating to "${topic}", structure your response using the STAR Framework (Situation, Task, Action, Result) with measurable metrics.`,
        status: "Strategy Guideline",
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
              AI Communication Coach Diagnostics
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
            <span className="text-xs font-semibold text-foreground">{insights.starTip.title}</span>
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">STAR Method</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{insights.starTip.text}</p>
        </div>

      </CardContent>
    </Card>
  );
}

export default function Report() {
  const [, params] = useRoute('/report/:id');
  const [, setLocation] = useLocation();
  const sessionId = params?.id;
  const certificateRef = useRef<HTMLDivElement>(null);

  const { data: session, isLoading, error } = useQuery<Session>({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId,
    retry: 2,
  });

  const handlePrintCertificate = () => {
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
        <p className="text-sm text-muted-foreground">The requested mock session could not be retrieved.</p>
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

  // Grade classification for certification
  const competencyTier = confidence >= 85 
    ? { grade: "Grade A+ — Enterprise Ready", badge: "Verified Executive Communicator" }
    : confidence >= 70
    ? { grade: "Grade A — Placement Competent", badge: "Verified Professional Communicator" }
    : { grade: "Grade B — Foundation Stage", badge: "Certified Placement Aspirant" };

  const certId = `MIRAL-CERT-${session.id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-background pb-16">
      
      {/* Printable Certificate View & Screen UI */}
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation & Action Bar */}
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
              onClick={handlePrintCertificate}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export PDF Certificate</span>
            </Button>
            <Button 
              size="sm" 
              className="gap-2 text-xs font-semibold"
              onClick={() => setLocation('/scenarios')}
            >
              <span>Practice Next Track</span>
            </Button>
          </div>
        </div>

        {/* Official 1-Page Verification Certificate Card (Portfolio Ready) */}
        <div 
          ref={certificateRef}
          className="border-2 border-primary/30 rounded-xl bg-card p-6 md:p-8 shadow-xs relative overflow-hidden print:border-black print:shadow-none"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-border/50 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" />
                MIRAL Verified Communication Credential
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {session.topic || 'General Practice Session'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Completed on {new Date(session.createdAt).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-muted-foreground uppercase block">Credential ID</span>
              <span className="font-mono text-xs font-semibold text-primary">{certId}</span>
              <div className="mt-1">
                <Badge variant="outline" className="text-xs border-green-500/40 text-green-600 dark:text-green-400 font-medium">
                  {competencyTier.badge}
                </Badge>
              </div>
            </div>
          </div>

          {/* Core Verified Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-border/50">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Overall Confidence</span>
              <span className="text-2xl font-bold text-primary">{confidence} <span className="text-xs font-normal text-muted-foreground">/ 100</span></span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">{competencyTier.grade}</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Visual Engagement</span>
              <span className="text-2xl font-bold text-foreground">{eye}%</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">{eye >= 75 ? 'Direct Gaze Maintained' : 'Gaze Shift Noted'}</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Posture Stability</span>
              <span className="text-2xl font-bold text-foreground">{posture}%</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">{posture >= 75 ? 'Upright & Centered' : 'Posture Adjusted'}</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Cadence & Fillers</span>
              <span className="text-2xl font-bold text-foreground">{wpm} <span className="text-xs font-normal text-muted-foreground">WPM</span></span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">{fillers === 0 ? 'Zero Fillers' : `${fillers} Fillers Detected`}</span>
            </div>
          </div>

          {/* Transcript Audit Log */}
          <div className="pt-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
              Spoken Transcript & Articulation Log
            </span>
            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/40 text-xs text-foreground/90 font-mono leading-relaxed">
              {session.transcript || 'No continuous vocal audio detected during this session.'}
            </div>
          </div>

          {/* Verification Signature & Security Note */}
          <div className="pt-6 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 mt-6">
            <span>Verified via In-Browser 3D Facial Landmark & Speech Analytics Pipeline</span>
            <span className="font-semibold text-foreground/80">MIRAL AI Communication Standard</span>
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
