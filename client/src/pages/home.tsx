// client/src/pages/home.tsx
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  Video, 
  Sparkles, 
  Eye, 
  Activity, 
  Volume2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Play, 
  Zap, 
  BookOpen, 
  Compass, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Users, 
  HelpCircle, 
  FileText, 
  Wind,
  Layers,
  BarChart3,
  Flame,
  Check,
  Star,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getCurrentUser } from '@/utils/auth';

export default function Home() {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'vision' | 'posture' | 'speech' | 'vocabulary'>('vision');
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const scenarios = [
    {
      title: "Campus Placement HR & Technical",
      desc: "Practice behavioral questions (STAR method), resume walkthroughs, and executive presence under interview pressure.",
      badge: "Placement Drive",
      metrics: { eye: "92%", pace: "138 WPM", posture: "Upright", fillers: "0 detected" },
      prompt: "Tell me about a challenging project where you resolved a critical bottleneck under tight deadlines."
    },
    {
      title: "Startup & Investor Pitch",
      desc: "Deliver high-stakes investor decks, market opportunity sizing, and unit economics with assertive conviction.",
      badge: "High Stakes",
      metrics: { eye: "95%", pace: "148 WPM", posture: "Confident", fillers: "1 detected" },
      prompt: "Walk us through your target addressable market and why incumbents cannot easily replicate your moat."
    },
    {
      title: "Parliamentary Debate & MUN",
      desc: "Sharpen persuasive rhetoric, cross-examination rebuttals, and rapid argumentative structuring.",
      badge: "Public Debate",
      metrics: { eye: "89%", pace: "155 WPM", posture: "Engaged", fillers: "0 detected" },
      prompt: "Present a 60-second opening statement on algorithmic transparency in global financial systems."
    },
    {
      title: "Leadership & Townhall Keynote",
      desc: "Master executive storytelling, pause management, and empathetic team alignment.",
      badge: "Executive",
      metrics: { eye: "94%", pace: "132 WPM", posture: "Steadfast", fillers: "0 detected" },
      prompt: "Address the team regarding our Q3 strategic pivot while sustaining high morale and alignment."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/20">
      
      {/* ===================== HERO SECTION ===================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            
            {/* Live Pilot Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold backdrop-blur-md shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>MIRAL 2.0 • Real-Time Vision & Speech Intelligence Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Speak with <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">Unshakeable Confidence</span>. Powered by Real-Time AI.
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Stop practicing in front of a mute mirror. MIRAL tracks your <strong className="text-foreground font-semibold">eye contact</strong>, <strong className="text-foreground font-semibold">seated posture</strong>, <strong className="text-foreground font-semibold">speaking pace (WPM)</strong>, and <strong className="text-foreground font-semibold">filler words</strong> with sub-pixel vision AI — completely private in your browser.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 pt-2 w-full sm:w-auto">
              <Link href="/practice">
                <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-12 px-7 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  <Play className="h-4 w-4 fill-current" />
                  <span>Launch Free Practice Session</span>
                </Button>
              </Link>

              <Link href="/scenarios">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-12 px-6 gap-2 border-border/80 hover:bg-muted/50">
                  <Compass className="h-4 w-4 text-primary" />
                  <span>Explore 15+ Practice Scenarios</span>
                </Button>
              </Link>

              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" variant="ghost" className="w-full sm:w-auto text-sm font-semibold h-12 px-5 gap-2 text-muted-foreground hover:text-foreground">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" variant="ghost" className="w-full sm:w-auto text-sm font-semibold h-12 px-5 gap-2 text-muted-foreground hover:text-foreground">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Trust & Privacy Highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground border-t border-border/40 w-full">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-foreground">100% In-Browser Privacy</span>
                <span>(No video uploaded to cloud)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-foreground">Zero Latency Feedback</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Placement & Executive Ready</span>
              </div>
            </div>

          </div>

          {/* ===================== INTERACTIVE LIVE SIMULATOR SHOWCASE ===================== */}
          <div className="mt-12 md:mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl border-2 border-border/80 bg-card/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
              
              {/* Window Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono font-medium text-muted-foreground ml-2">
                    miral-vision-engine // active_stream
                  </span>
                </div>

                {/* Scenario Selector Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {scenarios.map((sc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveScenarioIdx(idx)}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                        activeScenarioIdx === idx
                          ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                          : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {sc.badge}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Live Viewport */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5 items-stretch">
                
                {/* Simulated Camera & Gaze Overlay */}
                <div className="lg:col-span-2 rounded-xl bg-slate-950 border border-slate-800 p-5 relative min-h-[300px] flex flex-col justify-between overflow-hidden shadow-inner">
                  
                  {/* Subtle Grid Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-25" />

                  {/* Top Overlay Badges */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                      <span className="font-semibold text-slate-200">Continuous Iris Mesh</span>
                      <span className="text-slate-400 font-mono text-[10px]">• 468 Landmarks</span>
                    </div>
                    <Badge variant="outline" className="bg-slate-900/80 border-slate-700 text-slate-300 text-xs">
                      {scenarios[activeScenarioIdx].title}
                    </Badge>
                  </div>

                  {/* Center Gaze Target Ring */}
                  <div className="relative z-10 my-6 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="relative flex items-center justify-center">
                      <div className="h-24 w-24 rounded-full border-2 border-primary/40 flex items-center justify-center animate-pulse">
                        <div className="h-16 w-16 rounded-full border-2 border-green-500/60 flex items-center justify-center bg-green-500/10">
                          <Eye className="h-7 w-7 text-green-400" />
                        </div>
                      </div>
                      <div className="absolute -top-1 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-950 border border-green-700 text-green-300 font-bold">
                        DIRECT GAZE: {scenarios[activeScenarioIdx].metrics.eye}
                      </div>
                    </div>
                    
                    <div className="max-w-md bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-left space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Live Prompt Scenario:</span>
                      <p className="text-xs text-slate-200 italic leading-relaxed">
                        "{scenarios[activeScenarioIdx].prompt}"
                      </p>
                    </div>
                  </div>

                  {/* Bottom Live Cues */}
                  <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Natural Eye Level Maintained</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-500">Processing: 60 FPS Browser WASM</span>
                  </div>
                </div>

                {/* Simulated Live Diagnostics Deck */}
                <div className="flex flex-col justify-between space-y-3">
                  
                  {/* Eye Metric */}
                  <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Audience Gaze Focus</span>
                      <Badge variant="default" className="text-[10px] bg-green-600 text-white">Direct Focus</Badge>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {scenarios[activeScenarioIdx].metrics.eye}
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-green-500 h-full rounded-full w-[92%]" />
                    </div>
                  </div>

                  {/* Speaking Pace */}
                  <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-1.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Speaking Pace</span>
                      <Badge variant="outline" className="text-[10px] border-primary/40 text-primary font-semibold">Optimal Cadence</Badge>
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {scenarios[activeScenarioIdx].metrics.pace}
                    </div>
                    <p className="text-[11px] text-muted-foreground">Target: 130–155 WPM for clear listener retention</p>
                  </div>

                  {/* Posture & Fillers */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1 shadow-xs">
                      <span className="text-[10px] text-muted-foreground font-medium block">Posture</span>
                      <span className="text-sm font-bold text-foreground block">{scenarios[activeScenarioIdx].metrics.posture}</span>
                      <span className="text-[10px] text-green-600 font-medium">Spine Aligned</span>
                    </div>
                    <div className="p-3 rounded-xl border border-border/60 bg-card space-y-1 shadow-xs">
                      <span className="text-[10px] text-muted-foreground font-medium block">Hesitations</span>
                      <span className="text-sm font-bold text-foreground block">{scenarios[activeScenarioIdx].metrics.fillers}</span>
                      <span className="text-[10px] text-green-600 font-medium">Clean Flow</span>
                    </div>
                  </div>

                  {/* Launch Simulator CTA */}
                  <Link href="/practice">
                    <Button className="w-full text-xs font-semibold h-10 gap-1.5">
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Try This Scenario Live</span>
                    </Button>
                  </Link>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ===================== BEFORE VS AFTER SECTION ===================== */}
      <section className="py-16 md:py-24 bg-muted/20 border-b border-border/40">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs font-semibold">
              Measurable Transformation
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              What Happens When You Practice With Objective AI?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Most speakers never realize their blind spots until an interviewer or audience disengages. MIRAL makes non-verbal and verbal delivery measurable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Before Card */}
            <Card className="border-2 border-red-500/20 bg-card shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500/60" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="destructive" className="text-xs font-semibold">Before MIRAL</Badge>
                  <span className="text-xs text-muted-foreground font-mono">Unmonitored Practice</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground mt-2">
                  Unconscious Habits & Nervous Tells
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-muted-foreground">
                  <span className="text-red-500 font-bold">✕</span>
                  <div>
                    <strong className="text-foreground block">Darting Gaze (42% Eye Focus):</strong>
                    Looking down at notes or ceiling when recalling complex answers.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-muted-foreground">
                  <span className="text-red-500 font-bold">✕</span>
                  <div>
                    <strong className="text-foreground block">Rushed Cadence (185+ WPM):</strong>
                    Talking too fast due to adrenaline, making ideas difficult to digest.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-muted-foreground">
                  <span className="text-red-500 font-bold">✕</span>
                  <div>
                    <strong className="text-foreground block">Repetitive Fillers (12+ per min):</strong>
                    Filling silent thinking pauses with "um, like, matlab, basically".
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-muted-foreground">
                  <span className="text-red-500 font-bold">✕</span>
                  <div>
                    <strong className="text-foreground block">Slouched Posture:</strong>
                    Sinking down in the chair, projecting uncertainty and lack of presence.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* After Card */}
            <Card className="border-2 border-green-500/30 bg-card shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-500" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="text-xs font-semibold bg-green-600 text-white">With MIRAL AI Coach</Badge>
                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Ready for Impact</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground mt-2">
                  Polished, Executive & Natural Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-muted-foreground">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">Locked Forward Connection (90%+ Gaze):</strong>
                    Natural eye contact centered with the camera lens and audience.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-muted-foreground">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">Commanding 135–150 WPM Rhythm:</strong>
                    Deliberate pauses before key points that convey executive authority.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-muted-foreground">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">Silent Breath Pauses (0–1 Fillers):</strong>
                    Clean articulation with instant vocabulary polishing suggestions.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-500/5 border border-green-500/20 text-muted-foreground">
                  <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground block">Upright & Level Posture (94% Stability):</strong>
                    Balanced shoulders and chin elevation calibrated for laptop webcams.
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </section>

      {/* ===================== CORE FEATURE MATRIX ===================== */}
      <section className="py-16 md:py-24 border-b border-border/40">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs font-semibold">
              Deep Tech Capabilities
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              Everything You Need to Master Public Communication
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Engineered with modern computer vision, web speech recognition, and instant AI analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Sub-Pixel Iris Tracking</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                468-point facial mesh measures exact pupil coordinates to determine true camera engagement rather than just face direction.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Seated Posture Stabilization</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calibrated specifically for laptop webcam angles (up to 11° roll & tilt) to prevent false slouch alerts while encouraging upright posture.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Volume2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Live Speaking Pace (WPM)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-time vocal rate estimation detects rushed delivery or sluggish pauses, guiding you to a steady 130–155 WPM conversational sweet spot.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Executive Vocabulary Upgrade</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ESL bridge engine replaces colloquial phrasing (e.g., "did work") with assertive corporate terminology ("architected / spearheaded").
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Wind className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">60-Second Anti-Anxiety Warmup</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Interactive box-breathing rhythm followed by phonetic vocal articulation drills to eliminate stage nervousness before you speak.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-all space-y-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">360° Session Performance Audit</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instant actionable report with composite confidence rating, detailed timeline graphs, strengths, and targeted improvement drills.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ===================== HOW IT WORKS (3 SIMPLE STEPS) ===================== */}
      <section className="py-16 md:py-24 bg-muted/20 border-b border-border/40">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs font-semibold">
              Frictionless Workflow
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">
              How MIRAL Works in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-3.5 relative">
              <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center shadow-lg shadow-primary/20">
                1
              </div>
              <h3 className="text-base font-bold text-foreground">Pick a Prompt or Script</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select from our curated industry question bank or paste your own presentation notes into the live teleprompter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-3.5 relative">
              <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center shadow-lg shadow-primary/20">
                2
              </div>
              <h3 className="text-base font-bold text-foreground">Speak & Get Live Cues</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As you speak, live metrics monitor your eye gaze, posture, and pacing with gentle real-time nudges if you look away.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-3.5 relative">
              <div className="h-14 w-14 rounded-2xl bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center shadow-lg shadow-primary/20">
                3
              </div>
              <h3 className="text-base font-bold text-foreground">Review Diagnostic Audit</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Immediately receive your comprehensive breakdown, vocabulary polishing advice, and printable PDF report card.
              </p>
            </div>

          </div>

          <div className="mt-12 text-center">
            <Link href="/practice">
              <Button size="lg" className="text-sm font-semibold h-11 px-8 gap-2 shadow-md">
                <Play className="h-4 w-4 fill-current" />
                <span>Try a 60-Second Practice Session</span>
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* ===================== FAQ ACCORDION SECTION ===================== */}
      <section className="py-16 md:py-24 border-b border-border/40">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-3 mb-12">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs font-semibold">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Everything You Need to Know About MIRAL
            </h2>
          </div>

          <div className="space-y-3.5">
            {[
              {
                q: "Is my webcam video or microphone audio stored on any servers?",
                a: "No. MIRAL processes your video and pupil gaze 100% locally in your web browser via WebAssembly. No raw video feed is ever recorded, transmitted, or saved to any cloud storage."
              },
              {
                q: "Which browsers provide the best experience?",
                a: "Google Chrome, Microsoft Edge, and Safari provide the smoothest WebAssembly vision inference and continuous Web Speech transcription."
              },
              {
                q: "How does the Eye Contact metric calculate focus?",
                a: "MIRAL tracks your sub-pixel iris centering relative to your eye boundaries and head yaw angle. Looking directly at the camera or upper screen maintains an optimal 88%–95% direct focus score."
              },
              {
                q: "Is MIRAL suitable for non-native English speakers (ESL)?",
                a: "Yes! MIRAL includes a dedicated Executive Vocabulary Upgrade engine that automatically suggests formal, high-impact phrasing alternatives for common ESL expressions."
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-foreground hover:bg-muted/30 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${faqOpen === idx ? 'rotate-90 text-primary' : ''}`} />
                </button>
                {faqOpen === idx && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/30 pt-3 bg-muted/10">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-card to-background relative overflow-hidden">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          
          <div className="inline-flex items-center gap-1 text-primary">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-primary" />
            ))}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
            Ready to Speak with Supreme Confidence?
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join hundreds of students, debaters, and professionals preparing for upcoming interviews and high-stakes presentations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/practice">
              <Button size="lg" className="w-full sm:w-auto text-sm font-semibold h-12 px-8 gap-2 shadow-lg shadow-primary/20">
                <Play className="h-4 w-4 fill-current" />
                <span>Launch Practice Now</span>
              </Button>
            </Link>

            <Link href="/scenarios">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm font-semibold h-12 px-6 gap-2">
                <Compass className="h-4 w-4 text-primary" />
                <span>Browse Practice Scenarios</span>
              </Button>
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
