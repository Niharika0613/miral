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
    // 1. Visual presence insight
    let presenceText = "";
    let presenceStatus = "";
    if (eye >= 80 && posture >= 80) {
      presenceText = `Exceptional visual engagement on "${topic}". Maintaining ${eye}% camera gaze with upright posture (${posture}%) projects composure, authority, and authenticity.`;
      presenceStatus = "Strong Composure";
    } else if (eye < 55 && posture < 60) {
      presenceText = `Your visual engagement was ${eye}% and posture was ${posture}%. During practice, your gaze frequently dropped and posture slouched. Elevate your laptop to eye level and look directly at the webcam lens.`;
      presenceStatus = "Gaze & Posture Focus";
    } else if (eye < 65) {
      presenceText = `Holding eye contact forward towards your audience was at ${eye}%. In interviews and speeches, holding direct lens gaze establishes immediate trust and rapport.`;
      presenceStatus = "Gaze Focus Needed";
    } else {
      presenceText = `Good energy on "${topic}". Keep your spine erect and shoulders square (${posture}%) to reinforce non-verbal conviction throughout long explanations.`;
      presenceStatus = "Posture Alignment";
    }

    // 2. Vocal cadence insight
    let deliveryText = "";
    let deliveryStatus = "";
    if (wpm === 0) {
      deliveryText = `No continuous vocal pace recorded (0 WPM). Ensure your microphone is enabled and speak with audible, clear volume during your practice.`;
      deliveryStatus = "Microphone Check";
    } else if (wpm >= 125 && wpm <= 165) {
      deliveryText = `Optimal speaking cadence measured at ${wpm} WPM. This rate allows listeners to comfortably absorb ideas and complex arguments without fatigue.`;
      deliveryStatus = "Optimal Rhythm";
    } else if (wpm > 0 && wpm < 125) {
      deliveryText = `Speaking rhythm was measured at ${wpm} WPM (deliberate / slow). Aim for 130–155 WPM in placement drives and debates by minimizing pauses between sentences.`;
      deliveryStatus = "Pacing Boost Needed";
    } else {
      deliveryText = `You spoke rapidly at ${wpm} WPM. High energy is great, but use deliberate 1-second pauses before key takeaways so critical numbers and points sink in.`;
      deliveryStatus = "Pacing Control";
    }

    // 3. Articulation & fillers
    let clarityText = "";
    let clarityStatus = "";
    if (fillers === 0) {
      clarityText = `Zero filler words detected. Articulation was disciplined, concise, and clean.`;
      clarityStatus = "Crisp Articulation";
    } else if (fillers <= 2) {
      clarityText = `Very clean delivery with only ${fillers} filler phrase(s) noted. Keep breathing calmly before answering complex questions.`;
      clarityStatus = "Good Fluency";
    } else {
      clarityText = `Detected ${fillers} filler phrase(s) ("um", "like", "basically", "matlab"). Practice replacing reflexive sounds with a silent 1-second pause while thinking.`;
      clarityStatus = "Hesitation Noted";
    }

    // 4. Topic-Specific Strategic delivery tip
    let strategyText = "";
    let strategyStatus = "Core Delivery Technique";
    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('hr') || lowerTopic.includes('placement') || lowerTopic.includes('interview')) {
      strategyText = `For campus HR drives: Structure behavioral answers using STAR (Situation -> Task -> Action -> Measurable Result) to prove concrete competencies.`;
      strategyStatus = "STAR Methodology";
    } else if (lowerTopic.includes('tech') || lowerTopic.includes('defense') || lowerTopic.includes('viva') || lowerTopic.includes('project')) {
      strategyText = `For technical defenses: Walk from high-level architecture down to database trade-offs, explain bottlenecks resolved, and quantify latency/scalability.`;
      strategyStatus = "System Architecture Tip";
    } else if (lowerTopic.includes('gd') || lowerTopic.includes('discussion') || lowerTopic.includes('debate')) {
      strategyText = `For GDs & Debates: Open with a balanced framing statement, cite 1 real-world industry example, and invite others or synthesize the discussion.`;
      strategyStatus = "Turn-Taking & Framing";
    } else if (lowerTopic.includes('pitch')) {
      strategyText = `For 60s pitches: Hook the listener in the first 10s with the core problem, highlight your unique unfair advantage, and finish with a strong call-to-action.`;
      strategyStatus = "Elevator Hook & CTA";
    } else {
      strategyText = `For speeches and presentations: Structure key arguments using the Rule of Three (Point 1 -> Point 2 -> Point 3) and close with a definitive summary.`;
      strategyStatus = "Rule of Three";
    }

    return {
      presence: { title: "Visual Connection & Non-Verbal Presence", text: presenceText, status: presenceStatus },
      delivery: { title: "Vocal Pacing & Cadence", text: deliveryText, status: deliveryStatus },
      clarity: { title: "Articulation & Hesitation Control", text: clarityText, status: clarityStatus },
      strategy: { title: "Delivery Strategy & Impact Tip", text: strategyText, status: strategyStatus },
    };
  }, [topic, eye, posture, wpm, fillers]);

  return (
    <Card className="border border-border/60 shadow-xs bg-card">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              MIRAL Speech & Vision Diagnostics
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
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">{insights.strategy.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{insights.strategy.text}</p>
        </div>

      </CardContent>
    </Card>
  );
}

function VocabularyUpgradeSection({ transcript, topic }: { transcript: string; topic?: string }) {
  const { upgrades, hasDetectedWords } = useMemo(() => {
    const list: { from: string; to: string; explanation: string; isDetected: boolean }[] = [];
    const text = (transcript || '').toLowerCase();
    const cleanTopic = (topic || '').toLowerCase();

    // 1. Comprehensive library of candidate speech, ESL patterns, and corporate upgrades
    const vocabularyBank = [
      // --- Self-Introduction & Background ---
      {
        pattern: /\b(myself|my name is|i am)\b/i,
        from: "Myself [Name] / My name is",
        to: "I am [Name], a final-year engineer specializing in...",
        explanation: "Corrects the colloquial 'Myself...' error to standard corporate introduction.",
        category: "intro"
      },
      {
        pattern: /\b(passout|passed out|pass out|fresher)\b/i,
        from: "passout / fresher candidate",
        to: "recent graduate / early-career engineer",
        explanation: "Replaces outdated campus slang with globally recognized recruitment terms.",
        category: "intro"
      },
      {
        pattern: /\b(knowledge of|know about|learned about|learning)\b/i,
        from: "I have knowledge of / know about",
        to: "I have hands-on proficiency & specialized depth in",
        explanation: "Elevates passive bookish knowledge to active engineering execution.",
        category: "intro"
      },
      {
        pattern: /\b(my hobbies are|i like to play|free time|in my free time)\b/i,
        from: "my hobbies are / in free time",
        to: "Beyond core academics, I actively cultivate",
        explanation: "Frames personal interests as disciplined co-curricular initiatives.",
        category: "intro"
      },
      {
        pattern: /\b(hardworking|do hard work|hard work|work hard)\b/i,
        from: "hardworking person / do hard work",
        to: "demonstrate high execution rigor & ownership",
        explanation: "Replaces generic buzzwords with measurable professional competencies.",
        category: "hr"
      },
      {
        pattern: /\b(want this job|want to join|want to work in your company)\b/i,
        from: "want to join your company",
        to: "am eager to contribute to your core engineering roadmap",
        explanation: "Demonstrates strategic alignment with the organization's business impact.",
        category: "hr"
      },
      {
        pattern: /\b(in my college|during my college|in our college)\b/i,
        from: "in my college / during college",
        to: "throughout my undergraduate coursework & capstone labs",
        explanation: "Formalizes campus references into structured academic credentials.",
        category: "hr"
      },

      // --- Common Indian English / ESL Colloquialisms ---
      {
        pattern: /\b(cope up|cope up with)\b/i,
        from: "cope up with",
        to: "adapt seamlessly to / manage effectively",
        explanation: "Corrects the common Indian ESL redundancy 'cope up with'.",
        category: "esl"
      },
      {
        pattern: /\b(give exam|give interview|giving interview)\b/i,
        from: "give an interview / give exam",
        to: "appear for an assessment / take an interview",
        explanation: "Standardizes the literal Hindi-to-English translation ('interview dena').",
        category: "esl"
      },
      {
        pattern: /\b(revert back|revert)\b/i,
        from: "revert back",
        to: "respond / follow up with updates",
        explanation: "Replaces the redundant Indian corporate phrase 'revert back'.",
        category: "esl"
      },
      {
        pattern: /\b(doubt|have a doubt|i have doubt)\b/i,
        from: "I have a doubt",
        to: "I would like clarification on / I have a question regarding",
        explanation: "Uses positive, inquiry-driven language rather than expressing doubt.",
        category: "esl"
      },
      {
        pattern: /\b(tell about|explain about|discuss about)\b/i,
        from: "tell about / discuss about",
        to: "walk through / analyze the details of",
        explanation: "Removes unnecessary preposition 'about' after transitive verbs.",
        category: "esl"
      },

      // --- Technical & Project Defense ---
      {
        pattern: /\b(made a project|did a project|our project is|my project is|built a project)\b/i,
        from: "made a project / our project is",
        to: "architected a capstone engineering initiative designed to",
        explanation: "Conveys system architecture ownership rather than academic assignment completion.",
        category: "tech"
      },
      {
        pattern: /\b(made a website|made an app|built a website|built an app|created website)\b/i,
        from: "made a website / app",
        to: "engineered and deployed a full-stack platform",
        explanation: "Emphasizes end-to-end software development lifecycle standards.",
        category: "tech"
      },
      {
        pattern: /\b(used database|stored data|in mysql|in mongodb|in database)\b/i,
        from: "used database / stored data",
        to: "designed optimized relational schemas & indexed queries",
        explanation: "Demonstrates database design and query efficiency.",
        category: "tech"
      },
      {
        pattern: /\b(used api|connected api|call api|calling api)\b/i,
        from: "used API / connected API",
        to: "integrated asynchronous RESTful endpoints & microservices",
        explanation: "Demonstrates backend architectural clarity.",
        category: "tech"
      },
      {
        pattern: /\b(fixed the bug|fixed the issue|solved the error|fixed error|solved it)\b/i,
        from: "fixed the bug / solved the error",
        to: "diagnosed root-cause and deployed remediation patches",
        explanation: "Reflects professional debugging methodology and RCA depth.",
        category: "tech"
      },
      {
        pattern: /\b(it was slow|speed problem|lagging|very slow)\b/i,
        from: "it was slow / speed issue",
        to: "encountered latency bottlenecks under concurrent load",
        explanation: "Quantifies performance hurdles with industry standard terminology.",
        category: "tech"
      },
      {
        pattern: /\b(tested it|checked it|did testing)\b/i,
        from: "tested it / checked it",
        to: "conducted unit & end-to-end integration validation",
        explanation: "Highlights software testing discipline and QA standards.",
        category: "tech"
      },
      {
        pattern: /\b(with my friends|team members|in team|with group)\b/i,
        from: "with my friends / in team",
        to: "in an Agile sprint with cross-functional peer engineers",
        explanation: "Highlights collaborative engineering teamwork.",
        category: "tech"
      },

      // --- Group Discussion, Pitching & General Articulation ---
      {
        pattern: /\b(i think|i feel that|in my opinion|i guess|maybe)\b/i,
        from: "I think / I feel / maybe",
        to: "Empirical data indicates / From a strategic perspective",
        explanation: "Projects assertive conviction and evidence-backed reasoning.",
        category: "gd"
      },
      {
        pattern: /\b(agree with you|same point|i agree)\b/i,
        from: "I agree with you / same point",
        to: "I concur with that assessment and would build upon it by",
        explanation: "Demonstrates executive active listening and turn-taking in GDs.",
        category: "gd"
      },
      {
        pattern: /\b(dont agree|i disagree|you are wrong|wrong)\b/i,
        from: "I don't agree / you are wrong",
        to: "I offer an alternative perspective considering...",
        explanation: "Maintains professional diplomacy and composure during debates.",
        category: "gd"
      },
      {
        pattern: /\b(pros and cons|good and bad|advantages and disadvantages)\b/i,
        from: "pros and cons / good and bad",
        to: "architectural trade-offs & strategic implications",
        explanation: "Elevates conversational speech to board-level analytical framing.",
        category: "gd"
      },
      {
        pattern: /\b(in the end|lastly|at last|final point)\b/i,
        from: "in the end / lastly",
        to: "In synthesis / To summarize our actionable takeaways",
        explanation: "Delivers crisp, definitive closing statements.",
        category: "gd"
      },
      {
        pattern: /\b(very good|really good|nice work|great)\b/i,
        from: "very good / really great",
        to: "highly scalable / quantitatively impactful",
        explanation: "Replaces vague subjective compliments with measurable value.",
        category: "general"
      },
      {
        pattern: /\b(big problem|huge problem|hard thing|trouble|difficult)\b/i,
        from: "big problem / hard thing",
        to: "critical operational bottleneck",
        explanation: "Frames challenges as objective engineering hurdles.",
        category: "general"
      },
      {
        pattern: /\b(lots of|a lot of|many things|so many)\b/i,
        from: "lots of / a lot of",
        to: "a comprehensive suite of / substantial volume of",
        explanation: "Elevates informal quantity to formal executive vocabulary.",
        category: "general"
      }
    ];

    // 2. Scan transcript for direct spoken matches
    let foundCount = 0;
    if (text.length > 0) {
      vocabularyBank.forEach(item => {
        if (item.pattern.test(text) && !list.some(existing => existing.from === item.from)) {
          list.push({ from: item.from, to: item.to, explanation: item.explanation, isDetected: true });
          foundCount++;
        }
      });
    }

    const isDetected = foundCount > 0;

    // 3. If fewer than 4 matched, dynamically fill with Scenario-Specific Upgrades
    if (list.length < 4) {
      let targetCategory = "intro";
      if (cleanTopic.includes('tech') || cleanTopic.includes('viva') || cleanTopic.includes('code') || cleanTopic.includes('project')) {
        targetCategory = "tech";
      } else if (cleanTopic.includes('gd') || cleanTopic.includes('debate') || cleanTopic.includes('discussion')) {
        targetCategory = "gd";
      } else if (cleanTopic.includes('hr') || cleanTopic.includes('placement') || cleanTopic.includes('interview')) {
        targetCategory = "hr";
      }

      // First add category-matching items
      vocabularyBank
        .filter(item => item.category === targetCategory)
        .forEach(item => {
          if (!list.some(existing => existing.from === item.from) && list.length < 4) {
            list.push({ from: item.from, to: item.to, explanation: item.explanation, isDetected: false });
          }
        });

      // Then fill any remaining from general bank
      vocabularyBank.forEach(item => {
        if (!list.some(existing => existing.from === item.from) && list.length < 4) {
          list.push({ from: item.from, to: item.to, explanation: item.explanation, isDetected: false });
        }
      });
    }

    return { upgrades: list.slice(0, 4), hasDetectedWords: isDetected };
  }, [transcript, topic]);

  return (
    <Card className="border border-border/60 shadow-xs bg-card">
      <CardHeader className="border-b border-border/40 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Executive Vocabulary & Phrasing Upgrades
              </CardTitle>
              <span className="text-[10px] text-muted-foreground block">
                English as a Second Language (ESL) — Upgrades informal phrases to executive boardroom English
              </span>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            {hasDetectedWords ? "Matched to Your Speech" : "Scenario Recommended"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {upgrades.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-lg bg-muted/20 border border-border/40 text-xs space-y-2">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                <span className="flex items-center gap-1.5">
                  <span>Informal / Spoken</span>
                  {item.isDetected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Detected in your speech" />
                  )}
                </span>
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
      <Card className="border border-green-500/30 bg-green-500/5 shadow-xs">
        <CardContent className="p-4 flex items-center justify-between gap-3 text-xs text-foreground">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <span>Feedback submitted successfully. Thank you for helping us improve MIRAL!</span>
          </div>
          <span className="font-semibold text-primary">Keep practicing & shining! ✨</span>
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
    <div className="min-h-screen bg-background pb-16">

      {/* 10-Second Pilot Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="max-w-md w-full border-2 border-primary/30 shadow-2xl bg-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-3 flex flex-row items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold text-foreground">
                  How was this session?
                </CardTitle>
              </div>
              <button
                type="button"
                onClick={handleDismissModal}
                className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handlePopupSubmit} className="space-y-4 text-xs">
                <div className="space-y-2">
                  <span className="font-semibold text-foreground block">
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
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
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
                    checked={popupHadIssue}
                    onChange={(e) => setPopupHadIssue(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span className="text-muted-foreground text-xs">Did anything lag, freeze, or feel inaccurate?</span>
                </label>

                <div className="space-y-1">
                  <Input
                    placeholder="Optional: What would make your next attempt even better?"
                    value={popupComment}
                    onChange={(e) => setPopupComment(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleDismissModal}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium"
                  >
                    Skip for now
                  </button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPopupSubmitting}
                    className="text-xs font-semibold h-8 px-5 gap-1.5"
                  >
                    {isPopupSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Submit & View Report</span>
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
                {activeSession.topic || 'General Practice Session'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Recorded on {new Date(activeSession.createdAt || new Date()).toLocaleDateString(undefined, { 
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
              {activeSession.transcript || 'No continuous spoken audio recorded during this session.'}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 mt-6 gap-2">
            <span>Powered by MIRAL Multi-Modal AI (3D Facial Vision & Speech Engine)</span>
            <span className="font-medium text-foreground/80">AI Public Speaking & Communication Platform</span>
          </div>
        </div>

        {/* Structured Diagnostics, Vocabulary Upgrade, and Feedback Sections */}
        <div className="space-y-6 print:hidden">
          <AICoachSection session={activeSession} />
          <VocabularyUpgradeSection transcript={activeSession.transcript || ''} topic={activeSession.topic} />
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
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-2 border-primary/30 shadow-2xl bg-card animate-in zoom-in-95 duration-200">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">
                Thank You for Your Valuable Feedback!
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                We truly appreciate your insights. Our engineering team will review your notes to make MIRAL even more responsive for your upcoming interviews and presentations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 text-center space-y-4">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 text-xs font-medium text-foreground">
                Keep practicing, stay confident, and keep shining! ✨
              </div>
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  className="flex-1 text-xs font-semibold"
                  onClick={() => setShowFeedbackSuccessModal(false)}
                >
                  Close
                </Button>
                <Link href="/practice" className="flex-1">
                  <Button className="w-full text-xs font-semibold gap-1.5 shadow-sm">
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
