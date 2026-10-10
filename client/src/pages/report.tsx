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
  Play,
  Award,
  ExternalLink,
  GraduationCap,
  Check,
  QrCode,
  Copy,
  Lock,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/utils/auth';
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
      presenceText = `Holding eye contact forward towards your audience was at ${eye}%. In presentations, speeches, and discussions, holding direct lens gaze establishes immediate trust and rapport.`;
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
      deliveryText = `Speaking rhythm was measured at ${wpm} WPM (deliberate / slow). Aim for 130–155 WPM in competitive speaking, debates, and presentations by minimizing pauses between sentences.`;
      deliveryStatus = "Pacing Boost Needed";
    } else {
      deliveryText = `You spoke rapidly at ${wpm} WPM. High energy is great, but use deliberate 1-second pauses before key takeaways so critical arguments and ideas sink in.`;
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
      strategyText = `For interview rounds: Structure answers using STAR (Situation -> Task -> Action -> Measurable Result) to prove concrete competencies.`;
      strategyStatus = "STAR Methodology";
    } else if (lowerTopic.includes('tech') || lowerTopic.includes('defense') || lowerTopic.includes('viva') || lowerTopic.includes('project')) {
      strategyText = `For technical defenses & viva: Walk from high-level architecture down to database trade-offs, explain bottlenecks resolved, and quantify latency.`;
      strategyStatus = "System Architecture Tip";
    } else if (lowerTopic.includes('gd') || lowerTopic.includes('discussion') || lowerTopic.includes('debate')) {
      strategyText = `For GDs & Debates: Open with a balanced framing statement, cite 1 real-world example, and invite others or synthesize the discussion.`;
      strategyStatus = "Turn-Taking & Framing";
    } else if (lowerTopic.includes('pitch')) {
      strategyText = `For elevator pitches: Hook the listener in the first 10s with the core problem, highlight your unique unfair advantage, and finish with a strong call-to-action.`;
      strategyStatus = "Elevator Hook & CTA";
    } else if (lowerTopic.includes('recitation') || lowerTopic.includes('poetry') || lowerTopic.includes('speech')) {
      strategyText = `For speeches & recitation: Modulate your pitch to emphasize emotional peaks, utilize dramatic pauses, and maintain direct eye contact with the audience.`;
      strategyStatus = "Pitch Modulation & Flow";
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
            Automated Multi-Modal Audit
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

interface UpgradeItem {
  from: string;
  to: string;
  explanation: string;
  isDetected: boolean;
  detectedContext?: string;
}

function VocabularyUpgradeSection({ transcript, topic }: { transcript: string; topic?: string }) {
  const { upgrades, hasDetectedWords } = useMemo(() => {
    const list: UpgradeItem[] = [];
    const text = (transcript || '').trim();
    const lowerText = text.toLowerCase();
    const cleanTopic = (topic || '').toLowerCase();

    // Comprehensive vocabulary bank with regex patterns
    const vocabularyBank = [
      // Self-Intro & Background
      {
        pattern: /\b(myself\s+[\w]+|my name is\s+[\w]+|i am\s+[\w]+)\b/i,
        from: "Myself [Name] / My name is...",
        to: "I am [Name], specializing in...",
        explanation: "Corrects colloquial intro phrasing to standard formal self-introduction.",
        category: "intro"
      },
      {
        pattern: /\b(passout|passed out|pass out|fresher)\b/i,
        from: "passout / fresher candidate",
        to: "recent graduate / early-career professional",
        explanation: "Replaces outdated campus slang with standard professional terminology.",
        category: "intro"
      },
      {
        pattern: /\b(knowledge of|know about|learned about|i know)\b/i,
        from: "I have knowledge of / know about",
        to: "I have hands-on proficiency & specialized depth in",
        explanation: "Elevates passive bookish knowledge to active practical depth.",
        category: "intro"
      },
      {
        pattern: /\b(my hobbies are|i like to play|free time|in my free time)\b/i,
        from: "my hobbies are / in free time",
        to: "Beyond my core pursuits, I actively cultivate",
        explanation: "Frames personal interests as disciplined initiatives.",
        category: "intro"
      },
      {
        pattern: /\b(hardworking|do hard work|hard work|work hard)\b/i,
        from: "hardworking person / do hard work",
        to: "demonstrate high execution rigor & ownership",
        explanation: "Replaces generic buzzwords with measurable competencies.",
        category: "hr"
      },
      {
        pattern: /\b(want this job|want to join|want to work in your company)\b/i,
        from: "want to join your company",
        to: "am eager to contribute to your core organizational mission",
        explanation: "Demonstrates strategic alignment with organizational value.",
        category: "hr"
      },
      {
        pattern: /\b(in my college|during my college|in our college)\b/i,
        from: "in my college / during college",
        to: "throughout my academic coursework & capstone projects",
        explanation: "Formalizes campus references into structured academic credentials.",
        category: "hr"
      },

      // Common Indian English / ESL Colloquialisms
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
        explanation: "Replaces the redundant phrase 'revert back'.",
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

      // Technical & Project Defense
      {
        pattern: /\b(made a project|did a project|our project is|my project is|built a project)\b/i,
        from: "made a project / our project is",
        to: "architected a capstone project designed to",
        explanation: "Conveys system architecture ownership rather than academic assignment completion.",
        category: "tech"
      },
      {
        pattern: /\b(made a website|made an app|built a website|built an app|created website)\b/i,
        from: "made a website / app",
        to: "engineered and deployed a full-stack platform",
        explanation: "Emphasizes end-to-end development lifecycle standards.",
        category: "tech"
      },
      {
        pattern: /\b(used database|stored data|in mysql|in mongodb|in database)\b/i,
        from: "used database / stored data",
        to: "designed optimized schemas & indexed data queries",
        explanation: "Demonstrates database design and query efficiency.",
        category: "tech"
      },
      {
        pattern: /\b(used api|connected api|call api|calling api)\b/i,
        from: "used API / connected API",
        to: "integrated asynchronous RESTful endpoints & services",
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

      // GD, Pitching & Executive Articulation
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
        explanation: "Demonstrates active listening and constructive turn-taking in discussions.",
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
        to: "trade-offs & strategic implications",
        explanation: "Elevates conversational speech to structured analytical framing.",
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
        explanation: "Frames challenges as objective problem statements.",
        category: "general"
      },
      {
        pattern: /\b(lots of|a lot of|many things|so many)\b/i,
        from: "lots of / a lot of",
        to: "a comprehensive suite of / substantial volume of",
        explanation: "Elevates informal quantity to formal articulate vocabulary.",
        category: "general"
      }
    ];

    // Scan transcript for direct matches
    let foundCount = 0;
    if (lowerText.length > 0) {
      vocabularyBank.forEach(item => {
        const match = item.pattern.exec(lowerText);
        if (match && !list.some(existing => existing.from === item.from)) {
          // Extract short surrounding snippet (context)
          const startIdx = Math.max(0, match.index - 20);
          const endIdx = Math.min(lowerText.length, match.index + match[0].length + 20);
          const rawSnippet = text.slice(startIdx, endIdx).trim();
          const context = `"...${rawSnippet}..."`;

          list.push({ 
            from: item.from, 
            to: item.to, 
            explanation: item.explanation, 
            isDetected: true,
            detectedContext: context
          });
          foundCount++;
        }
      });
    }

    const isDetected = foundCount > 0;

    // If fewer than 4 matched, fill dynamically with Scenario-Specific Upgrades
    if (list.length < 4) {
      let targetCategory = "intro";
      if (cleanTopic.includes('tech') || cleanTopic.includes('viva') || cleanTopic.includes('code') || cleanTopic.includes('project')) {
        targetCategory = "tech";
      } else if (cleanTopic.includes('gd') || cleanTopic.includes('debate') || cleanTopic.includes('discussion')) {
        targetCategory = "gd";
      } else if (cleanTopic.includes('hr') || cleanTopic.includes('placement') || cleanTopic.includes('interview')) {
        targetCategory = "hr";
      }

      vocabularyBank
        .filter(item => item.category === targetCategory)
        .forEach(item => {
          if (!list.some(existing => existing.from === item.from) && list.length < 4) {
            list.push({ 
              from: item.from, 
              to: item.to, 
              explanation: item.explanation, 
              isDetected: false 
            });
          }
        });

      // Fill remaining from general bank
      vocabularyBank.forEach(item => {
        if (!list.some(existing => existing.from === item.from) && list.length < 4) {
          list.push({ 
            from: item.from, 
            to: item.to, 
            explanation: item.explanation, 
            isDetected: false 
          });
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
                Vocabulary & Phrasing Upgrades
              </CardTitle>
              <span className="text-[10px] text-muted-foreground block">
                Speech Articulation & ESL — Upgrades informal speech patterns into confident, articulate phrasing
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
              Pro • Pilot mein free, 31 Oct tak
            </Badge>
            <Badge variant="outline" className={`text-[10px] ${hasDetectedWords ? 'border-emerald-500/40 text-emerald-600 bg-emerald-500/5' : 'border-primary/30 text-primary'}`}>
              {hasDetectedWords ? "✨ Spoken Audio Matched" : "Scenario Recommended"}
            </Badge>
          </div>
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
                    <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 py-0 px-1.5">
                      In Your Audio
                    </Badge>
                  )}
                </span>
                <span className="text-primary font-bold">Recommended Upgrade</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-muted/40 font-mono text-xs gap-2">
                <span className="text-muted-foreground line-through truncate max-w-[45%]">{item.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-primary font-bold text-right truncate max-w-[50%]">{item.to}</span>
              </div>
            </div>
            {item.detectedContext && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 p-1.5 rounded border border-emerald-500/10 italic">
                Detected snippet: {item.detectedContext}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">{item.explanation}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Recommended Learning Modules Section
function RecommendedLearningSection({ session }: { session: Session }) {
  const eye = getEyeContact(session);
  const posture = getPosture(session);
  const wpm = getWpm(session);
  const fillers = getFillers(session);
  const confidence = getConfidence(session);
  const topic = (session.topic || '').toLowerCase();

  const recommendedList = useMemo(() => {
    const list: {
      title: string;
      reason: string;
      source: string;
      duration: string;
      url: string;
      type: string;
      badge: string;
      isMasterclass?: boolean;
    }[] = [];

    // Rule 1: High Fillers
    if (fillers > 1) {
      list.push({
        title: "Public Speaking Tips: Eliminating Filler Words",
        reason: `Your session recorded ${fillers} filler sounds ("um", "like"). Master the deliberate 1-second pause to project effortless calm.`,
        source: "Toastmasters International",
        duration: "8 min read",
        url: "https://www.toastmasters.org/education/pathways/presentation-mastery",
        type: "Guide",
        badge: `Addresses ${fillers} Fillers Detected`
      });
    }

    // Rule 2: Low Eye Contact or Slouching
    if (eye < 70 || posture < 70) {
      list.push({
        title: "Your Body Language May Shape Who You Are",
        reason: `Eye gaze (${eye}%) or posture (${posture}%) need reinforcement. Amy Cuddy's acclaimed framework builds physical confidence before speaking.`,
        source: "TED Global • Amy Cuddy",
        duration: "21 min watch",
        url: "https://www.youtube.com/watch?v=Unzc731iCUY",
        type: "Video",
        badge: "Visual Stance & Eye Gaze"
      });
    }

    // Rule 3: Fast or Slow Cadence
    if (wpm < 125 || wpm > 165) {
      list.push({
        title: "How to Speak So That People Want to Listen",
        reason: `Your cadence was ${wpm} WPM (target is 130–155 WPM). Julian Treasure shares practical vocal mechanics, breath control, and pacing modulation.`,
        source: "TED • Julian Treasure",
        duration: "10 min watch",
        url: "https://www.youtube.com/watch?v=eIho2S0ZahI",
        type: "Video",
        badge: `Pacing Calibration (${wpm} WPM)`
      });
    }

    // Rule 4: Scenario Based Masterclasses
    if (topic.includes('hr') || topic.includes('placement') || topic.includes('interview')) {
      list.push({
        title: "Campus to Placement: STAR & PREP Interview Blueprint",
        reason: "The complete structured curriculum for behavioral rounds, technical project walkthroughs, and case discussions.",
        source: "Placement Readiness Series",
        duration: "3.5 Hours • 12 Modules",
        url: "/learning",
        type: "Masterclass",
        badge: "Aligned with Interview Practice",
        isMasterclass: true
      });
    } else if (topic.includes('pitch')) {
      list.push({
        title: "The 60-Second Startup Pitch & Storytelling Playbook",
        reason: "High-impact value hooks, metric clarity, and confident delivery to win over investors and judges.",
        source: "Venture Pitch Series",
        duration: "2.5 Hours • Templates",
        url: "/learning",
        type: "Masterclass",
        badge: "Pitch & Presentation Track",
        isMasterclass: true
      });
    } else {
      list.push({
        title: "Executive Speech & Stage Presence Framework",
        reason: "A structured curriculum on commanding audience attention, structuring arguments with the Rule of Three, and eliminating hesitation.",
        source: "Miral Communication Lab",
        duration: "4.5 Hours • Framework",
        url: "/learning",
        type: "Masterclass",
        badge: "Speech & Stage Mastery",
        isMasterclass: true
      });
    }

    // Fallback if list is short
    if (list.length < 3) {
      list.push({
        title: "Body Language Guide for High-Stakes Presentations",
        reason: "Harvard Business Review's research-backed guide on nonverbal cues, camera eye contact, and audience engagement.",
        source: "Harvard Business Review",
        duration: "12 min read",
        url: "https://hbr.org/topic/subject/public-speaking",
        type: "Article",
        badge: "Non-Verbal Delivery Stance"
      });
    }

    return list.slice(0, 3);
  }, [eye, posture, wpm, fillers, confidence, topic]);

  return (
    <Card className="border border-border/60 shadow-xs bg-card">
      <CardHeader className="border-b border-border/40 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Tailored Learning & Skill Recommendations
              </CardTitle>
              <span className="text-[10px] text-muted-foreground block">
                Targeted video masterclasses, frameworks, and guides mapped directly to your session diagnostics
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
              Pro Hub • Pilot mein free, 31 Oct tak
            </Badge>
            <Link href="/learning">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1 h-7 px-2">
                <span>View All Library</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendedList.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-lg bg-muted/20 border border-border/40 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <Badge variant="secondary" className="text-[9px] font-semibold text-primary">
                  {item.type}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{item.duration}</span>
              </div>
              <h4 className="text-xs font-bold text-foreground leading-snug">
                {item.title}
              </h4>
              <Badge variant="outline" className="text-[9px] border-primary/20 text-primary/80 py-0">
                {item.badge}
              </Badge>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.reason}
              </p>
            </div>

            <div className="pt-2 border-t border-border/30 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[50%]">{item.source}</span>
              {item.isMasterclass ? (
                <Link href="/learning">
                  <Button size="sm" variant="default" className="text-[11px] h-7 px-2.5 gap-1">
                    <span>Open Module</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              ) : (
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5 gap-1">
                    <span>Watch / Read</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Dedicated Speech Practice Milestone Certificate Modal & Print Engine
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
  const initialName = (currentUser?.name && currentUser.name !== 'Candidate' && currentUser.name !== 'Verified Speaker')
    ? currentUser.name
    : (localStorage.getItem('userName') || '');

  const [candidateName, setCandidateName] = useState(initialName || 'Candidate');
  const [isEditingName, setIsEditingName] = useState(!initialName || initialName === 'Candidate');
  const [nameInput, setNameInput] = useState(candidateName);

  const confidence = getConfidence(session);
  const eye = getEyeContact(session);
  const posture = getPosture(session);
  const wpm = getWpm(session);
  const fillers = getFillers(session);

  const certId = useMemo(() => {
    const rawId = (session.id || 'PILOT').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    return `MIRAL-CERT-2026-${rawId || '7X92B'}`;
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
      title: "Certificate ID Copied",
      description: `${certId} copied to clipboard for verification.`,
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
        title: "Name Saved",
        description: `Certificate updated for ${trimmed}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="max-w-3xl w-full bg-card border-2 border-primary/40 shadow-2xl rounded-2xl overflow-hidden my-auto">
        
        {/* Certificate Modal Header Bar (Hidden during Print) */}
        <div className="p-4 bg-muted/40 border-b border-border/40 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-bold text-foreground">Certificate of Speaking Practice</h3>
              <p className="text-[11px] text-muted-foreground">Speaking Practice Milestone Recognition</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrintCertificate}
              className="text-xs font-semibold gap-1.5 h-8 bg-primary text-primary-foreground"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* The Printable Certificate Container */}
        <div id="miral-official-certificate" className="p-6 sm:p-10 bg-white text-slate-900 relative print:p-8">
          
          {/* Certificate Classic Border Styling */}
          <div className="border-[6px] border-double border-indigo-950 rounded-xl p-6 sm:p-8 relative bg-radial-pattern">
            
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-700" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-700" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-700" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-700" />

            {/* Header / Logo */}
            <div className="text-center space-y-2 pb-4 border-b border-indigo-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10px] font-bold tracking-widest uppercase">
                <Shield className="h-3.5 w-3.5 text-indigo-700 fill-indigo-100" />
                MIRAL SPEECH & VISION STUDIO
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-indigo-950 tracking-tight">
                Certificate of Speaking Practice
              </h1>
              <p className="text-xs text-slate-600 uppercase tracking-wider font-medium">
                Speaking Practice Milestone • Multi-Modal Delivery Feedback
              </p>
            </div>

            {/* Candidate Presentation */}
            <div className="text-center py-6 space-y-3">
              <p className="text-xs uppercase tracking-widest text-slate-500">This practice milestone certificate is presented to</p>
              
              {isEditingName ? (
                <div className="max-w-xs mx-auto flex items-center gap-2 print:hidden">
                  <Input 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter candidate full name"
                    className="text-center text-sm font-semibold h-9 bg-white border-indigo-300"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName} className="h-9 px-3 text-xs">Save</Button>
                </div>
              ) : (
                <div className="inline-flex items-center justify-center gap-2">
                  <h2 className="text-3xl sm:text-4xl font-bold text-indigo-900 font-serif tracking-tight underline decoration-indigo-300 underline-offset-8">
                    {candidateName}
                  </h2>
                  <button 
                    type="button" 
                    onClick={() => { setNameInput(candidateName); setIsEditingName(true); }}
                    className="text-slate-400 hover:text-indigo-600 p-1 print:hidden" 
                    title="Edit Name on Certificate"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
                For completing dedicated speaking practice sessions and calibrating vocal delivery, pacing rhythm, and camera focus in:
              </p>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 bg-slate-50 inline-block px-4 py-1.5 rounded-lg border border-slate-200">
                  "{session.topic || 'General Practice Track'}"
                </p>
                {eligibility && eligibility.count > 0 && (
                  <p className="text-[11px] text-slate-500 font-medium">
                    {eligibility.count} Practice Session{eligibility.count > 1 ? 's' : ''} Completed
                    {eligibility.improvement !== undefined && eligibility.improvement > 0 ? ` • Progress Trajectory: ${eligibility.firstScore} → ${eligibility.bestScore} pts (+${eligibility.improvement})` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Performance Metric Breakdown */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 my-4 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Practice Score</span>
                <span className="text-lg sm:text-xl font-bold text-indigo-900">{confidence} / 100</span>
                <span className="text-[9px] text-indigo-700 font-medium block">Studio Benchmark</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Visual Engagement</span>
                <span className="text-lg sm:text-xl font-bold text-slate-800">{eye}%</span>
                <span className="text-[9px] text-slate-500 block">Camera Gaze</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Cadence Rhythm</span>
                <span className="text-lg sm:text-xl font-bold text-slate-800">{wpm} <span className="text-[10px] font-normal">WPM</span></span>
                <span className="text-[9px] text-slate-500 block">Speaking Pace</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Speech Clarity</span>
                <span className="text-lg sm:text-xl font-bold text-slate-800">Fillers: {fillers}</span>
                <span className="text-[9px] text-slate-500 block">Hesitation Count</span>
              </div>
            </div>

            {/* Footer / Verification / System Signatures */}
            <div className="pt-6 border-t border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              
              {/* Left: Security & ID */}
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                  <span>Reference ID:</span>
                  <span className="font-bold text-slate-800">{certId}</span>
                  <button onClick={handleCopyCertId} className="hover:text-indigo-600 print:hidden" title="Copy ID">
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Issued: <span className="font-medium text-slate-700">{issueDate}</span>
                </p>
                <div className="flex items-center gap-1 text-[9px] text-slate-600 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Verify: /verify/{certId}</span>
                </div>
              </div>

              {/* Center: Practice Seal */}
              <div className="h-16 w-16 rounded-full border-2 border-indigo-500 bg-indigo-50 flex flex-col items-center justify-center p-1 shadow-xs text-center">
                <Award className="h-6 w-6 text-indigo-700" />
                <span className="text-[7px] uppercase font-bold tracking-tighter text-indigo-950 leading-none mt-0.5">
                  MIRAL AI
                </span>
                <span className="text-[6px] text-indigo-700 uppercase leading-none font-semibold">MILESTONE</span>
              </div>

              {/* Right: Authentic System Verification Engine */}
              <div className="text-center sm:text-right space-y-1">
                <div className="flex items-center justify-center sm:justify-end gap-1.5 text-xs font-bold text-indigo-950 border-b border-slate-300 pb-1 px-2">
                  <Shield className="h-3.5 w-3.5 text-indigo-700" />
                  <span>MIRAL Speech & Vision Analytics</span>
                </div>
                <p className="text-[10px] font-semibold text-slate-700 block">Automated Camera & Cadence Feedback</p>
                <p className="text-[9px] text-slate-500 block">Evaluated via Computer Vision & Audio Analysis</p>
              </div>

            </div>

            {/* Honest Disclaimer */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-[9px] text-slate-500 leading-tight">
                AI-assisted practice assessment based on camera and speech analysis. Not an accredited certification.
              </p>
            </div>

          </div>
        </div>

        {/* Modal Footer Controls (Hidden during Print) */}
        <div className="p-4 bg-muted/30 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground print:hidden">
          <span>This certificate represents individual practice progress in the MIRAL AI studio.</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onClose} className="h-8 text-xs font-semibold">
              Close
            </Button>
            <Button size="sm" onClick={handlePrintCertificate} className="h-8 text-xs font-semibold gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save Certificate</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
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
      await fetch('/api/feedback', {
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
        description: "Thank you for helping us improve MIRAL for your communication goals!",
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

  const [showCertificateModal, setShowCertificateModal] = useState(false);
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
        const timer = setTimeout(() => setShowFeedbackModal(true), 2500);
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
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
      const userKey = userId ? `miral_completed_sessions_${userId}` : 'miral_completed_sessions_guest';
      const allStored = localStorage.getItem(userKey) || localStorage.getItem('miral_completed_sessions');
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
    ? "Advanced Communicator — High Stage & Delivery Presence"
    : confidence >= 70
    ? "Competent Communicator — Strong Delivery Foundation"
    : "Developing Communicator — Practice & Refinement Track";

  // Certificate eligibility: ≥3 sessions, each ≥2 min, AND (best score ≥70 OR improvement ≥10pts from first session)
  const certEligibility = useMemo(() => {
    const currentUserId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    const userKey = currentUserId ? `miral_completed_sessions_${currentUserId}` : 'miral_completed_sessions_guest';
    let allSessions: any[] = [];
    try {
      const stored = localStorage.getItem(userKey);
      allSessions = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(allSessions)) allSessions = [];
    } catch { allSessions = []; }

    // Only count sessions ≥2 minutes (120s)
    const validSessions = allSessions.filter((s: any) => getDuration(s) >= 120);
    const count = validSessions.length;

    if (count === 0) return { eligible: false, count, sessionsNeeded: 3, reason: 'no_sessions' };

    // Sort oldest → newest
    const sorted = [...validSessions].sort((a, b) =>
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
    const firstScore = getConfidence(sorted[0]);
    const bestScore = Math.max(...sorted.map((s: any) => getConfidence(s)));
    const improvement = bestScore - firstScore;

    const meetsMinSessions = count >= 3;
    const meetsScore = bestScore >= 70 || improvement >= 10;

    return {
      eligible: meetsMinSessions && meetsScore,
      count,
      sessionsNeeded: Math.max(0, 3 - count),
      bestScore,
      firstScore,
      improvement,
      reason: !meetsMinSessions ? 'need_more_sessions' : !meetsScore ? 'need_better_score' : 'eligible',
    };
  }, []);


  return (
    <div className="min-h-screen bg-background pb-16">

      {/* Official Speech & Communication Certificate Full-Screen Modal */}
      {showCertificateModal && (
        <SpeechCertificateModal
          session={activeSession}
          eligibility={certEligibility}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

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
        
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Certificate Trigger Button - Locked vs Available based on actual session milestones */}
            {certEligibility.eligible ? (
              <Button 
                variant="default"
                size="sm" 
                className="gap-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-indigo-600 text-white hover:opacity-95 shadow-sm"
                onClick={() => setShowCertificateModal(true)}
              >
                <Award className="h-4 w-4 text-amber-200" />
                <span>View Practice Certificate</span>
              </Button>
            ) : (
              <Button 
                variant="outline"
                size="sm" 
                className="gap-1.5 text-xs font-medium text-muted-foreground border-border/70 hover:bg-muted/50"
                onClick={() => {
                  toast({
                    title: "Certificate In Progress",
                    description: certEligibility.count < 3
                      ? `Complete ${certEligibility.sessionsNeeded} more sustained practice session(s) (≥2 min) to unlock your certificate.`
                      : `Achieve a score of 70+ or improve +10 points from your first session to unlock!`,
                  });
                }}
              >
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {certEligibility.count < 3
                    ? `Certificate: ${certEligibility.sessionsNeeded} more session${certEligibility.sessionsNeeded > 1 ? 's' : ''} to unlock`
                    : 'Certificate: Reach 70+ score to unlock'}
                </span>
              </Button>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 text-xs font-semibold"
              onClick={handlePrintSummary}
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Export PDF</span>
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

            <div className="text-left md:text-right flex flex-col items-start md:items-end gap-1.5">
              <span className="text-[11px] text-muted-foreground uppercase block font-medium">Communication Level</span>
              <Badge variant="outline" className="text-xs border-primary/40 text-primary font-medium">
                {performanceTier}
              </Badge>
              {certEligibility.eligible ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-amber-600 dark:text-amber-400 font-semibold gap-1.5 h-6 px-2 mt-1 print:hidden"
                  onClick={() => setShowCertificateModal(true)}
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>View Practice Certificate →</span>
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1 print:hidden">
                  <Lock className="h-3 w-3 text-muted-foreground/80" />
                  <span>
                    {certEligibility.count < 3
                      ? `${certEligibility.sessionsNeeded} more session${certEligibility.sessionsNeeded > 1 ? 's' : ''} to unlock certificate`
                      : 'Reach 70+ score to unlock certificate'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Primary Speech & Vision Metric Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-border/50">
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">Overall Score</span>
              <span className="text-2xl font-bold text-primary">{confidence} <span className="text-xs font-normal text-muted-foreground">/ 100</span></span>
              <span className="text-[10px] text-muted-foreground block">Composite Score</span>
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
            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/40 text-xs text-foreground/90 font-mono leading-relaxed max-h-48 overflow-y-auto">
              {activeSession.transcript || 'No continuous spoken audio recorded during this session.'}
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 mt-6 gap-2">
            <span>Powered by MIRAL Multi-Modal AI (3D Facial Vision & Speech Engine)</span>
            <span className="font-medium text-foreground/80">AI Public Speaking & Communication Platform</span>
          </div>
        </div>

        {/* Structured Diagnostics, Vocabulary Upgrade, Tailored Learning, and Feedback */}
        <div className="space-y-6 print:hidden">
          <AICoachSection session={activeSession} />
          <VocabularyUpgradeSection transcript={activeSession.transcript || ''} topic={activeSession.topic} />
          <RecommendedLearningSection session={activeSession} />
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
                We truly appreciate your insights. Our engineering team will review your notes to make MIRAL even more responsive for your communication practice.
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
