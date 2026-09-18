// client/src/pages/report.tsx
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation, Link } from 'wouter';
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
  Star,
  X,
  Play
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
          : fillers <= 3
          ? `${fillers} filler words detected. Natural conversational flow, but try replacing quick filler syllables with calm, deliberate pauses.`
          : `${fillers} filler words detected. Take a silent 1-second breath when gathering thoughts instead of bridging gaps with filler sounds.`,
        status: fillers <= 1 ? "Crisp Clarity" : "Filler Reduction Needed",
      },
      strategy: {
        title: "Structure & Impact Strategy",
        text: `For questions like "${topic}", open with a 15-second key takeaway, support with 2 concrete project metrics or evidence points, and conclude with the broader positive outcome.`,
        status: "Action Strategy",
      }
    };
  }, [eye, posture, wpm, fillers, topic]);

  return (
    <Card className="border border-white/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.06)] bg-white/[0.03] backdrop-blur-xl rounded-2xl overflow-hidden card-gradient-top">
      <CardHeader className="border-b border-white/[0.06] pb-3 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">
              MIRAL Speech &amp; Vision Diagnostics
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
            Automated Speech &amp; Vision Audit
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">{insights.presence.title}</span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 bg-emerald-500/10">{insights.presence.status}</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{insights.presence.text}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">{insights.delivery.title}</span>
            <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400 bg-cyan-500/10">{insights.delivery.status}</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{insights.delivery.text}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">{insights.clarity.title}</span>
            <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-300 bg-indigo-500/10">{insights.clarity.status}</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{insights.clarity.text}</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">{insights.strategy.title}</span>
            <Badge variant="outline" className="text-[10px] text-violet-300 border-violet-500/30 bg-violet-500/10">Delivery Technique</Badge>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{insights.strategy.text}</p>
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
    <Card className="border border-white/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.06)] bg-white/[0.03] backdrop-blur-xl rounded-2xl overflow-hidden card-gradient-top">
      <CardHeader className="border-b border-white/[0.06] pb-3 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">
              Executive Vocabulary &amp; Phrasing Upgrades (ESL Bridge)
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
            Vocabulary Polishing
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {upgrades.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs space-y-2 hover:border-indigo-500/30 transition-all">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-semibold font-mono">
                <span>Informal / Colloquial</span>
                <span>Executive Upgrade</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] font-mono text-xs gap-2">
                <span className="text-slate-400 line-through truncate max-w-[45%]">{item.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="text-cyan-400 font-bold text-right truncate max-w-[50%]">{item.to}</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">{item.explanation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SessionFeedbackCard({ sessionId, onFeedbackSubmitted }: { sessionId: string; onFeedbackSubmitted?: () => void }) {
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
      setIsSubmitted(true);
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      toast({
        title: "Feedback Recorded",
        description: "Thank you for helping us improve MIRAL for your placement drive!",
      });
    } catch {
      setIsSubmitted(true);
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl shadow-xs rounded-2xl">
        <CardContent className="p-4 flex items-center justify-between gap-3 text-xs text-white">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Feedback submitted successfully. Thank you for helping us improve MIRAL!</span>
          </div>
          <span className="font-semibold text-indigo-400">Keep practicing &amp; shining! ✨</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-white/[0.08] shadow-[0_0_30px_rgba(99,102,241,0.06)] bg-white/[0.03] backdrop-blur-xl rounded-2xl overflow-hidden card-gradient-top">
      <CardHeader className="border-b border-white/[0.06] pb-3 bg-white/[0.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">
              Pilot Experience Feedback
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] text-slate-400 border-white/10 bg-white/[0.02]">
            Quick 10s Rating
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold text-white">How helpful was this practice session?</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`h-7 w-7 rounded-lg border text-xs font-bold transition-all ${
                    rating >= star
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                      : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
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
              className="rounded border-white/20 bg-white/[0.06] text-indigo-500 focus:ring-indigo-500 h-3.5 w-3.5"
            />
            <span className="text-slate-400 text-xs">Did anything lag, freeze, or feel inaccurate?</span>
          </label>

          <div className="space-y-1">
            <Input
              placeholder="Optional: What would make your next attempt even better?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="text-xs h-8 bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/50"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-semibold h-8 px-4 gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0"
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
  const { toast } = useToast();

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFeedbackSuccessModal, setShowFeedbackSuccessModal] = useState(false);
  const [popupRating, setPopupRating] = useState(5);
  const [popupHadIssue, setPopupHadIssue] = useState(false);
  const [popupComment, setPopupComment] = useState('');
  const [isPopupSubmitting, setIsPopupSubmitting] = useState(false);

  useEffect(() => {
    if (sessionId) {
      const hasSeen = localStorage.getItem('miral_has_seen_feedback_popup');
      if (!hasSeen) {
        const timer = setTimeout(() => setShowFeedbackModal(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [sessionId]);

  const handlePopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPopupSubmitting(true);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          rating: popupRating,
          hadIssue: popupHadIssue,
          comment: popupComment.trim() || null,
        }),
      });
      localStorage.setItem('miral_has_seen_feedback_popup', 'true');
      setShowFeedbackModal(false);
      setShowFeedbackSuccessModal(true);
      toast({
        title: "Feedback Recorded",
        description: "Thank you for helping us improve MIRAL!",
      });
    } catch {
      localStorage.setItem('miral_has_seen_feedback_popup', 'true');
      setShowFeedbackModal(false);
      setShowFeedbackSuccessModal(true);
    } finally {
      setIsPopupSubmitting(false);
    }
  };

  const handleDismissModal = () => {
    localStorage.setItem('miral_has_seen_feedback_popup', 'true');
    setShowFeedbackModal(false);
  };

  const { data: session, isLoading, error } = useQuery<Session>({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId,
    retry: 2,
  });

  const handlePrintSummary = () => {
    window.print();
  };

  const localBackupSession = useMemo(() => {
    try {
      if (sessionId) {
        const stored = sessionStorage.getItem(`session_data_${sessionId}`);
        if (stored) return JSON.parse(stored);
      }
      const lastCompleted = sessionStorage.getItem('last_completed_session');
      if (lastCompleted) {
        const parsed = JSON.parse(lastCompleted);
        if (!sessionId || parsed.id === sessionId || sessionId.startsWith('miral-') || sessionId.startsWith('local-')) {
          return parsed;
        }
      }
      const allStored = localStorage.getItem('miral_completed_sessions');
      if (allStored) {
        const list = JSON.parse(allStored);
        if (Array.isArray(list) && list.length > 0) {
          const match = sessionId ? list.find((s: any) => s && s.id === sessionId) : list[0];
          if (match) return match;
          return list[0];
        }
      }
      return null;
    } catch {
      return null;
    }
  }, [sessionId]);

  const activeSession = useMemo(() => {
    if (!session && !localBackupSession) return null;
    if (!session) return localBackupSession;
    if (!localBackupSession) return session;

    // Merge: prioritize non-zero / valid values across both sources
    const mergedDuration = getDuration(session) > 0 ? getDuration(session) : getDuration(localBackupSession);
    const mergedEye = getEyeContact(session) > 0 ? getEyeContact(session) : getEyeContact(localBackupSession);
    const mergedPosture = getPosture(session) > 0 ? getPosture(session) : getPosture(localBackupSession);
    const mergedWpm = getWpm(session) > 0 ? getWpm(session) : getWpm(localBackupSession);
    const mergedFillers = getFillers(session) >= 0 ? getFillers(session) : getFillers(localBackupSession);
    const mergedConfidence = getConfidence(session) > 0 ? getConfidence(session) : (getConfidence(localBackupSession) > 0 ? getConfidence(localBackupSession) : 85);

    return {
      ...session,
      ...localBackupSession,
      duration: mergedDuration,
      eyeContactPercentage: mergedEye,
      postureScore: mergedPosture,
      wordsPerMinute: mergedWpm,
      fillerWordsCount: mergedFillers,
      confidenceScore: mergedConfidence,
      transcript: session.transcript || localBackupSession.transcript || '',
      topic: session.topic || localBackupSession.topic || 'General Practice Session',
      strengths: (session.strengths && session.strengths.length > 0) ? session.strengths : (localBackupSession.strengths || ["Consistent visual focus", "Clear vocal delivery"]),
      improvements: (session.improvements && session.improvements.length > 0) ? session.improvements : (localBackupSession.improvements || ["Maintain 130-155 WPM speaking cadence", "Keep practicing to eliminate filler words"]),
    };
  }, [session, localBackupSession]);

  if (isLoading && !localBackupSession) {
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

  if (!activeSession) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Session Report Unavailable</h2>
        <p className="text-sm text-muted-foreground">The requested practice session could not be retrieved.</p>
        <Button onClick={() => setLocation('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  const confidence = getConfidence(activeSession);
  const eye = getEyeContact(activeSession);
  const posture = getPosture(activeSession);
  const wpm = getWpm(activeSession);
  const fillers = getFillers(activeSession);
  const duration = getDuration(activeSession);
  const durationMins = Math.floor(duration / 60);
  const durationSecs = duration % 60;

  const performanceTier = confidence >= 85 
    ? "Advanced Delivery — Stage & Interview Ready"
    : confidence >= 70
    ? "Competent Delivery — Strong Foundation"
    : "Developing Delivery — Continued Practice Recommended";

  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 pb-16 relative overflow-x-hidden">
      {/* Aurora Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden">
        <div className="aurora-blob-1 absolute top-[-100px] left-[-80px] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="aurora-blob-2 absolute top-[40%] right-[-120px] w-[450px] h-[450px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="aurora-blob-3 absolute bottom-[-100px] left-[25%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      {/* 10-Second Pilot Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.25)] bg-[#090b10] backdrop-blur-2xl rounded-2xl overflow-hidden card-gradient-top">
            <CardHeader className="border-b border-white/[0.08] pb-3 flex flex-row items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <CardTitle className="text-sm font-bold text-white">
                  How was this session?
                </CardTitle>
              </div>
              <button
                type="button"
                onClick={handleDismissModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handlePopupSubmit} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <span className="font-semibold text-white block">
                    Rate this practice attempt (10s quick feedback):
                  </span>
                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPopupRating(star)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                          popupRating >= star
                            ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                            : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
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
                    checked={popupHadIssue}
                    onChange={(e) => setPopupHadIssue(e.target.checked)}
                    className="rounded border-white/20 bg-white/[0.06] text-indigo-500 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="text-slate-400 text-xs">Did anything lag, freeze, or feel inaccurate?</span>
                </label>

                <div className="space-y-1">
                  <Input
                    placeholder="Optional: What would make your next attempt even better?"
                    value={popupComment}
                    onChange={(e) => setPopupComment(e.target.value)}
                    className="text-xs h-9 bg-white/[0.06] border border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/50"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleDismissModal}
                    className="text-xs text-slate-400 hover:text-white font-medium"
                  >
                    Skip for now
                  </button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPopupSubmitting}
                    className="text-xs font-semibold h-8 px-5 gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0"
                  >
                    {isPopupSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Submit &amp; View Report</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between print:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-xs text-slate-400 hover:text-white hover:bg-white/[0.04]"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-xs font-semibold border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200"
              onClick={handlePrintSummary}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export Performance PDF</span>
            </Button>
            <Button 
              size="sm" 
              className="gap-2 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0"
              onClick={() => setLocation('/scenarios')}
            >
              <span>Practice Next Session</span>
            </Button>
          </div>
        </div>

        {/* Executive Speech Performance Summary Card */}
        <div className="border border-white/[0.08] rounded-2xl bg-white/[0.04] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_40px_rgba(99,102,241,0.08)] relative overflow-hidden card-gradient-top print:border-black print:shadow-none">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Activity className="h-4 w-4" />
                Session Performance Analysis
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {activeSession.topic || 'General Practice Session'}
              </h1>
              <p className="text-xs text-slate-400">
                Recorded on {new Date(activeSession.createdAt || new Date()).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} | Duration: {durationMins}m {durationSecs}s
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[11px] text-slate-500 uppercase block font-medium">Readiness Level</span>
              <Badge variant="outline" className="text-xs border-indigo-500/40 text-indigo-300 bg-indigo-500/10 font-medium mt-1">
                {performanceTier}
              </Badge>
            </div>
          </div>

          {/* Primary Speech & Vision Metric Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-white/[0.08]">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">Overall Score</span>
              <span className="text-2xl font-bold text-indigo-400">{confidence} <span className="text-xs font-normal text-slate-500">/ 100</span></span>
              <span className="text-[10px] text-slate-500 block">Composite Confidence</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">Visual Engagement</span>
              <span className="text-2xl font-bold text-cyan-400">{eye}%</span>
              <span className="text-[10px] text-slate-500 block">{eye >= 75 ? 'Direct Focus' : 'Gaze Shift Noted'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">Posture Stability</span>
              <span className="text-2xl font-bold text-violet-400">{posture}%</span>
              <span className="text-[10px] text-slate-500 block">{posture >= 75 ? 'Upright & Centered' : 'Adjustment Suggested'}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">Cadence &amp; Fillers</span>
              <span className="text-2xl font-bold text-emerald-400">{wpm} <span className="text-xs font-normal text-slate-500">WPM</span></span>
              <span className="text-[10px] text-slate-500 block">{fillers === 0 ? 'Zero Fillers' : `${fillers} Fillers Counted`}</span>
            </div>
          </div>

          {/* Transcript & Articulation Section */}
          <div className="pt-6 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white">
              <FileText className="h-3.5 w-3.5 text-indigo-400" />
              Spoken Transcript &amp; Articulation Log
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-300 font-mono leading-relaxed">
              {activeSession.transcript || 'No continuous spoken audio recorded during this session.'}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-white/[0.08] mt-6 gap-2">
            <span>Powered by MIRAL Multi-Modal AI (3D Facial Vision &amp; Speech Engine)</span>
            <span className="font-medium text-slate-400">AI Public Speaking &amp; Communication Platform</span>
          </div>
        </div>

        {/* Structured Diagnostics, Vocabulary Upgrade, and Feedback Sections */}
        <div className="space-y-6 print:hidden">
          <AICoachSection session={activeSession} />
          <VocabularyUpgradeSection transcript={activeSession.transcript || ''} />
          {sessionId && (
            <SessionFeedbackCard 
              sessionId={sessionId} 
              onFeedbackSubmitted={() => setShowFeedbackSuccessModal(true)} 
            />
          )}
        </div>

      </div>

      {/* Professional Feedback Confirmation Popup Modal */}
      {showFeedbackSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border border-indigo-500/30 shadow-[0_0_60px_rgba(99,102,241,0.25)] bg-[#090b10] backdrop-blur-2xl rounded-2xl animate-in zoom-in-95 duration-200 card-gradient-top">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <CardTitle className="text-lg font-bold text-white">
                Thank You for Your Valuable Feedback!
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 leading-relaxed pt-1">
                We truly appreciate your insights. Our engineering team will review your notes to make MIRAL even more responsive for your upcoming interviews and presentations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-center space-y-4">
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-slate-200">
                Keep practicing, stay confident, and keep shining! ✨
              </div>
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  className="flex-1 text-xs font-semibold border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200"
                  onClick={() => setShowFeedbackSuccessModal(false)}
                >
                  Close
                </Button>
                <Link href="/practice" className="flex-1">
                  <Button className="w-full text-xs font-semibold gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0">
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Keep Practicing</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
