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
  Loader2,
  Printer,
  Shield,
  FileText,
  BookOpen,
  Star,
  X,
  Play,
  Award,
  ExternalLink,
  GraduationCap,
  Check,
  QrCode,
  Copy,
  Lock,
  Edit3,
  Target,
  BarChart3,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/utils/auth';
import type { Session } from '@shared/schema';
import { VaniDarpanLogo } from '@/components/vanidarpan-logo';

// Safe metric extraction helpers
const getConfidence = (s: any): number => Math.round(s?.confidenceScore ?? s?.confidence_score ?? 0);
const getEyeContact = (s: any): number => Math.round(s?.eyeContactPercentage ?? s?.eye_contact_percentage ?? 0);
const getPosture = (s: any): number => Math.round(s?.postureScore ?? s?.posture_score ?? 0);
const getWpm = (s: any): number => Math.round(s?.wordsPerMinute ?? s?.words_per_minute ?? 0);
const getFillers = (s: any): number => Number(s?.fillerWordsCount ?? s?.filler_words_count ?? 0);
const getDuration = (s: any): number => Number(s?.duration ?? 0);

// Speech Disfluency, Repetition & Hesitation Detector
export function detectFillersAndHesitations(transcript: string): {
  totalCount: number;
  detectedWords: Array<{ word: string; count: number; type: 'filler' | 'repetition' | 'hesitation' }>;
  highlightPhrases: string[];
} {
  if (!transcript || typeof transcript !== 'string') {
    return { totalCount: 0, detectedWords: [], highlightPhrases: [] };
  }

  const lower = transcript.toLowerCase();
  const detectedMap = new Map<string, { count: number; type: 'filler' | 'repetition' | 'hesitation' }>();

  // 1. Standard filler words
  const standardFillers = [
    'um', 'uh', 'er', 'ah', 'umm', 'uhh',
    'basically', 'actually', 'literally', 'honestly', 'obviously',
    'you know', 'i mean', 'sort of', 'kind of',
    'matlab', 'yaani', 'samjhe', 'achha'
  ];

  standardFillers.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      detectedMap.set(filler, { count: matches.length, type: 'filler' });
    }
  });

  // 2. Casual fillers when repeated
  const casualFillers = ['like', 'so', 'well'];
  casualFillers.forEach(filler => {
    const regex = new RegExp(`(^|[.,!?]\\s*|\\s+)${filler}(\\s+|,|\\.)`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length >= 2) {
      detectedMap.set(filler, { count: matches.length - 1, type: 'hesitation' });
    }
  });

  // 3. Stutter / Word Repetition
  const wordRepetitionRegex = /\b([a-zA-Z]{2,})\s+\1\b/gi;
  let repMatch: RegExpExecArray | null;
  while ((repMatch = wordRepetitionRegex.exec(lower)) !== null) {
    const repWord = `${repMatch[1]} ${repMatch[1]}`;
    const existing = detectedMap.get(repWord)?.count || 0;
    detectedMap.set(repWord, { count: existing + 1, type: 'repetition' });
  }

  let totalCount = 0;
  const detectedWords: Array<{ word: string; count: number; type: 'filler' | 'repetition' | 'hesitation' }> = [];
  const highlightPhrases: string[] = [];

  detectedMap.forEach((val, word) => {
    totalCount += val.count;
    detectedWords.push({ word, count: val.count, type: val.type });
    highlightPhrases.push(`"${word}"`);
  });

  return { totalCount, detectedWords, highlightPhrases };
}

// Renders transcript with subtle highlighted filler marks
function HighlightedTranscript({ 
  text, 
  detectedWords 
}: { 
  text: string; 
  detectedWords: Array<{ word: string; count: number; type: string }> 
}) {
  if (!text) {
    return <p className="text-sm text-muted italic">No continuous spoken audio recorded during this session.</p>;
  }

  if (detectedWords.length === 0) {
    return <p className="text-sm text-ink leading-relaxed">{text}</p>;
  }

  // Create regex pattern to highlight filler phrases
  const patterns = detectedWords.map(d => d.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`\\b(${patterns})\\b`, 'gi');
  const parts = text.split(regex);

  return (
    <p className="text-sm text-ink leading-relaxed font-sans">
      {parts.map((part, i) => {
        const isFiller = detectedWords.some(d => d.word.toLowerCase() === part.toLowerCase());
        if (isFiller) {
          return (
            <mark 
              key={i} 
              className="bg-[#FDF1DC] text-[#B26B00] px-1 py-0.5 rounded-sm font-medium mx-0.5"
              title="Filler or hesitation"
            >
              {part}
            </mark>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

// Tactical Playbook & Rubric Section
function TacticalPlaybookSection({ session }: { session: Session }) {
  const topic = session.topic || "Placement Technical Interview";
  const lowerTopic = topic.toLowerCase();

  const scenarioBlueprint = useMemo(() => {
    if (lowerTopic.includes('interview') || lowerTopic.includes('hr') || lowerTopic.includes('placement')) {
      return {
        badge: "Campus Placement HR Track",
        frameworkTitle: "Situation, Task, Action, Result (STAR) Delivery Framework",
        description: "Recruiters evaluate technical competence and structured articulation. Use the STAR method to keep answers focused under two minutes:",
        steps: [
          { label: "1. Situation & Task", detail: "State the project context and key technical bottleneck in 20 seconds." },
          { label: "2. Action Taken", detail: "Detail your individual technical implementation, architecture decisions, and libraries used." },
          { label: "3. Measurable Result", detail: "Conclude with quantifiable outcomes: performance boost, user adoption, or latency reduction." },
          { label: "4. Closing Bridge", detail: "Connect the project experience directly to the role requirements." },
        ],
        goldenPhrase: `"In our final year capstone, our team faced a 300ms API latency bottleneck. I restructured our database indices and introduced asynchronous caching, reducing response times by 42%."`
      };
    } else if (lowerTopic.includes('gd') || lowerTopic.includes('discussion') || lowerTopic.includes('debate')) {
      return {
        badge: "Group Discussion & Debate Track",
        frameworkTitle: "Diplomatic Turn-Taking & Consensus Synthesis Framework",
        description: "Moderators reward speakers who provide structured framing, empirical examples, and synthesize peer ideas:",
        steps: [
          { label: "1. Diplomatic Entry", detail: "Acknowledge the previous speaker before introducing your perspective." },
          { label: "2. Empirical Anchor", detail: "Cite one concrete real-world case study or data point to back your claim." },
          { label: "3. Synthesis Catalyst", detail: "Bridge divergent points made by peers to prove active listening." },
          { label: "4. Collaborative Call", detail: "Invite other participants into the discussion to demonstrate facilitation." },
        ],
        goldenPhrase: `"While I appreciate the economic argument presented, industry empirical data suggests we also consider long-term operational sustainability."`
      };
    } else {
      return {
        badge: "Public Speaking & Keynote Track",
        frameworkTitle: "The Rule of Three & Rhetorical Pauses Framework",
        description: "High-impact speaking commands audience attention by dividing core ideas into three clear points paced with intentional pauses:",
        steps: [
          { label: "1. Provocative Opening", detail: "Open with a question or narrative hook before stating your core thesis." },
          { label: "2. The Rule of Three", detail: "Group all supporting arguments into exactly three memorable pillars." },
          { label: "3. Strategic Pauses", detail: "Pause for one full second before each key takeaway to let critical concepts land." },
          { label: "4. Definitive Synthesis", detail: "Reiterate your core thesis in your closing 20 seconds with steady eye gaze." },
        ],
        goldenPhrase: `"To achieve scalable communication excellence, we must focus on three core pillars: visual composure, vocal cadence, and structured articulation."`
      };
    }
  }, [lowerTopic]);

  return (
    <div className="bg-paper border border-hairline rounded-lg p-6 text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hairline">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold text-ink">{scenarioBlueprint.frameworkTitle}</h3>
          <p className="text-xs text-muted">Tactical framework calibrated for: <span className="text-ink font-medium">{topic}</span></p>
        </div>
        <span className="text-xs text-darpan-blue bg-darpan-blue-tint px-2.5 py-1 rounded-md font-medium w-fit">
          {scenarioBlueprint.badge}
        </span>
      </div>

      <p className="text-xs text-text leading-relaxed">
        {scenarioBlueprint.description}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {scenarioBlueprint.steps.map((step, idx) => (
          <div key={idx} className="p-3.5 rounded-md bg-surface border border-hairline space-y-1">
            <span className="text-xs font-semibold text-ink block">{step.label}</span>
            <p className="text-xs text-muted leading-relaxed">{step.detail}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-md bg-surface border border-hairline border-l-4 border-l-darpan-blue">
        <span className="text-xs font-medium text-muted block mb-1">Recommended phrasing example</span>
        <p className="text-xs text-ink italic leading-relaxed">{scenarioBlueprint.goldenPhrase}</p>
      </div>
    </div>
  );
}

// Dedicated Certificate Modal matching DESIGN.md
function SpeechCertificateModal({
  session,
  eligibility,
  onClose
}: {
  session: Session;
  eligibility?: {
    eligible: boolean;
    count: number;
    sessionsNeeded: number;
    bestScore?: number;
    firstScore?: number;
    improvement?: number;
  };
  onClose: () => void;
}) {
  const currentUser = getCurrentUser();
  const initialName = (currentUser?.name && currentUser.name !== 'Candidate' && currentUser.name !== 'Speaker')
    ? currentUser.name
    : (localStorage.getItem('userName') || '');

  const [candidateName, setCandidateName] = useState(initialName || 'Candidate');
  const [isEditingName, setIsEditingName] = useState(!initialName || initialName === 'Candidate');
  const [nameInput, setNameInput] = useState(candidateName);

  const confidence = getConfidence(session);
  const eye = getEyeContact(session);
  const posture = getPosture(session);
  const wpm = getWpm(session);
  const storedFillers = getFillers(session);
  const detectedFillers = useMemo(() => 
    detectFillersAndHesitations(session?.transcript || ''),
    [session?.transcript]
  );
  const fillers = Math.max(storedFillers, detectedFillers.totalCount);

  const certId = useMemo(() => {
    const rawId = (session.id || 'PILOT').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    return `VANIDARPAN-CERT-2026-${rawId || '7X92B'}`;
  }, [session.id]);

  const issueDate = useMemo(() => {
    return new Date(session.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [session.createdAt]);

  const handlePrintCertificate = () => {
    window.print();
  };

  const { toast } = useToast();
  const handleCopyCertId = () => {
    navigator.clipboard.writeText(certId);
    toast({
      title: "Certificate ID copied",
      description: `${certId} copied to clipboard.`,
    });
  };

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setCandidateName(trimmed);
      localStorage.setItem('userName', trimmed);
      sessionStorage.setItem('userName', trimmed);
      setIsEditingName(false);
      toast({
        title: "Name saved",
        description: `Certificate updated for ${trimmed}.`,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0E1726]/60 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-3xl w-full bg-paper border border-hairline rounded-lg overflow-hidden my-auto shadow-[0_8px_24px_rgba(14,23,38,0.12)]">
        
        {/* Certificate Modal Top Bar */}
        <div className="p-4 bg-surface border-b border-hairline flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-darpan-blue" />
            <span className="text-sm font-semibold text-ink">Certificate of speaking practice</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrintCertificate}
              className="h-8 px-3 text-xs font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              <span>Print / Save PDF</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="h-8 px-2 rounded-md bg-paper border-hairline text-ink hover:bg-surface"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="p-8 sm:p-12 bg-paper text-ink relative print:p-8 space-y-6 text-center">
          
          {/* Certificate Inner Frame */}
          <div className="border border-hairline rounded-lg p-6 sm:p-10 space-y-6 relative bg-paper">
            
            {/* Top Header */}
            <div className="space-y-2 pb-6 border-b border-hairline">
              <div className="flex justify-center mb-2">
                <VaniDarpanLogo height={32} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
                Certificate of speaking practice
              </h1>
              <p className="text-xs text-muted">
                Issued by VaniDarpan • On-device practice mirror
              </p>
            </div>

            {/* Candidate Presentation */}
            <div className="py-4 space-y-3">
              <p className="text-xs text-muted">This practice milestone certificate is presented to</p>
              
              {isEditingName ? (
                <div className="max-w-xs mx-auto flex items-center gap-2 print:hidden">
                  <Input 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter candidate full name"
                    className="text-center text-sm font-semibold h-9 bg-paper border-hairline"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName} className="h-9 px-3 text-xs bg-darpan-blue text-white">Save</Button>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
                    {candidateName}
                  </h2>
                  <button 
                    type="button" 
                    onClick={() => { setNameInput(candidateName); setIsEditingName(true); }}
                    className="text-muted hover:text-ink p-1 print:hidden" 
                    title="Edit name on certificate"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs text-text max-w-lg mx-auto leading-relaxed pt-2">
                For completing dedicated on-device speaking practice sessions across gaze stability, vocal cadence, and delivery clarity in:
              </p>
              
              <div className="inline-block px-4 py-1.5 rounded-md bg-surface border border-hairline text-sm font-medium text-ink">
                "{session.topic || 'General Practice Track'}"
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-4 gap-3 py-4 border-t border-b border-hairline">
              <div className="p-3 bg-surface rounded-md">
                <span className="text-[11px] text-muted block">Score</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{confidence} / 100</span>
              </div>
              <div className="p-3 bg-surface rounded-md">
                <span className="text-[11px] text-muted block">Eye contact</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{eye}%</span>
              </div>
              <div className="p-3 bg-surface rounded-md">
                <span className="text-[11px] text-muted block">Pace</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{wpm} wpm</span>
              </div>
              <div className="p-3 bg-surface rounded-md">
                <span className="text-[11px] text-muted block">Fillers</span>
                <span className="text-lg font-semibold text-ink tabular-nums">{fillers}</span>
              </div>
            </div>

            {/* Footer with Brass Seal, ID, and QR */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
              
              {/* Reference ID & Date */}
              <div className="space-y-1 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span>Record ID:</span>
                  <span className="font-semibold text-ink tabular-nums">{certId}</span>
                  <button onClick={handleCopyCertId} className="hover:text-ink print:hidden" title="Copy ID">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <div>Issued on: {issueDate}</div>
                <div>Verify at: vanidarpan.app/verify</div>
              </div>

              {/* Center Brass Seal */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-brass flex flex-col items-center justify-center p-1 text-center bg-paper">
                  <Award className="h-5 w-5 text-brass" />
                  <span className="text-[8px] font-semibold text-brass uppercase leading-none mt-0.5">
                    Darpan
                  </span>
                </div>
                <span className="text-[10px] text-muted mt-1">Practice seal</span>
              </div>

              {/* QR Code */}
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-paper border border-hairline rounded-md">
                  <QrCode className="h-10 w-10 text-ink" />
                </div>
                <div className="text-[10px] text-muted space-y-0.5">
                  <div className="font-medium text-ink">Scan to view</div>
                  <div>Direct milestone record</div>
                </div>
              </div>

            </div>

          </div>

          <p className="text-[11px] text-muted text-center pt-2">
            This certificate confirms individual practice progress completed on the VaniDarpan on-device practice mirror.
          </p>

        </div>

      </div>
    </div>
  );
}

export default function Report() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/report/:id');
  const sessionId = params?.id;
  const { toast } = useToast();

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showFeedbackSuccessModal, setShowFeedbackSuccessModal] = useState(false);
  const [popupRating, setPopupRating] = useState(5);
  const [popupComment, setPopupComment] = useState('');
  const [popupHadIssue, setPopupHadIssue] = useState(false);
  const [isPopupSubmitting, setIsPopupSubmitting] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('vanidarpan_has_seen_feedback_popup');
    if (!hasSeen && sessionId && sessionId !== 'sample') {
      const timer = setTimeout(() => {
        setShowFeedbackModal(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [sessionId]);

  const handlePopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPopupSubmitting(true);
    try {
      if (sessionId && sessionId !== 'sample') {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            rating: popupRating,
            comment: popupComment ? `[Quick Feedback] ${popupComment}` : '[Quick Feedback Rating]',
            category: popupHadIssue ? 'Bug' : 'General',
          }),
        }).catch(() => {});
      }
      localStorage.setItem('vanidarpan_has_seen_feedback_popup', 'true');
      setShowFeedbackModal(false);
      toast({
        title: "Feedback received",
        description: "Thank you for helping us improve VaniDarpan.",
      });
    } catch {
      localStorage.setItem('vanidarpan_has_seen_feedback_popup', 'true');
      setShowFeedbackModal(false);
    } finally {
      setIsPopupSubmitting(false);
    }
  };

  const handleDismissModal = () => {
    localStorage.setItem('vanidarpan_has_seen_feedback_popup', 'true');
    setShowFeedbackModal(false);
  };

  const { data: session, isLoading } = useQuery<Session>({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId && sessionId !== 'sample',
    retry: 2,
  });

  const { data: allUserSessions } = useQuery<Session[]>({
    queryKey: ['/api/sessions'],
    retry: 1,
  });

  const handlePrintSummary = () => {
    window.print();
  };

  const localBackupSession = useMemo(() => {
    try {
      if (sessionId === 'sample') {
        return {
          id: 'sample',
          topic: 'Campus Placement Technical Interview',
          duration: 124,
          eyeContactPercentage: 88,
          postureScore: 92,
          wordsPerMinute: 142,
          fillerWordsCount: 2,
          confidenceScore: 88,
          transcript: "Good morning. I would like to walk you through our approach to building scalable web applications. During our final year capstone project, our team designed a microservices-based communication module that handled concurrent client requests with minimal latency. We implemented an asynchronous event-driven pipeline that processed requests efficiently. By profiling the network bottlenecks early, basically we reduced peak response times substantially.",
          strengths: ["Maintained steady eye contact with the camera lens", "Pacing stayed within the optimal 130–150 wpm range"],
          improvements: ["Reduce transitional filler words when introducing new concepts", "Maintain upright posture during technical queries"]
        };
      }
      if (sessionId) {
        const stored = sessionStorage.getItem(`session_data_${sessionId}`);
        if (stored) return JSON.parse(stored);
      }
      const lastCompleted = sessionStorage.getItem('last_completed_session');
      if (lastCompleted) {
        const parsed = JSON.parse(lastCompleted);
        if (!sessionId || parsed.id === sessionId || sessionId.startsWith('vd-') || sessionId.startsWith('local-')) {
          return parsed;
        }
      }
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
      const userKey = userId ? `vanidarpan_completed_sessions_${userId}` : 'vanidarpan_completed_sessions_guest';
      const allStored = localStorage.getItem(userKey) || localStorage.getItem('vanidarpan_completed_sessions');
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

    return {
      ...session,
      ...localBackupSession,
      duration: getDuration(session) > 0 ? getDuration(session) : getDuration(localBackupSession),
      eyeContactPercentage: getEyeContact(session) > 0 ? getEyeContact(session) : getEyeContact(localBackupSession),
      postureScore: getPosture(session) > 0 ? getPosture(session) : getPosture(localBackupSession),
      wordsPerMinute: getWpm(session) > 0 ? getWpm(session) : getWpm(localBackupSession),
      fillerWordsCount: getFillers(session) >= 0 ? getFillers(session) : getFillers(localBackupSession),
      confidenceScore: getConfidence(session) > 0 ? getConfidence(session) : (getConfidence(localBackupSession) > 0 ? getConfidence(localBackupSession) : 85),
      transcript: session.transcript || localBackupSession.transcript || '',
      topic: session.topic || localBackupSession.topic || 'General Practice Session',
    };
  }, [session, localBackupSession]);

  if (isLoading && !localBackupSession) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-44 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-semibold text-ink">Session report unavailable</h2>
        <p className="text-sm text-muted">The requested practice session could not be retrieved.</p>
        <Button onClick={() => setLocation('/dashboard')} className="bg-darpan-blue text-white rounded-md">
          Return to dashboard
        </Button>
      </div>
    );
  }

  const confidence = getConfidence(activeSession);
  const eye = getEyeContact(activeSession);
  const posture = getPosture(activeSession);
  const wpm = getWpm(activeSession);
  const storedFillers = getFillers(activeSession);
  const transcriptAnalysis = detectFillersAndHesitations(activeSession?.transcript || '');
  const fillers = Math.max(storedFillers, transcriptAnalysis.totalCount);
  const duration = getDuration(activeSession);
  const durationMins = Math.floor(duration / 60);
  const durationSecs = duration % 60;
  const wordCount = (activeSession.transcript || '').trim().split(/\s+/).filter(Boolean).length;

  // Single concrete Next Step drill based on metrics
  const nextStepDrill = useMemo(() => {
    if (eye < 70) {
      return {
        title: "Webcam lens anchor drill",
        description: "Place a small sticky dot next to your webcam lens. Train your gaze to lock onto the camera lens during the first 60 seconds of your answer.",
        action: "Practice camera gaze"
      };
    }
    if (fillers > 2) {
      return {
        title: "One-second silent breath drill",
        description: "When shifting between points or thinking of a word, replace verbal fillers ('um', 'basically') with a deliberate one-second silent breath.",
        action: "Practice elimination of fillers"
      };
    }
    if (wpm < 125 && wpm > 0) {
      return {
        title: "Pacing acceleration read-aloud",
        description: "Practice delivering your self-introduction at a steady 140 wpm cadence to convey prompt command of the topic.",
        action: "Practice conversational pace"
      };
    }
    if (wpm > 160) {
      return {
        title: "Deliberate pause pacing drill",
        description: "Insert a brief pause after stating your main premise so interviewers can comfortably process technical details.",
        action: "Practice pacing control"
      };
    }
    return {
      title: "STAR technical summary drill",
      description: "Deliver a 90-second response following Situation, Task, Action, and Measurable Result with direct camera eye contact.",
      action: "Practice structured response"
    };
  }, [eye, fillers, wpm]);

  // Certificate eligibility
  const certEligibility = {
    eligible: (allUserSessions && allUserSessions.length >= 3) || confidence >= 80,
    count: (allUserSessions ? allUserSessions.length : 1),
    sessionsNeeded: Math.max(0, 3 - (allUserSessions ? allUserSessions.length : 1))
  };

  return (
    <div className="min-h-screen bg-surface pb-20 font-sans text-text">

      {/* Official Certificate Modal */}
      {showCertificateModal && (
        <SpeechCertificateModal
          session={activeSession}
          eligibility={certEligibility}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* Quick Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-[#0E1726]/60 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-paper border border-hairline rounded-lg p-6 shadow-sm space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <span className="text-sm font-semibold text-ink">How was this practice session?</span>
              <button onClick={handleDismissModal} className="text-muted hover:text-ink">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handlePopupSubmit} className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs text-text block">Rate your practice attempt:</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPopupRating(star)}
                      className={`flex-1 py-1.5 rounded-md border text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                        popupRating >= star
                          ? 'bg-darpan-blue text-white border-darpan-blue'
                          : 'bg-surface text-muted border-hairline hover:bg-gray-100'
                      }`}
                    >
                      <span>{star}</span>
                      <Star className="h-3 w-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Input
                  placeholder="Optional: What would make your next attempt better?"
                  value={popupComment}
                  onChange={(e) => setPopupComment(e.target.value)}
                  className="h-9 text-xs bg-paper border-hairline rounded-md"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleDismissModal}
                  className="text-xs text-muted hover:text-ink"
                >
                  Skip
                </button>
                <Button
                  type="submit"
                  disabled={isPopupSubmitting}
                  className="h-8 px-4 text-xs font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover"
                >
                  Submit feedback
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 px-3 text-xs font-medium text-muted hover:text-ink rounded-md gap-1.5"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {certEligibility.eligible && (
              <Button 
                variant="outline"
                size="sm" 
                className="h-9 px-4 text-xs font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface gap-1.5"
                onClick={() => setShowCertificateModal(true)}
              >
                <Award className="h-3.5 w-3.5 text-brass" />
                <span>View practice certificate</span>
              </Button>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 text-xs font-medium rounded-md bg-paper border-hairline text-ink hover:bg-surface gap-1.5"
              onClick={handlePrintSummary}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </Button>
            
            <Button 
              size="sm" 
              className="h-9 px-5 text-xs font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover"
              onClick={() => setLocation('/scenarios')}
            >
              <span>Practice next scenario</span>
            </Button>
          </div>
        </div>

        {/* 1. Score at the Top */}
        <div className="bg-paper border border-hairline rounded-lg p-6 sm:p-8 space-y-6 text-left shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-hairline">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted">Session report</span>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.01em] text-ink">
                {activeSession.topic || 'General practice session'}
              </h1>
              <p className="text-xs text-muted">
                Recorded on {new Date(activeSession.createdAt || new Date()).toLocaleDateString(undefined, { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • Duration: {durationMins}m {durationSecs}s
              </p>
            </div>

            <div className="text-left sm:text-right flex flex-col items-start sm:items-end gap-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl sm:text-5xl font-semibold text-ink tabular-nums">{confidence}</span>
                <span className="text-sm text-muted font-normal">/ 100</span>
              </div>
              <span className="text-xs font-medium text-darpan-blue bg-darpan-blue-tint px-2.5 py-0.5 rounded-md">
                {confidence >= 80 ? 'Placement ready' : confidence >= 65 ? 'Developing competence' : 'Needs practice'}
              </span>
            </div>
          </div>

          {/* 2. Four Metric Blocks Each with a One-Line Plain Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1: Eye Contact */}
            <div className="bg-surface border border-hairline rounded-lg p-5 space-y-2 text-left">
              <div className="text-xs font-medium text-muted">Eye contact</div>
              <div className="text-2xl font-semibold text-ink tabular-nums">{eye}%</div>
              <p className="text-xs text-text leading-relaxed">
                {eye >= 80 
                  ? 'Maintained direct camera focus for most of your speaking time.' 
                  : eye >= 65 
                  ? 'Consistent camera gaze with occasional glances away from the lens.' 
                  : 'Camera eye contact was below target. Position your webcam at eye level.'}
              </p>
            </div>

            {/* Metric 2: Posture */}
            <div className="bg-surface border border-hairline rounded-lg p-5 space-y-2 text-left">
              <div className="text-xs font-medium text-muted">Posture</div>
              <div className="text-2xl font-semibold text-ink tabular-nums">{posture}%</div>
              <p className="text-xs text-text leading-relaxed">
                {posture >= 80 
                  ? 'Upright and centered physical posture throughout the session.' 
                  : posture >= 65 
                  ? 'Steady posture with occasional slouching or leaning.' 
                  : 'Downward head tilt or slouching detected. Keep chest open.'}
              </p>
            </div>

            {/* Metric 3: Pace */}
            <div className="bg-surface border border-hairline rounded-lg p-5 space-y-2 text-left">
              <div className="text-xs font-medium text-muted">Pace</div>
              <div className="text-2xl font-semibold text-ink tabular-nums">{wpm} wpm</div>
              <p className="text-xs text-text leading-relaxed">
                {wpm === 0 
                  ? 'No speech pacing detected. Check your microphone.' 
                  : (wpm >= 125 && wpm <= 155) 
                  ? 'Optimal conversational tempo within the 130–150 wpm target.' 
                  : wpm < 125 
                  ? 'Speaking pace was deliberate with extended silent pauses.' 
                  : 'Speaking pace was rapid. Insert one-second pauses between points.'}
              </p>
            </div>

            {/* Metric 4: Filler Words */}
            <div className="bg-surface border border-hairline rounded-lg p-5 space-y-2 text-left">
              <div className="text-xs font-medium text-muted">Filler words</div>
              <div className="text-2xl font-semibold text-ink tabular-nums">{fillers === 0 ? '0' : fillers} detected</div>
              <p className="text-xs text-text leading-relaxed">
                {fillers === 0 
                  ? 'Zero filler sounds or verbal repetitions detected in your audio.' 
                  : fillers <= 2 
                  ? `Clean articulation with ${fillers} minor hesitation word(s) noted.` 
                  : `${fillers} verbal pause crutches or repetitions detected.`}
              </p>
            </div>

          </div>
        </div>

        {/* 3. Transcript with Highlighted Fillers */}
        <div className="bg-paper border border-hairline rounded-lg p-6 sm:p-8 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hairline">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-ink">Spoken transcript</h2>
              <p className="text-xs text-muted">
                {wordCount} words spoken • {durationMins}m {durationSecs}s duration
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-md font-medium w-fit ${
              fillers === 0 
                ? 'bg-success-tint text-success' 
                : 'bg-caution-tint text-caution'
            }`}>
              {fillers === 0 ? 'Zero filler words' : `${fillers} filler word${fillers > 1 ? 's' : ''} highlighted`}
            </span>
          </div>

          <div className="p-4 rounded-md bg-surface border border-hairline">
            <HighlightedTranscript 
              text={activeSession.transcript || ''} 
              detectedWords={transcriptAnalysis.detectedWords} 
            />
          </div>

          {transcriptAnalysis.detectedWords.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted font-medium">Detected phrases:</span>
              {transcriptAnalysis.detectedWords.map((item, idx) => (
                <span 
                  key={idx}
                  className="bg-surface border border-hairline text-xs text-ink px-2.5 py-0.5 rounded-md tabular-nums"
                >
                  "{item.word}": {item.count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4. One "Next Step" Recommendation */}
        <div className="bg-paper border border-hairline rounded-lg p-6 sm:p-8 text-left space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-darpan-blue bg-darpan-blue-tint px-2.5 py-0.5 rounded-md">
              Next step
            </span>
            <h2 className="text-lg font-semibold text-ink">
              {nextStepDrill.title}
            </h2>
          </div>

          <p className="text-sm text-text leading-relaxed max-w-2xl">
            {nextStepDrill.description}
          </p>

          <div className="pt-2">
            <Link href="/practice">
              <Button className="h-10 px-6 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover transition-colors">
                Start practice session
              </Button>
            </Link>
          </div>
        </div>

        {/* 5. Tactical Framework */}
        <TacticalPlaybookSection session={activeSession} />

      </div>

    </div>
  );
}
