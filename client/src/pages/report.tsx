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

interface AICoachSectionProps {
  session: Session;
}

function AICoachSection({ session }: AICoachSectionProps) {
  const topic = session.topic || 'General Speech Practice';
  const eye = getEyeContact(session);
  const posture = getPosture(session);
  const wpm = getWpm(session);
  const fillers = getFillers(session);
  const lowerTopic = topic.toLowerCase();

  // Scenario Strategic Master Blueprint
  const scenarioBlueprint = useMemo(() => {
    if (lowerTopic.includes('hr') || lowerTopic.includes('placement') || lowerTopic.includes('interview')) {
      return {
        badge: "Campus Placement & Technical HR Track",
        frameworkTitle: "The STAR Impact Architecture (Situation → Task → Action → Measurable Result)",
        description: "Hiring managers and panel interviewers look for structured problem ownership rather than generic claims. When answering behavioral and project questions, follow this exact progression:",
        steps: [
          { label: "1. Situation", detail: "Set the context in 1 concise sentence (academic capstone, internship, or system problem)." },
          { label: "2. Task", detail: "Specify the exact business bottleneck, technical deliverable, or constraint assigned to you." },
          { label: "3. Action", detail: "Describe your personal engineering choices, debug steps, and team collaboration." },
          { label: "4. Result", detail: "Conclude with quantified impact: latency decrease (%), users served, or reliability score." },
        ],
        goldenPhrase: `"When faced with [latency bottleneck], my core objective was to reduce response lag by 30%. I refactored the database schema and implemented asynchronous caching, achieving a 42% throughput gain."`,
        executiveTip: "Never begin introductions with 'Myself [Name]'. Open with: 'I am [Name], an engineer specializing in...'. Replace 'I worked hard' with 'I drove high execution rigor and technical ownership'."
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
    } else if (eye < 60) {
      presenceText = `Camera engagement was ${eye}%. During high-stakes interviews, looking down at your keyboard or screen breaks interpersonal connection. Elevate your webcam to eye level and hold direct gaze with the camera lens.`;
      presenceStatus = "Gaze Focus Needed";
    } else if (posture < 65) {
      presenceText = `Spinal alignment measured at ${posture}%. Slouching compresses the diaphragm, reducing vocal resonance. Keep your chest open and shoulders square.`;
      presenceStatus = "Posture Alignment";
    } else {
      presenceText = `Consistent eye gaze (${eye}%) and upright posture (${posture}%). Continue maintaining this physical anchor during complex technical queries.`;
      presenceStatus = "Composed";
    }

    // 2. Vocal cadence
    let deliveryText = "";
    let deliveryStatus = "";
    if (wpm === 0) {
      deliveryText = `No continuous vocal pace detected (0 WPM). Ensure microphone permissions are active and speak audibly during your practice sessions.`;
      deliveryStatus = "Audio Check";
    } else if (wpm >= 125 && wpm <= 165) {
      deliveryText = `Measured at an optimal ${wpm} WPM. This rate allows hiring managers and evaluators to process complex arguments without mental fatigue.`;
      deliveryStatus = "Optimal Pace";
    } else if (wpm < 125) {
      deliveryText = `Pacing was measured at ${wpm} WPM (deliberate / hesitant). In fast-paced interviews and GDs, aim for 130–155 WPM to convey command of the subject.`;
      deliveryStatus = "Pacing Boost Needed";
    } else {
      deliveryText = `Delivery rate was rapid at ${wpm} WPM. High energy is commendable, but insert 1-second silent pauses before key takeaways to ensure arguments sink in.`;
      deliveryStatus = "Pacing Control";
    }

    // 3. Articulation & fillers
    let clarityText = "";
    let clarityStatus = "";
    if (fillers === 0) {
      clarityText = `Zero filler words detected. Articulation was disciplined, concise, and clean.`;
      clarityStatus = "Disciplined";
    } else if (fillers <= 2) {
      clarityText = `Clean delivery with only ${fillers} filler phrase(s) noted. Keep breathing steadily through complex explanations.`;
      clarityStatus = "Strong Fluency";
    } else {
      clarityText = `Detected ${fillers} filler sounds/words ("um", "like", "basically", "matlab"). Replace reflexive filler sounds with an unhurried 1-second silent pause while thinking.`;
      clarityStatus = "Hesitations Noted";
    }

    // 4. Action drill
    let drillTitle = "";
    let drillDescription = "";
    if (fillers > 2) {
      drillTitle = "The 60-Second Silent Pause Drill";
      drillDescription = "Re-record your practice session with one strict constraint: whenever you need to formulate an idea, close your mouth and pause silently for 1 second. Zero 'um' or 'basically' allowed.";
    } else if (eye < 70) {
      drillTitle = "The Webcam Lens Spotter Drill";
      drillDescription = "Place a small colored dot next to your webcam lens. Train your gaze to lock directly onto that point throughout the opening 60 seconds of your response.";
    } else if (wpm < 125 && wpm > 0) {
      drillTitle = "Cadence Acceleration Read-Aloud";
      drillDescription = "Read your project summary aloud at a crisp 140 WPM pace, minimizing pauses between clauses to build fluid speaking momentum.";
    } else {
      drillTitle = "The STAR Impact Formulation Drill";
      drillDescription = "Practice delivering your primary technical project using the STAR structure in under 90 seconds, ending with a quantified performance metric.";
    }

    return {
      presence: { title: "Visual Connection & Camera Gaze", text: presenceText, status: presenceStatus },
      delivery: { title: "Vocal Cadence & Speaking Velocity", text: deliveryText, status: deliveryStatus },
      clarity: { title: "Articulation & Hesitation Control", text: clarityText, status: clarityStatus },
      drill: { title: drillTitle, description: drillDescription }
    };
  }, [topic, eye, posture, wpm, fillers]);

  const strengthsList = (session.strengths && session.strengths.length > 0) 
    ? session.strengths 
    : ["Maintained steady visual focus", "Clear vocal delivery throughout"];

  const improvementsList = (session.improvements && session.improvements.length > 0) 
    ? session.improvements 
    : ["Aim for steady 130-155 WPM speaking pace", "Eliminate filler words using silent pauses"];

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

interface UpgradeItem {
  from: string;
  to: string;
  explanation: string;
  category: 'intro' | 'hr' | 'esl' | 'tech' | 'gd' | 'general';
  isDetected: boolean;
  detectedContext?: string;
}

function VocabularyUpgradeSection({ transcript, topic }: { transcript: string; topic?: string }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const text = (transcript || '').trim();
  const lowerText = text.toLowerCase();
  const cleanTopic = (topic || '').toLowerCase();

  // Comprehensive 40+ Bank of Campus Slang, Indianisms, and Executive Phrasing
  const { allUpgrades, detectedUpgrades, spokenSentenceUpgrade } = useMemo(() => {
    const bank: Omit<UpgradeItem, 'isDetected' | 'detectedContext'>[] = [
      // 1. Introductions & Academic Background
      {
        from: "Myself [Name] / My name is...",
        to: "I am [Name], specializing in...",
        explanation: "Corrects colloquial intro phrasing to standard formal self-introduction.",
        category: "intro"
      },
      {
        from: "passout / passed out in 2024",
        to: "graduated in 2024 / recent graduate",
        explanation: "Replaces the Indianism 'passed out' (which means lost consciousness) with standard academic completion.",
        category: "intro"
      },
      {
        from: "fresher candidate",
        to: "early-career professional / aspiring engineer",
        explanation: "Elevates campus slang into international professional terminology.",
        category: "intro"
      },
      {
        from: "I have knowledge of / know about",
        to: "I have hands-on proficiency & specialized depth in",
        explanation: "Transforms passive bookish claims into active technical capability.",
        category: "intro"
      },
      {
        from: "belong to [city] / from [city] side",
        to: "I am based in [City] / Originally from [City]",
        explanation: "Eliminates literal translation phrasing ('belong to / side').",
        category: "intro"
      },
      {
        from: "did my schooling from",
        to: "completed my primary and secondary education at",
        explanation: "Standardizes colloquial academic timeline phrasing.",
        category: "intro"
      },
      {
        from: "my hobbies are / in free time",
        to: "Beyond my core pursuits, I actively cultivate",
        explanation: "Frames personal interests as disciplined, curious initiatives.",
        category: "intro"
      },
      {
        from: "in my college / during college days",
        to: "throughout my academic coursework & capstones",
        explanation: "Formalizes campus anecdotes into structured academic credentials.",
        category: "intro"
      },

      // 2. Common Indian English / ESL Colloquialisms
      {
        from: "cope up with",
        to: "adapt seamlessly to / manage effectively",
        explanation: "Corrects the common Indian ESL redundancy 'cope up with' (standard English is simply 'cope with').",
        category: "esl"
      },
      {
        from: "do the needful / doing the needful",
        to: "take the necessary measures / address the requirement",
        explanation: "Replaces archaic Victorian Indian English with contemporary executive clarity.",
        category: "esl"
      },
      {
        from: "prepone / preponed the meeting",
        to: "advance the timeline / reschedule earlier",
        explanation: "'Prepone' is an Indian English neologism rarely used in international corporate environments.",
        category: "esl"
      },
      {
        from: "revert back to you",
        to: "follow up with updates / reply promptly",
        explanation: "Eliminates the tautological redundancy ('revert' already means reply/return).",
        category: "esl"
      },
      {
        from: "I have a doubt / got a doubt",
        to: "I would appreciate clarification on / I have a question regarding",
        explanation: "Replaces expression of uncertainty ('doubt') with positive, inquiry-driven framing.",
        category: "esl"
      },
      {
        from: "tell about / discuss about",
        to: "walk through / analyze the details of",
        explanation: "Removes redundant preposition 'about' after transitive verbs ('discuss', 'tell').",
        category: "esl"
      },
      {
        from: "give an interview / give exam",
        to: "appear for an assessment / take an interview",
        explanation: "Replaces literal Hindi-to-English translation ('interview dena').",
        category: "esl"
      },
      {
        from: "out of station",
        to: "out of town / traveling away from the office",
        explanation: "Replaces Indian colonial bureaucratic term with standard corporate phrasing.",
        category: "esl"
      },
      {
        from: "explain me / explain to me",
        to: "walk me through / provide context on",
        explanation: "Corrects preposition omission and sounds more polished.",
        category: "esl"
      },
      {
        from: "pay attention on",
        to: "pay close attention to / prioritize",
        explanation: "Fixes incorrect preposition usage ('attention to', not 'attention on').",
        category: "esl"
      },
      {
        from: "comprise of",
        to: "comprises / consists of",
        explanation: "'Comprise' already includes 'of' ('comprises three modules' or 'consists of three modules').",
        category: "esl"
      },
      {
        from: "years back / 2 years back",
        to: "two years ago / in 2022",
        explanation: "Replaces colloquial 'years back' with standard 'years ago'.",
        category: "esl"
      },
      {
        from: "good only / fine only",
        to: "satisfactory / performing robustly",
        explanation: "Removes the habitual Indian English 'only' suffix crutch.",
        category: "esl"
      },
      {
        from: "same to same",
        to: "identical / consistent across instances",
        explanation: "Replaces conversational slang with formal corporate precision.",
        category: "esl"
      },
      {
        from: "one small issue is there",
        to: "we encountered an engineering constraint / edge case",
        explanation: "Frames problems with architectural maturity rather than casual hesitation.",
        category: "esl"
      },
      {
        from: "matlab / yaani / aur kya",
        to: "specifically / to clarify / fundamentally",
        explanation: "Replaces vernacular fillers with structured English transitions.",
        category: "esl"
      },
      {
        from: "actually / basically (overused)",
        to: "fundamentally / in essence / specifically",
        explanation: "Replaces reflexive conversational crutches with intentional signposts.",
        category: "esl"
      },
      {
        from: "and all that / and stuff",
        to: "and related auxiliary components",
        explanation: "Avoids conversational trailing-off at the end of technical explanations.",
        category: "esl"
      },

      // 3. Technical Viva & Capstone Defense
      {
        from: "made a project / our project is",
        to: "architected and deployed a capstone system designed to",
        explanation: "Conveys end-to-end system ownership rather than academic assignment submission.",
        category: "tech"
      },
      {
        from: "made a website / made an app",
        to: "engineered a full-stack responsive web platform",
        explanation: "Emphasizes software engineering lifecycle rigor.",
        category: "tech"
      },
      {
        from: "used database / stored data",
        to: "designed normalized schemas and indexed queries",
        explanation: "Demonstrates database design depth and query execution awareness.",
        category: "tech"
      },
      {
        from: "used api / connected api",
        to: "integrated asynchronous RESTful endpoints and stream handlers",
        explanation: "Demonstrates backend architectural clarity and asynchronous flow.",
        category: "tech"
      },
      {
        from: "fixed the bug / solved the error",
        to: "diagnosed root cause and deployed remediation patches",
        explanation: "Reflects professional debugging methodology and RCA discipline.",
        category: "tech"
      },
      {
        from: "it was slow / speed issue",
        to: "encountered compute latency bottlenecks under peak load",
        explanation: "Quantifies performance hurdles with industry standard terminology.",
        category: "tech"
      },
      {
        from: "tested it / checked it",
        to: "conducted unit testing and end-to-end regression validation",
        explanation: "Highlights software testing discipline and QA standards.",
        category: "tech"
      },

      // 4. Group Discussion (GD) & Debate Diplomacy
      {
        from: "I think / I feel that / maybe",
        to: "Empirical data indicates / From a strategic perspective",
        explanation: "Projects assertive conviction and evidence-backed reasoning.",
        category: "gd"
      },
      {
        from: "I agree with you / same point",
        to: "I concur with that assessment and would build upon it by",
        explanation: "Demonstrates active listening and constructive turn-taking.",
        category: "gd"
      },
      {
        from: "I don't agree / you are wrong",
        to: "I offer an alternative perspective considering...",
        explanation: "Maintains professional diplomacy and composure during heated discussions.",
        category: "gd"
      },
      {
        from: "pros and cons / good and bad",
        to: "strategic trade-offs and operational implications",
        explanation: "Elevates conversational speech to structured analytical framing.",
        category: "gd"
      },
      {
        from: "big problem / huge problem",
        to: "critical operational impediment / systemic bottleneck",
        explanation: "Frames challenges as objective problem statements.",
        category: "general"
      },
      {
        from: "lots of / so many things",
        to: "a substantial volume of / comprehensive suite of",
        explanation: "Elevates informal quantity to formal articulate vocabulary.",
        category: "general"
      },
      {
        from: "hardworking person / do hard work",
        to: "demonstrate high execution rigor and diligence",
        explanation: "Replaces generic buzzwords with measurable competencies.",
        category: "hr"
      },
      {
        from: "want this job / want to join",
        to: "am eager to drive strategic impact within your team",
        explanation: "Demonstrates mission alignment and value contribution.",
        category: "hr"
      }
    ];

    // Regex matchers for detection
    const patterns: { regex: RegExp; itemIndex: number }[] = [
      { regex: /\b(myself\s+[\w]+|my name is\s+[\w]+)\b/i, itemIndex: 0 },
      { regex: /\b(passout|passed out|pass out)\b/i, itemIndex: 1 },
      { regex: /\b(fresher|freshers)\b/i, itemIndex: 2 },
      { regex: /\b(knowledge of|know about|learned about)\b/i, itemIndex: 3 },
      { regex: /\b(belong to|from [\w]+ side)\b/i, itemIndex: 4 },
      { regex: /\b(did my schooling|schooling from)\b/i, itemIndex: 5 },
      { regex: /\b(my hobbies are|in my free time|in free time)\b/i, itemIndex: 6 },
      { regex: /\b(in my college|during my college|in college days)\b/i, itemIndex: 7 },
      { regex: /\b(cope up|cope up with)\b/i, itemIndex: 8 },
      { regex: /\b(do the needful|doing the needful)\b/i, itemIndex: 9 },
      { regex: /\b(prepone|preponed)\b/i, itemIndex: 10 },
      { regex: /\b(revert back|revert)\b/i, itemIndex: 11 },
      { regex: /\b(doubt|have a doubt|i have doubt)\b/i, itemIndex: 12 },
      { regex: /\b(tell about|explain about|discuss about)\b/i, itemIndex: 13 },
      { regex: /\b(give exam|give interview|giving interview)\b/i, itemIndex: 14 },
      { regex: /\b(out of station)\b/i, itemIndex: 15 },
      { regex: /\b(explain me)\b/i, itemIndex: 16 },
      { regex: /\b(pay attention on)\b/i, itemIndex: 17 },
      { regex: /\b(comprise of)\b/i, itemIndex: 18 },
      { regex: /\b(years back|year back)\b/i, itemIndex: 19 },
      { regex: /\b(good only|fine only|done only)\b/i, itemIndex: 20 },
      { regex: /\b(same to same)\b/i, itemIndex: 21 },
      { regex: /\b(one small issue|one issue is there)\b/i, itemIndex: 22 },
      { regex: /\b(matlab|yaani|aur kya)\b/i, itemIndex: 23 },
      { regex: /\b(actually|basically)\b/i, itemIndex: 24 },
      { regex: /\b(and all that|and all|and stuff)\b/i, itemIndex: 25 },
      { regex: /\b(made a project|did a project|our project is|my project is|built a project)\b/i, itemIndex: 26 },
      { regex: /\b(made a website|made an app|built a website|built an app)\b/i, itemIndex: 27 },
      { regex: /\b(used database|stored data|in mysql|in mongodb)\b/i, itemIndex: 28 },
      { regex: /\b(used api|connected api|call api)\b/i, itemIndex: 29 },
      { regex: /\b(fixed the bug|fixed the issue|solved the error|solved it)\b/i, itemIndex: 30 },
      { regex: /\b(it was slow|speed problem|lagging|very slow)\b/i, itemIndex: 31 },
      { regex: /\b(tested it|checked it|did testing)\b/i, itemIndex: 32 },
      { regex: /\b(i think|i feel that|in my opinion|i guess)\b/i, itemIndex: 33 },
      { regex: /\b(agree with you|same point|i agree)\b/i, itemIndex: 34 },
      { regex: /\b(dont agree|i disagree|you are wrong|wrong)\b/i, itemIndex: 35 },
      { regex: /\b(pros and cons|good and bad)\b/i, itemIndex: 36 },
      { regex: /\b(big problem|huge problem|hard thing)\b/i, itemIndex: 37 },
      { regex: /\b(lots of|a lot of|many things|so many)\b/i, itemIndex: 38 },
      { regex: /\b(hardworking|do hard work|hard work)\b/i, itemIndex: 39 },
      { regex: /\b(want this job|want to join|want to work)\b/i, itemIndex: 40 },
    ];

    const detectedMap = new Map<number, string>();
    if (lowerText.length > 0) {
      patterns.forEach(({ regex, itemIndex }) => {
        const match = regex.exec(lowerText);
        if (match && !detectedMap.has(itemIndex)) {
          const startIdx = Math.max(0, match.index - 20);
          const endIdx = Math.min(lowerText.length, match.index + match[0].length + 20);
          detectedMap.set(itemIndex, `"...${text.slice(startIdx, endIdx).trim()}..."`);
        }
      });
    }

    const compiled: UpgradeItem[] = bank.map((b, idx) => ({
      ...b,
      isDetected: detectedMap.has(idx),
      detectedContext: detectedMap.get(idx)
    }));

    const detectedOnly = compiled.filter(c => c.isDetected);

    // Spoken Sentence Transformation Logic
    let sentenceTransform: {
      originalSpoken: string;
      issue: string;
      executivePolish: string;
      whyItConverts: string;
      isRealTranscript: boolean;
    } | null = null;

    if (text.length > 25) {
      // Split into candidate spoken sentences
      const rawSentences = text
        .split(/(?<=[.?!])\s+|\n+/)
        .map(s => s.trim())
        .filter(s => s.split(/\s+/).length >= 5);

      if (rawSentences.length > 0) {
        // Find sentence with informal indicators
        const targetSentence = rawSentences.find(s => 
          /\b(actually|basically|myself|college|project|website|database|problem|slow|bug|passed out|fresher|hard work|lots|stuff|like)\b/i.test(s)
        ) || rawSentences[0];

        if (targetSentence) {
          // Construct intelligent corporate executive upgrade
          let upgraded = targetSentence
            .replace(/\b(myself\s+[\w]+)/gi, "I am [Name], an engineer specializing in scalable systems")
            .replace(/\b(passed out in\s+\d{4}|passout|passed out)\b/gi, "graduated with technical distinction")
            .replace(/\b(actually|basically)\b/gi, "specifically")
            .replace(/\b(in my college|during college days)\b/gi, "throughout our academic capstone coursework")
            .replace(/\b(made a project|our project is|built a project)\b/gi, "architected and deployed a production-ready system")
            .replace(/\b(made a website|made an app)\b/gi, "engineered a full-stack platform")
            .replace(/\b(used database|stored data)\b/gi, "implemented normalized schema design and optimized query indexing")
            .replace(/\b(it was slow|speed problem)\b/gi, "we identified compute latency bottlenecks under load")
            .replace(/\b(fixed the bug|solved the error|solved it)\b/gi, "diagnosed the root-cause defect and deployed targeted hotfixes")
            .replace(/\b(big problem|huge problem)\b/gi, "a critical architectural bottleneck")
            .replace(/\b(lots of|a lot of)\b/gi, "substantial volumes of")
            .replace(/\b(hardworking|do hard work)\b/gi, "demonstrate high execution rigor");

          // Clean up capitalization
          upgraded = upgraded.charAt(0).toUpperCase() + upgraded.slice(1);
          if (!upgraded.endsWith('.')) upgraded += '.';

          sentenceTransform = {
            originalSpoken: `"${targetSentence}"`,
            issue: "Contains casual conversational colloquialisms, passive phrasing, or lacks quantified technical ownership.",
            executivePolish: `"${upgraded}"`,
            whyItConverts: "Demonstrates engineering leadership, active voice, and professional communication standards expected at top tech firms.",
            isRealTranscript: true
          };
        }
      }
    }

    // Benchmark fallback if no transcript was recorded or audio was too brief
    if (!sentenceTransform) {
      if (cleanTopic.includes('tech') || cleanTopic.includes('viva') || cleanTopic.includes('defense') || cleanTopic.includes('project')) {
        sentenceTransform = {
          originalSpoken: `"Basically we made a website with react and used database, but it was slow so we fixed the bug and solved it."`,
          issue: "Informal phrasing ('basically made', 'used database', 'solved it') lacks architectural depth and root-cause specifics.",
          executivePolish: `"We engineered a responsive React platform backed by a normalized PostgreSQL database; when query latency spiked under concurrent load, we implemented composite indexing to boost throughput by 40%."`,
          whyItConverts: "Demonstrates root-cause analysis (RCA), quantified metrics, and senior engineering ownership.",
          isRealTranscript: false
        };
      } else if (cleanTopic.includes('gd') || cleanTopic.includes('debate') || cleanTopic.includes('discussion')) {
        sentenceTransform = {
          originalSpoken: `"I don't agree with you, you are wrong because artificial intelligence will create big problems and take lots of jobs."`,
          issue: "Aggressive confrontation ('you are wrong') and vague fear ('big problems') causes GD panel score deductions.",
          executivePolish: `"While I appreciate the perspective on automated displacement, empirical data indicates that AI primarily automates repetitive tasks while creating a net demand for specialized system orchestrators."`,
          whyItConverts: "Uses diplomatic consensus framing, active listening validation, and evidence-backed counter-argumentation.",
          isRealTranscript: false
        };
      } else if (cleanTopic.includes('pitch')) {
        sentenceTransform = {
          originalSpoken: `"Our app is very good for students who want to speak English and have doubts, and we have lots of features."`,
          issue: "Subjective compliments ('very good', 'lots of features') fail to articulate market pain, moat, or unit economics.",
          executivePolish: `"We built an AI-powered multimodal communication coach that bridges the corporate articulation gap for 10M+ Indian graduates through real-time gaze, posture, and fluency diagnostics."`,
          whyItConverts: "Clearly articulates the addressable market size, proprietary technological moat, and customer value proposition.",
          isRealTranscript: false
        };
      } else {
        sentenceTransform = {
          originalSpoken: `"Myself Rahul, I passed out in 2024 and I am a hardworking fresher looking for a good company to do hard work."`,
          issue: "Colloquial grammar errors ('Myself', 'passed out', 'hardworking fresher') immediately flag candidate as informal.",
          executivePolish: `"I am Rahul, a 2024 computer science graduate specializing in scalable backend systems. I am eager to contribute high execution rigor and technical ownership to your core engineering initiatives."`,
          whyItConverts: "Projects professional confidence, eliminates campus slang, and aligns candidate skills with company goals.",
          isRealTranscript: false
        };
      }
    }

    return {
      allUpgrades: compiled,
      detectedUpgrades: detectedOnly,
      spokenSentenceUpgrade: sentenceTransform
    };
  }, [text, lowerText, cleanTopic]);

  // Filter upgrades based on tab
  const filteredUpgrades = useMemo(() => {
    if (activeCategory === 'detected') {
      return detectedUpgrades.length > 0 ? detectedUpgrades : allUpgrades.slice(0, 6);
    }
    if (activeCategory === 'all') {
      // Prioritize detected first, then scenario-relevant
      const detected = allUpgrades.filter(u => u.isDetected);
      const remaining = allUpgrades.filter(u => !u.isDetected);
      return [...detected, ...remaining].slice(0, 8);
    }
    return allUpgrades.filter(u => u.category === activeCategory).slice(0, 8);
  }, [allUpgrades, detectedUpgrades, activeCategory]);

  return (
    <Card className="border border-border/60 shadow-xs bg-card">
      <CardHeader className="border-b border-border/40 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary shrink-0" />
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Corporate English & Vocabulary Upgrade (ESL Bridge)
              </CardTitle>
              <span className="text-[11px] text-muted-foreground block">
                Transforms campus slang, Indianisms, and informal speech into polished boardroom English
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
              Pro Hub • Free Campus Pilot (Until Oct 31)
            </Badge>
            {detectedUpgrades.length > 0 ? (
              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 font-semibold">
                {detectedUpgrades.length} Phrase(s) Detected in Your Audio
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                Scenario Calibrated
              </Badge>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 pt-3">
          {[
            { id: 'all', label: 'All Recommendations' },
            { id: 'detected', label: `Detected in Audio (${detectedUpgrades.length})` },
            { id: 'intro', label: 'Introductions & Campus' },
            { id: 'esl', label: 'Indianisms & ESL Redundancies' },
            { id: 'tech', label: 'Technical Defense & Viva' },
            { id: 'gd', label: 'GD & Debate Diplomacy' },
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Real Spoken Sentence Transformation Spotlight */}
        {spokenSentenceUpgrade && (
          <div className="p-4 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/[0.04] via-muted/20 to-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Executive Sentence Rephrase Engine</span>
              </div>
              <Badge variant="secondary" className="text-[9px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {spokenSentenceUpgrade.isRealTranscript ? "Transcribed From Your Audio" : "High-Stakes Benchmark Model"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Spoken original */}
              <div className="p-3 rounded-lg bg-red-500/[0.03] border border-red-500/20 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 block">
                  Original Spoken Version
                </span>
                <p className="text-xs font-mono text-foreground/80 leading-relaxed italic">
                  {spokenSentenceUpgrade.originalSpoken}
                </p>
                <p className="text-[10px] text-muted-foreground pt-1 border-t border-red-500/10">
                  <strong className="text-foreground">Tone Gap:</strong> {spokenSentenceUpgrade.issue}
                </p>
              </div>

              {/* Polished executive */}
              <div className="p-3 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/20 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Executive Corporate Upgrade
                </span>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold leading-relaxed">
                  {spokenSentenceUpgrade.executivePolish}
                </p>
                <p className="text-[10px] text-muted-foreground pt-1 border-t border-emerald-500/10">
                  <strong className="text-foreground">Why It Converts:</strong> {spokenSentenceUpgrade.whyItConverts}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Word / Phrase Replacement Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredUpgrades.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-muted/20 border border-border/40 text-xs space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span>Informal / Spoken</span>
                    {item.isDetected && (
                      <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 py-0 px-1.5 font-bold">
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
                  Detected in audio: {item.detectedContext}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">{item.explanation}</p>
            </div>
          ))}
        </div>

        {/* ESL Indian English Phonetics & Delivery Rules */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <span>Core Fluency Rules for Indian English Speakers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-card border border-border/40 space-y-1">
              <span className="text-xs font-bold text-foreground block">1. Stress-Timed English Cadence</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Indian languages are <em>syllable-timed</em> (equal length per syllable). Professional global English is <em>stress-timed</em>: elongate key nouns and action verbs, and say structural prepositions quickly.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border/40 space-y-1">
              <span className="text-xs font-bold text-foreground block">2. The 1-Second Silent Pause</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Never hold the floor with filler crutches (<em>"matlab", "basically", "you know"</em>). Close your mouth and breathe for 1 second. Silence projects executive composure and high status.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border/40 space-y-1">
              <span className="text-xs font-bold text-foreground block">3. Clear /v/ vs. /w/ Articulation</span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Distinguish between <strong>/v/</strong> (press upper teeth against lower lip, as in <em>value, very</em>) and <strong>/w/</strong> (round lips with zero teeth contact, as in <em>work, website</em>).
              </p>
            </div>
          </div>
        </div>
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
