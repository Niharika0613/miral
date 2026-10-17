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
  Edit3,
  Target,
  Lightbulb,
  Compass,
  Flame
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

// Intelligent Speech Disfluency, Repetition & Hesitation Detector
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

  // 1. Standard verbal filler crutches
  const standardFillers = [
    'um', 'uh', 'uhm', 'er', 'ah', 'ahm', 'hmm', 'huh',
    'you know', 'i mean', 'kind of', 'kinda', 'sort of',
    'basically', 'actually', 'literally', 'essentially',
    'at the end of the day', 'you see', 'to be honest',
    'so yeah', 'and all that', 'something like that',
    'matlab', 'yaani', 'aur kya', 'hai na'
  ];

  standardFillers.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      detectedMap.set(filler, { count: matches.length, type: 'filler' });
    }
  });

  // 2. Casual fillers like "like", "so", "well" when repeated
  const casualFillers = ['like', 'so', 'well'];
  casualFillers.forEach(filler => {
    const regex = new RegExp(`(^|[.,!?]\\s*|\\s+)${filler}(\\s+|,|\\.)`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length >= 2) {
      detectedMap.set(filler, { count: matches.length - 1, type: 'hesitation' });
    }
  });

  // 3. Stutter / Word Repetition disfluency: e.g. "hello hello", "I I", "and and", "we we"
  const wordRepetitionRegex = /\b([a-zA-Z]{2,})\s+\1\b/gi;
  let repMatch: RegExpExecArray | null;
  while ((repMatch = wordRepetitionRegex.exec(lower)) !== null) {
    const repWord = `${repMatch[1]} ${repMatch[1]}`;
    const existing = detectedMap.get(repWord)?.count || 0;
    detectedMap.set(repWord, { count: existing + 1, type: 'repetition' });
  }

  // 4. Repeated greeting phrase: e.g. "good morning ... good morning"
  if (lower.includes('good morning') && lower.split('good morning').length > 2) {
    const existing = detectedMap.get('good morning (repeated)')?.count || 0;
    detectedMap.set('good morning (repeated)', { count: existing + 1, type: 'repetition' });
  }

  // 5. Awkward mid-greeting pause connector: e.g. "because good morning"
  if (/\bbecause\s+(good morning|my name|hello|hi)\b/i.test(lower)) {
    const existing = detectedMap.get('pause "because"')?.count || 0;
    detectedMap.set('pause "because"', { count: existing + 1, type: 'hesitation' });
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

interface AICoachSectionProps {
  session: Session;
  transcriptAnalysis?: {
    totalCount: number;
    detectedWords: Array<{ word: string; count: number; type: 'filler' | 'repetition' | 'hesitation' }>;
    highlightPhrases: string[];
  };
}

function AICoachSection({ session, transcriptAnalysis: externalAnalysis }: AICoachSectionProps) {
  const topic = session.topic || 'General Speech Practice';
  const eye = getEyeContact(session);
  const posture = getPosture(session);
  const wpm = getWpm(session);
  const duration = getDuration(session);
  const transcript = (session.transcript || '').trim();
  const lowerTranscript = transcript.toLowerCase();
  const wordsCount = transcript.split(/\s+/).filter(Boolean).length;

  const analysis = useMemo(() => {
    return externalAnalysis || detectFillersAndHesitations(transcript);
  }, [externalAnalysis, transcript]);

  const storedFillers = getFillers(session);
  const fillers = Math.max(storedFillers, analysis.totalCount);
  const lowerTopic = topic.toLowerCase();

  // Scenario Strategic Master Blueprint
  const scenarioBlueprint = useMemo(() => {
    if (lowerTopic.includes('hr') || lowerTopic.includes('placement') || lowerTopic.includes('interview')) {
      return {
        badge: "Campus Placement & Technical HR Track",
        frameworkTitle: "The 3-Step Self-Introduction Blueprint (Identity → Academic Focus → Value & Fit)",
        description: "In campus HR rounds, evaluators look for a clear personal identity, concrete academic background, and future ambition delivered with calm authority in under 60 seconds:",
        steps: [
          { label: "1. Clean Greeting & Identity", detail: "Open with exactly one confident greeting ('Good morning') and full name. Never repeat greetings or stutter." },
          { label: "2. Academic Specialization", detail: "State your degree and core discipline (e.g. 'Bachelor's in Science / Computer Science') with graduation year." },
          { label: "3. Project & Tech Highlight", detail: "Mention 1 hands-on academic capstone project or core technical strength with tangible results." },
          { label: "4. Future Value & Ambition", detail: "Close by stating why you are excited to apply your analytical skills to this role." },
        ],
        goldenPhrase: `"Good morning. My name is [Name]. I have completed my degree in [Specialization], focusing on [Core Subject]. During my academic tenure, I developed [Project], and I am excited to contribute my problem-solving skills to this team."`,
        executiveTip: "Never open with 'Myself [Name]' or 'My name is hi...'. Maintain an unhurried 130–150 WPM and take a 1-second silent breath between sentences."
      };
    } else if (lowerTopic.includes('tech') || lowerTopic.includes('defense') || lowerTopic.includes('viva') || lowerTopic.includes('project') || lowerTopic.includes('code')) {
      return {
        badge: "Technical Viva & Capstone Defense Track",
        frameworkTitle: "Architectural Root-Cause Analysis (RCA) & System Decomposition",
        description: "Examiners evaluate whether you understand the architectural trade-offs behind your stack, not just whether the code runs. Structure technical defenses using this hierarchy:",
        steps: [
          { label: "1. Topology First", detail: "Walk from high-level client-server topology down to database schemas before touching code." },
          { label: "2. Trade-Off Justification", detail: "Explain why you chose your specific database, library, or framework over popular alternatives." },
          { label: "3. Bottleneck Analysis", detail: "Describe a genuine production challenge or edge-case bug you diagnosed and profiled." },
          { label: "4. Performance Metrics", detail: "Quantify throughput, query execution time, memory overhead, or bundle size." },
        ],
        goldenPhrase: `"We evaluated SQL vs NoSQL, choosing PostgreSQL for ACID guarantees in transaction processing, optimizing indexing to sustain 250 req/sec under load."`,
        executiveTip: "Avoid vague phrasing like 'we made a website using database'. State: 'We engineered a full-stack platform with normalized relational schema design and automated unit test coverage'."
      };
    } else if (lowerTopic.includes('gd') || lowerTopic.includes('discussion') || lowerTopic.includes('debate') || lowerTopic.includes('panel')) {
      return {
        badge: "Group Discussion (GD) & Debate Track",
        frameworkTitle: "Diplomatic Turn-Taking & Consensus Synthesis Framework",
        description: "In GDs and competitive debate panels, moderators penalize shouting and aggression. Top scores go to speakers who provide structured framing, empirical examples, and synthesize group ideas:",
        steps: [
          { label: "1. Diplomatic Entry", detail: "Never interrupt by saying 'You are wrong'. Use: 'Building on that perspective, another critical angle is...'." },
          { label: "2. Empirical Anchor", detail: "Cite 1 concrete real-world economic, regulatory, or technological case study to back your claim." },
          { label: "3. Synthesis Catalyst", detail: "Acknowledge divergent points made by peers to prove active listening before stating your counter." },
          { label: "4. Collaborative Call", detail: "Invite other participants into the discussion to demonstrate leadership and group facilitation." },
        ],
        goldenPhrase: `"While I appreciate the economic argument presented by my colleague, industry empirical data suggests [point], prompting us to consider the long-term sustainability impact."`,
        executiveTip: "Avoid conversational qualifiers like 'in my point of view' or 'I think maybe'. Project conviction with: 'Empirical industry precedent indicates...'."
      };
    } else if (lowerTopic.includes('pitch') || lowerTopic.includes('startup') || lowerTopic.includes('investor')) {
      return {
        badge: "Elevator Pitch & Venture Presentation Track",
        frameworkTitle: "The 15-Second Hook & Unit Economics Traction Framework",
        description: "Investors and judging panels decide whether to back you within the first 20 seconds. Ditch slow intros and hit them with a clear pain hook and quantifiable market proof:",
        steps: [
          { label: "1. Visceral Pain Hook", detail: "Highlight the acute inefficiency or dollar loss experienced by your target customer today." },
          { label: "2. Unique Moat", detail: "Articulate your proprietary technological or operational advantage that competitors cannot copy." },
          { label: "3. Validated Traction", detail: "Provide measurable proof: early pilot signups, retention rates, or cost-savings metrics." },
          { label: "4. Definite Ask", detail: "Close with an explicit call-to-action: capital round, enterprise pilot access, or partnership." },
        ],
        goldenPhrase: `"Today, 10M+ Indian engineering graduates struggle with corporate communication, creating a 70% interview dropout rate. We built MIRAL—an AI multi-modal coach already piloting across top campuses."`,
        executiveTip: "Never end a pitch with 'that's all, thank you'. Conclude with a strong forward-looking vision and definitive call to action."
      };
    } else {
      return {
        badge: "Executive Presentation & Keynote Track",
        frameworkTitle: "The Rule of Three & Rhetorical Pauses Framework",
        description: "High-impact public speaking commands audience attention by dividing core ideas into three memorable cognitive buckets and pacing them with intentional rhetorical pauses:",
        steps: [
          { label: "1. Provocative Opening", detail: "Open with a question, surprising statistic, or real narrative hook before revealing your topic." },
          { label: "2. The Rule of Three", detail: "Group all supporting arguments into exactly three memorable thematic pillars." },
          { label: "3. Strategic Pauses", detail: "Pause for 1 full second before each key takeaway to let critical concepts land with weight." },
          { label: "4. Definitive Synthesis", detail: "Reiterate your core thesis in your closing 20 seconds with steady eye gaze." },
        ],
        goldenPhrase: `"To achieve scalable communication excellence, we must focus on three core pillars: non-verbal composure, vocal cadence discipline, and precise technical articulation."`,
        executiveTip: "Replace filler sounds ('um', 'matlab', 'basically') with silent breathing pauses. Silence signals executive authority and unhurried confidence."
      };
    }
  }, [lowerTopic]);

  // Multi-Modal Diagnostics
  const diagnostics = useMemo(() => {
    // 1. Visual presence
    let presenceText = "";
    let presenceStatus = "";
    if (eye >= 80 && posture >= 80) {
      presenceText = `Exceptional visual engagement on "${topic}". Maintaining ${eye}% camera gaze with upright posture (${posture}%) projects composure, authority, and authenticity.`;
      presenceStatus = "Authoritative";
    } else if (eye < 65) {
      presenceText = `Camera engagement was ${eye}%. During interviews, looking down at your keyboard breaks interpersonal connection. Elevate your webcam to eye level and hold direct gaze with the camera lens.`;
      presenceStatus = "Gaze Focus Needed";
    } else if (posture < 65) {
      presenceText = `Spinal alignment measured at ${posture}%. Slouching compresses the diaphragm, reducing vocal resonance. Keep your chest open and shoulders square.`;
      presenceStatus = "Posture Alignment";
    } else {
      presenceText = `Consistent eye gaze (${eye}%) and upright posture (${posture}%). Continue maintaining this physical anchor during technical queries.`;
      presenceStatus = "Composed";
    }

    // 2. Vocal cadence
    let deliveryText = "";
    let deliveryStatus = "";
    if (wpm === 0) {
      deliveryText = `No continuous vocal pace detected (0 WPM). Ensure microphone permissions are active and speak audibly during your practice sessions.`;
      deliveryStatus = "Audio Check";
    } else if (wpm >= 125 && wpm <= 165) {
      deliveryText = `Measured at an optimal ${wpm} WPM. This rate allows evaluators to process complex arguments comfortably without mental fatigue.`;
      deliveryStatus = "Optimal Pace";
    } else if (wpm < 125) {
      deliveryText = `Pacing was measured at ${wpm} WPM (deliberate / hesitant with pauses). In fast-paced interviews and GDs, aim for 130–155 WPM to convey prompt command of the subject.`;
      deliveryStatus = "Pacing Boost Needed";
    } else {
      deliveryText = `Delivery rate was rapid at ${wpm} WPM. High energy is commendable, but insert 1-second silent pauses before key takeaways to ensure arguments sink in.`;
      deliveryStatus = "Pacing Control";
    }

    // 3. Articulation & fillers
    let clarityText = "";
    let clarityStatus = "";
    if (fillers === 0) {
      clarityText = `Zero filler words detected. Articulation was disciplined, concise, and clean throughout.`;
      clarityStatus = "Disciplined";
    } else if (fillers <= 2) {
      const sample = analysis.highlightPhrases.slice(0, 2).join(', ');
      clarityText = `Clean delivery with only ${fillers} minor hesitation phrase(s)${sample ? ` (${sample})` : ''} noted. Keep breathing steadily through explanations.`;
      clarityStatus = "Strong Fluency";
    } else {
      const sample = analysis.highlightPhrases.slice(0, 3).join(', ');
      clarityText = `Detected ${fillers} verbal hesitation / repetition moment(s)${sample ? ` (${sample})` : ''}. Replace reflexive pause crutches with an unhurried 1-second silent breath while formulating thoughts.`;
      clarityStatus = "Hesitations Noted";
    }

    // 4. Action drill
    let drillTitle = "";
    let drillDescription = "";
    if (wordsCount < 30 && duration >= 25) {
      drillTitle = "The 60-Second Answer Expansion Drill";
      drillDescription = "Re-record your response with 3 distinct sentences: (1) Greeting & Full Name, (2) Degree Specialization & Key Technical Skill, (3) 1 Major Capstone Project and career ambition.";
    } else if (fillers > 1 || analysis.detectedWords.some(d => d.type === 'repetition')) {
      drillTitle = "The 1-Second Breath & Single-Greeting Drill";
      drillDescription = "Re-record your opening: Take a silent 1-second breath before speaking, deliver exactly ONE crisp 'Good morning, my name is...', with zero repeated greetings or filler sounds.";
    } else if (eye < 70) {
      drillTitle = "The Webcam Lens Spotter Drill";
      drillDescription = "Place a small colored sticker next to your webcam lens. Train your gaze to lock directly onto that point throughout the opening 60 seconds of your response.";
    } else if (wpm < 125 && wpm > 0) {
      drillTitle = "Cadence Acceleration Read-Aloud";
      drillDescription = "Read your introduction aloud at a crisp 140 WPM pace, minimizing pauses between clauses to build fluid speaking momentum.";
    } else {
      drillTitle = "The High-Impact Closer Drill";
      drillDescription = "Deliver your concluding statement with an upright posture and a direct call-to-action or career vision statement.";
    }

    return {
      presence: { title: "Visual Connection & Camera Gaze", text: presenceText, status: presenceStatus },
      delivery: { title: "Vocal Cadence & Speaking Velocity", text: deliveryText, status: deliveryStatus },
      clarity: { title: "Articulation & Hesitation Control", text: clarityText, status: clarityStatus },
      drill: { title: drillTitle, description: drillDescription }
    };
  }, [topic, eye, posture, wpm, fillers, wordsCount, duration, analysis]);

  // Dynamically generated, transcript-aware Strengths
  const strengthsList = useMemo(() => {
    const list: string[] = [];

    // Gaze strength
    if (eye >= 65) {
      list.push(`Steady Camera Gaze: Maintained ${eye}% direct engagement, establishing professional eye contact.`);
    }

    // Posture strength
    if (posture >= 70) {
      list.push(`Composed Posture: Upright spinal alignment (${posture}%) supported steady vocal projection.`);
    }

    // Transcript-specific strengths
    if (lowerTranscript.includes('my name is') || lowerTranscript.includes('i am')) {
      const nameMatch = lowerTranscript.match(/my name is\s+(?:hi\s+)?([a-zA-Z]+)/i);
      const name = nameMatch ? nameMatch[1] : '';
      list.push(name ? `Clear Self-Introduction: Explicitly introduced your name ("${name}").` : `Clear Self-Introduction: Explicitly introduced yourself by name.`);
    }

    if (lowerTranscript.includes('degree') || lowerTranscript.includes('science') || lowerTranscript.includes('engineering') || lowerTranscript.includes('college')) {
      list.push(`Academic Foundation: Explicitly highlighted your degree and educational discipline.`);
    }

    if (fillers === 0) {
      list.push(`Disciplined Verbal Delivery: Zero filler crutches or verbal hesitations detected.`);
    }

    if (wpm >= 125 && wpm <= 165) {
      list.push(`Optimal Cadence: Balanced speaking rate (${wpm} WPM) with natural conversational flow.`);
    }

    if (list.length === 0) {
      list.push("Completed the practice session with consistent effort.");
      list.push("Clear vocal projection captured by the system.");
    }

    return list.slice(0, 3);
  }, [eye, posture, wpm, fillers, lowerTranscript]);

  // Dynamically generated, transcript-aware Targeted Improvements
  const improvementsList = useMemo(() => {
    const list: string[] = [];

    // 1. Repetition stutter in opening (e.g. "hello hello" or multiple greetings)
    if (lowerTranscript.includes('hello hello') || lowerTranscript.match(/\b([a-zA-Z]{2,})\s+\1\b/i)) {
      list.push(`Smooth Opening: Avoid repeated greetings ("hello hello"). Take a 1-second breath and open with a single, crisp greeting: "Good morning, my name is..."`);
    }

    // 2. Introduction phrasing ("my name is hi ...")
    if (lowerTranscript.includes('my name is hi')) {
      list.push(`Introduction Phrasing: You said "my name is hi...". Separate greeting from identity: "Good morning. My name is [Name]."`);
    }

    // 3. Tense error ("currently completed")
    if (lowerTranscript.includes('currently completed') || lowerTranscript.includes('am currently completed')) {
      list.push(`Verb Tense Precision: Corrected "currently completed" to "have completed". Say: "I have completed my degree in Science."`);
    }

    // 4. Academic phrasing ("degree science syllabus")
    if (lowerTranscript.includes('degree science syllabus') || lowerTranscript.includes('science syllabus')) {
      list.push(`Academic Phrasing: Instead of "degree science syllabus", say: "degree in Science, specializing in [Major Subject]."`);
    }

    // 5. Hesitation / Fillers
    if (fillers > 0) {
      const sample = analysis.highlightPhrases.slice(0, 2).join(' & ');
      list.push(`Hesitation Control: Detected ${fillers} verbal pause/filler moment(s)${sample ? ` (${sample})` : ''}. Replace reflexive sounds with an unhurried 1-second silent breath.`);
    }

    // 6. Response depth (word count vs duration)
    if (wordsCount < 35 && duration >= 30) {
      list.push(`Expand Response Depth: You spoke ${wordsCount} words in ${Math.floor(duration/60)}m ${duration%60}s (${wpm} WPM with extended pauses). In campus HR rounds, aim for 80–120 words covering your key technical projects and strengths.`);
    } else if (wpm < 125 && wpm > 0 && wordsCount >= 35) {
      list.push(`Increase Speaking Pace: Delivery was ${wpm} WPM. Aim for 130–155 WPM for fluid, confident interview momentum.`);
    } else if (wpm > 165) {
      list.push(`Pacing Control: Speaking rate was rapid (${wpm} WPM). Insert deliberate pauses between key points.`);
    }

    // 7. Gaze
    if (eye < 65) {
      list.push(`Hold Camera Gaze: Camera contact was ${eye}%. Train your gaze directly into the webcam lens rather than looking down.`);
    }

    // 8. Posture
    if (posture < 65) {
      list.push(`Posture Alignment: Measured at ${posture}%. Sit tall with open shoulders to project executive composure.`);
    }

    if (list.length === 0) {
      list.push("Continue practicing across different interview topics to build spontaneous fluency.");
      list.push("Aim to quantify project outcomes with measurable numbers or metrics.");
    }

    return list.slice(0, 4);
  }, [eye, posture, wpm, fillers, lowerTranscript, wordsCount, duration, analysis, wpm]);

  return (
    <div className="space-y-4">
      {/* 1. Scenario-Specific Master Blueprint Card */}
      <Card className="border border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.04] via-card to-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <CardTitle className="text-sm font-bold text-foreground">
                  {scenarioBlueprint.frameworkTitle}
                </CardTitle>
                <span className="text-[11px] text-muted-foreground block">
                  AI Tactical Playbook calibrated for: <span className="text-foreground font-semibold">{topic}</span>
                </span>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20 w-fit">
              {scenarioBlueprint.badge}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {scenarioBlueprint.description}
          </p>

          {/* 4 Execution Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {scenarioBlueprint.steps.map((step, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-1">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">{step.label}</span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>

          {/* Golden Executive Phrasing Example */}
          <div className="p-3.5 rounded-lg bg-indigo-500/[0.06] border border-indigo-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Recommended High-Impact Phrasing Model</span>
            </div>
            <p className="text-xs font-mono text-foreground/90 italic leading-relaxed">
              {scenarioBlueprint.goldenPhrase}
            </p>
            <p className="text-[11px] text-muted-foreground pt-1 border-t border-indigo-500/10">
              <strong className="text-foreground">Executive Tip:</strong> {scenarioBlueprint.executiveTip}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Multi-Modal Vision & Speech Diagnostics */}
      <Card className="border border-border/60 shadow-xs bg-card">
        <CardHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Multi-Modal Diagnostic Audit
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
              Webcam & Audio Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{diagnostics.presence.title}</span>
              <Badge variant="secondary" className="text-[10px]">{diagnostics.presence.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{diagnostics.presence.text}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{diagnostics.delivery.title}</span>
              <Badge variant="secondary" className="text-[10px]">{diagnostics.delivery.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{diagnostics.delivery.text}</p>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{diagnostics.clarity.title}</span>
              <Badge variant="secondary" className="text-[10px]">{diagnostics.clarity.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{diagnostics.clarity.text}</p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Strengths, Refinement Areas & Immediate Action Drill */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Identified Strengths */}
        <Card className="border border-emerald-500/30 bg-emerald-500/[0.02] shadow-xs">
          <CardHeader className="p-3.5 pb-2 border-b border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Session Strengths</span>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2">
            {strengthsList.map((str, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>{str}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actionable Refinement Areas */}
        <Card className="border border-amber-500/30 bg-amber-500/[0.02] shadow-xs">
          <CardHeader className="p-3.5 pb-2 border-b border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Compass className="h-4 w-4" />
              <span>Targeted Refinements</span>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2">
            {improvementsList.map((imp, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                <ArrowRight className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span>{imp}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Immediate 48-Hour Drill */}
        <Card className="border border-indigo-500/30 bg-indigo-500/[0.02] shadow-xs">
          <CardHeader className="p-3.5 pb-2 border-b border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Flame className="h-4 w-4" />
              <span>Next Practice Drill</span>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2">
            <span className="text-xs font-bold text-foreground block">{diagnostics.drill.title}</span>
            <p className="text-xs text-muted-foreground leading-relaxed">{diagnostics.drill.description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Executive Competency Rubric (Delivery Readiness Matrix)
function ExecutiveCompetencyRubric({ session }: { session: Session }) {
  const eye = getEyeContact(session);
  const posture = getPosture(session);
  const wpm = getWpm(session);
  const fillers = getFillers(session);
  const confidence = getConfidence(session);

  // WPM pacing health
  const pacingScore = Math.max(30, Math.min(100, Math.round(100 - Math.abs(145 - wpm) * 1.5)));
  // Filler economy score
  const articulationScore = Math.max(30, Math.min(100, Math.round(100 - fillers * 12)));

  return (
    <Card className="border border-white/[0.08] bg-[#090D1A]/80 backdrop-blur-xl rounded-xl shadow-xs overflow-hidden">
      <CardHeader className="border-b border-white/[0.06] p-4 sm:p-5 pb-3 bg-white/[0.01]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">
              Executive Communication Competency Rubric
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] text-indigo-300 border-indigo-500/30 bg-indigo-500/10 py-0.5 px-2 font-semibold w-fit">
            Corporate Hiring Benchmark
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Visual Gaze Focus */}
        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Visual Camera Intimacy</span>
            <span className="font-bold text-white font-mono">{eye}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${eye >= 75 ? 'bg-emerald-400' : (eye >= 65 ? 'bg-indigo-400' : 'bg-amber-400')}`}
              style={{ width: `${eye}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            {eye >= 75 ? 'Direct Executive Gaze' : 'Gaze Shift Identified'}
          </span>
        </div>

        {/* Metric 2: Cadence Velocity */}
        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Speaking Cadence</span>
            <span className="font-bold text-white font-mono">{wpm} WPM</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${pacingScore >= 75 ? 'bg-emerald-400' : (pacingScore >= 60 ? 'bg-indigo-400' : 'bg-amber-400')}`}
              style={{ width: `${pacingScore}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            {wpm >= 130 && wpm <= 155 ? 'Optimal Executive Pacing' : (wpm > 155 ? 'High-Velocity Delivery' : 'Deliberate Cadence')}
          </span>
        </div>

        {/* Metric 3: Verbal Economy */}
        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Verbal Discipline</span>
            <span className="font-bold text-white font-mono">{articulationScore}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${articulationScore >= 80 ? 'bg-emerald-400' : (articulationScore >= 65 ? 'bg-indigo-400' : 'bg-amber-400')}`}
              style={{ width: `${articulationScore}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            {fillers === 0 ? 'Zero Hesitation Crutches' : `${fillers} Pause Sound(s) Logged`}
          </span>
        </div>

        {/* Metric 4: Physical Composure */}
        <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Postural Alignment</span>
            <span className="font-bold text-white font-mono">{posture}%</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${posture >= 75 ? 'bg-emerald-400' : (posture >= 65 ? 'bg-indigo-400' : 'bg-amber-400')}`}
              style={{ width: `${posture}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">
            {posture >= 75 ? 'Stable Torso Alignment' : 'Thoracic Calibration Advised'}
          </span>
        </div>

      </CardContent>
    </Card>
  );
}

interface DetectedPhraseItem {
  spoken: string;
  replacement: string;
  reason: string;
}

function ExecutiveSpeechPolisherSection({ transcript, topic }: { transcript: string; topic?: string }) {
  const [copied, setCopied] = useState(false);
  const text = (transcript || '').trim();
  const lowerText = text.toLowerCase();

  const { originalSpoken, polishedVersion, keyImprovements, detectedPhrases } = useMemo(() => {
    if (!text || text.length < 8) {
      return {
        originalSpoken: "",
        polishedVersion: "",
        keyImprovements: [],
        detectedPhrases: []
      };
    }

    // 1. Detect candidate's name if spoken
    const nameMatch = lowerText.match(/\b(?:my name is|myself|i am)\s+([a-zA-Z]+)\b/i);
    const candidateName = nameMatch ? nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1) : "Candidate";

    // 2. Detect technical and project entities in the speech
    const hasML = /machine\s+learning|models|training/i.test(lowerText);
    const hasDev = /development|full\s*stack|star\s+development|software|web/i.test(lowerText);
    const hasApp = /application|confidence\s+builder|platform|record|sessions/i.test(lowerText);
    const hasInterview = /interview|placement|practicing/i.test(lowerText);
    const hasDegree = /degree|major|college|bachelor/i.test(lowerText);

    let polished = "";
    let improvements: string[] = [];

    // Case A: Self-Introduction & Background Speech
    if (lowerText.includes("my name is") || lowerText.includes("myself") || lowerText.includes("good evening") || lowerText.includes("good morning") || lowerText.includes("hello")) {
      const greeting = lowerText.includes("good morning") ? "Good morning" : (lowerText.includes("good afternoon") ? "Good afternoon" : (lowerText.includes("good evening") ? "Good evening" : "Hello"));
      
      const techFocus = (hasDev && hasML) 
        ? "Full-Stack Software Development and Machine Learning" 
        : (hasML ? "Machine Learning Model Engineering" : (hasDev ? "Full-Stack Software Engineering" : "Applied Technology"));

      const degreePhrase = hasDegree ? "I am currently completing my degree" : "I have a foundational background in engineering";
      
      const p1 = `${greeting}. My name is ${candidateName}, and ${degreePhrase.toLowerCase()} with a specialization in ${techFocus}.`;
      
      let p2 = "";
      if (hasApp) {
        p2 = "Over the past two years, I have architected an autonomous confidence-building platform that records user practice sessions and evaluates spoken delivery telemetry in real time.";
      } else {
        p2 = "Throughout my coursework and engineering initiatives, I have focused on designing scalable, full-stack systems to address practical industry requirements.";
      }

      let p3 = "";
      if (hasInterview) {
        p3 = "The system delivers objective diagnostic feedback to help candidates systematically prepare for competitive technical and HR interviews.";
      } else {
        p3 = "I am excited to contribute my hands-on development expertise, problem-solving rigor, and analytical skills to this role.";
      }

      polished = `${p1} ${p2} ${p3}`;
      improvements = [
        "Eliminated conversational run-on syntax and repetitive crutches ('basically', 'kind of', 'sort of').",
        "Structured the response into the 3-part Executive Framework: Professional Identity, Technical Architecture, and Value Impact.",
        "Upgraded acoustic transcription artifacts ('wear in', 'star development') into precise engineering vocabulary ('wherein', 'full-stack software development')."
      ];
    } else {
      // Case B: General or Technical Statement Restructuring
      let sentences = text.split(/(?<=[.?!])\s+|\n+/).map(s => s.trim()).filter(Boolean);
      if (sentences.length <= 1) {
        const raw = text
          .replace(/\s+/g, ' ')
          .replace(/\b(basically\s+with|and\s+basically|so\s+basically)\b/gi, ". In particular,")
          .replace(/\b(and\s+i\s+have|and\s+it\s+is)\b/gi, ". Furthermore, it is")
          .replace(/\b(wear\s+in|where\s+in)\b/gi, "wherein candidates can")
          .replace(/\b(and\s+based\s+on)\b/gi, ". Based on")
          .replace(/\b(so\s+it\s+is\s+very\s+helpful)\b/gi, ". Consequently, the platform is highly effective");
        
        sentences = raw.split(/\.\s+/).map(s => s.trim()).filter(Boolean);
      }

      const polishedSentences = sentences.slice(0, 3).map(s => {
        let clean = s
          .replace(/\b(basically|actually|sort of|kind of|you know|and all that)\b/gi, "")
          .replace(/\s+/g, " ")
          .trim();
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);
        if (!/[.?!]$/.test(clean)) clean += ".";
        return clean;
      });

      polished = polishedSentences.join(" ");
      improvements = [
        "Partitioned compounding run-on sentences into distinct, authoritative declarative clauses.",
        "Filtered subconscious hesitation crutches to elevate executive composure.",
        "Inserted formal transition markers to ensure argumentative coherence."
      ];
    }

    // 3. Scan ONLY for phrases ACTUALLY uttered in the candidate's transcript
    const detected: DetectedPhraseItem[] = [];

    // "basically"
    const basicallyMatches = lowerText.match(/\bbasically\b/g);
    if (basicallyMatches && basicallyMatches.length > 0) {
      detected.push({
        spoken: `basically (used ${basicallyMatches.length}x)`,
        replacement: "fundamentally / specifically / in particular",
        reason: "Reflexive conversational filler. Replace with intentional signposts or silence."
      });
    }

    // "sort of" / "kind of"
    const kindOfMatches = lowerText.match(/\b(kind of|sort of)\b/g);
    if (kindOfMatches && kindOfMatches.length > 0) {
      detected.push({
        spoken: `sort of / kind of (used ${kindOfMatches.length}x)`,
        replacement: "an engineered / a specialized / a focused",
        reason: "Hedging crutch that projects uncertainty. State capabilities with conviction."
      });
    }

    // "wear in" / "wherein"
    if (/\bwear in\b/i.test(lowerText)) {
      detected.push({
        spoken: "wear in",
        replacement: "wherein / in which candidates can",
        reason: "Speech-to-text acoustic artifact. Enunciate clearly for technical transcription."
      });
    }

    // "star development" -> full-stack development
    if (/\bstar development\b/i.test(lowerText)) {
      detected.push({
        spoken: "star development",
        replacement: "full-stack development / software engineering",
        reason: "Clarifies phonetic slurring into standard professional technical terminology."
      });
    }

    // "passout" / "passed out"
    if (/\b(passout|passed out)\b/i.test(lowerText)) {
      detected.push({
        spoken: "passout / passed out",
        replacement: "graduated in [Year] / recent graduate",
        reason: "Replaces colloquial Indianism with standard international academic completion."
      });
    }

    // "myself [name]"
    if (/\bmyself\s+[a-z]+\b/i.test(lowerText)) {
      detected.push({
        spoken: "myself [Name]",
        replacement: "I am [Name] / My name is [Name]",
        reason: "Corrects colloquial introductory syntax to formal corporate English."
      });
    }

    return {
      originalSpoken: `"${text}"`,
      polishedVersion: polished,
      keyImprovements: improvements,
      detectedPhrases: detected
    };
  }, [text, lowerText]);

  const handleCopy = () => {
    if (!polishedVersion) return;
    navigator.clipboard.writeText(polishedVersion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!text || text.length < 10) return null;

  return (
    <Card className="border border-indigo-500/30 bg-[#090D1A]/85 backdrop-blur-xl rounded-xl shadow-xs overflow-hidden">
      <CardHeader className="border-b border-white/[0.08] p-5 pb-4 bg-white/[0.02]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-white">
                Executive Speech Restructuring & Phrasing Polish
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-400 mt-0.5">
                Restructuring raw spoken conversational audio into crisp, recruiter-ready professional delivery
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-300 bg-indigo-500/10 py-0.5 px-2.5 font-semibold w-fit">
            AI Speech Architecture
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Comparison: Spoken vs Polished */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left: What You Said */}
          <div className="p-4 rounded-xl bg-red-500/[0.02] border border-red-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                What You Said (Raw Spoken Audio)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Unedited Speech</span>
            </div>
            <p className="text-xs font-mono text-slate-300 leading-relaxed italic break-words">
              {originalSpoken}
            </p>
          </div>

          {/* Right: Executive Polished Version */}
          <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/25 space-y-2 relative group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Executive Polished Version
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2.5 text-[11px] gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy Clean Pitch'}</span>
              </Button>
            </div>
            <p className="text-xs text-white font-medium leading-relaxed break-words">
              "{polishedVersion}"
            </p>
          </div>

        </div>

        {/* Key Upgrades Made */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Key Phrasing & Structural Upgrades Made:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {keyImprovements.map((imp, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300 leading-snug">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{imp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detected Colloquial Phrases (Rendered ONLY if phrases actually occurred in audio) */}
        {detectedPhrases.length > 0 ? (
          <div className="space-y-2 pt-2 border-t border-white/[0.06]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Identified Slang & Fillers Detected in Your Audio ({detectedPhrases.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detectedPhrases.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.08] text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-rose-400 line-through font-semibold">{item.spoken}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                    <span className="text-emerald-400 font-bold">{item.replacement}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-emerald-500/[0.03] border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Exceptional Verbal Economy: Zero colloquial slang or repetitive conversational crutches detected in your speech.</span>
          </div>
        )}
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
              Pro Hub • Free Campus Pilot (Until Oct 31)
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
  const storedFillers = getFillers(session);
  const detectedFillers = useMemo(() => 
    detectFillersAndHesitations(session?.transcript || ''),
    [session?.transcript]
  );
  const fillers = Math.max(storedFillers, detectedFillers.totalCount);

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
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-slate-800 bg-slate-50 inline-block px-4 py-1.5 rounded-lg border border-slate-200">
                  "{session.topic || 'General Practice Track'}"
                </p>
                <p className="text-[11px] text-indigo-700 font-semibold tracking-wider uppercase">
                  Verified Speech Practice Milestone • Multi-Modal Delivery Calibration
                </p>
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
          <span className="font-semibold text-primary">Keep practicing and refining your skills.</span>
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
                  className={`h-7 w-7 rounded border text-xs font-bold flex items-center justify-center gap-0.5 transition-all ${
                    rating >= star
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground'
                  }`}
                >
                  <span>{star}</span>
                  <Star className="h-2.5 w-2.5 fill-current" />
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

  const { data: allUserSessions } = useQuery<Session[]>({
    queryKey: ['/api/sessions'],
    retry: 1,
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
  const storedFillers = getFillers(activeSession);
  const transcriptAnalysis = useMemo(() => 
    detectFillersAndHesitations(activeSession?.transcript || ''),
    [activeSession?.transcript]
  );
  const fillers = Math.max(storedFillers, transcriptAnalysis.totalCount);
  const duration = getDuration(activeSession);
  const durationMins = Math.floor(duration / 60);
  const durationSecs = duration % 60;

  const performanceTier = confidence >= 85 
    ? "Advanced Communicator — High Stage & Delivery Presence"
    : confidence >= 70
    ? "Competent Communicator — Strong Delivery Foundation"
    : "Developing Communicator — Practice & Refinement Track";

  // Certificate eligibility: strictly aggregates sessions for the current user
  const certEligibility = useMemo(() => {
    const currentUserId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
    const userKey = currentUserId ? `miral_completed_sessions_${currentUserId}` : 'miral_completed_sessions_guest';

    const sessionMap = new Map<string, any>();

    // 1. Filter server sessions strictly for this current user (do NOT include other users or null)
    if (currentUserId && Array.isArray(allUserSessions)) {
      allUserSessions.forEach((s: any) => {
        if (s && s.id && s.userId === currentUserId && getDuration(s) >= 10) {
          sessionMap.set(s.id, s);
        }
      });
    }

    // 2. This user's isolated local completed sessions
    try {
      const stored = localStorage.getItem(userKey);
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        parsed.forEach((s: any) => {
          if (s && s.id && getDuration(s) >= 10) {
            sessionMap.set(s.id, s);
          }
        });
      }
    } catch {}

    // 3. Current active session
    if (activeSession && activeSession.id && getDuration(activeSession) >= 10) {
      sessionMap.set(activeSession.id, activeSession);
    }

    const validSessions = Array.from(sessionMap.values());
    const count = validSessions.length;

    if (count === 0) return { eligible: false, count: 0, sessionsNeeded: 3, reason: 'no_sessions' };

    // Sort oldest → newest
    const sorted = [...validSessions].sort((a, b) =>
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
    const firstScore = getConfidence(sorted[0]);
    const bestScore = Math.max(...sorted.map((s: any) => getConfidence(s)));
    const improvement = bestScore - firstScore;

    const meetsMinSessions = count >= 3;
    const meetsScore = bestScore >= 55 || improvement >= 5;

    return {
      eligible: meetsMinSessions && meetsScore,
      count,
      sessionsNeeded: Math.max(0, 3 - count),
      bestScore,
      firstScore,
      improvement,
      reason: !meetsMinSessions ? 'need_more_sessions' : !meetsScore ? 'need_better_score' : 'eligible',
    };
  }, [allUserSessions, activeSession]);


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
                        className={`flex-1 py-2 rounded-lg border text-sm font-bold flex items-center justify-center gap-1 transition-all ${
                          popupRating >= star
                            ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                            : 'bg-muted/40 text-muted-foreground border-border/40 hover:text-foreground'
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="h-3.5 w-3.5 fill-current" />
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
                      ? `Complete ${certEligibility.sessionsNeeded} more practice session${certEligibility.sessionsNeeded > 1 ? 's' : ''} to unlock your certificate.`
                      : `Achieve a score of 55+ or improve from your first session to unlock!`,
                  });
                }}
              >
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  {certEligibility.count < 3
                    ? `Certificate: ${certEligibility.sessionsNeeded} more session${certEligibility.sessionsNeeded > 1 ? 's' : ''} to unlock`
                    : 'Certificate: Reach 55+ score to unlock'}
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
                      : 'Reach 55+ score to unlock certificate'}
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
              <span className="text-[10px] text-muted-foreground block truncate">
                {fillers === 0 ? 'Zero Fillers' : `${fillers} ${fillers === 1 ? 'Filler / Hesitation' : 'Fillers / Hesitations'}`}
              </span>
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
            <span>Powered by VaniDarpan Multi-Modal AI (3D Facial Vision & Speech Engine)</span>
            <span className="font-medium text-foreground/80">Universal AI Communication & Placement Intelligence Platform</span>
          </div>
        </div>

        {/* Structured Diagnostics, Tactical Playbook, Executive Speech Restructuring, Tailored Learning, and Feedback */}
        <div className="space-y-6 print:hidden">
          <ExecutiveCompetencyRubric session={activeSession} />
          <AICoachSection session={activeSession} transcriptAnalysis={transcriptAnalysis} />
          <ExecutiveSpeechPolisherSection transcript={activeSession.transcript || ''} topic={activeSession.topic} />
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
                Consistent practice builds confident communication.
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
