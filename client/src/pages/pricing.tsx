// client/src/pages/pricing.tsx
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Sparkles, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  Video, 
  Zap, 
  ArrowRight,
  HelpCircle,
  Users,
  Award,
  FileCheck,
  BarChart3,
  Cpu,
  Target,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#05060A] text-slate-100 py-12 relative overflow-x-hidden">
      {/* Aurora Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden">
        <div className="aurora-blob-1 absolute top-[-100px] left-[-80px] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="aurora-blob-2 absolute top-[35%] right-[-120px] w-[450px] h-[450px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="aurora-blob-3 absolute bottom-[-100px] left-[30%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-14">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Transparent Plans &amp; Institutional Licensing</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Simple, High-Impact Pricing for <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Candidates &amp; Universities</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Zero cloud compute costs mean infinite scalability. Practice free during our campus validation wave, accelerate with Pro interview intelligence, or license institutional cohort analytics for your college TPO cell.
          </p>
        </div>

        {/* Pilot Waiver Banner */}
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-500/30 bg-white/[0.04] backdrop-blur-xl text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_40px_rgba(99,102,241,0.1)] card-gradient-top">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-xs font-bold border-0 shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                Wave 1 Pilot Active
              </Badge>
              <span className="text-xs font-bold text-white">100% Free Campus Access</span>
            </div>
            <p className="text-xs text-slate-400">
              All candidate practice tracks, live teleprompters, and AI speech diagnostics are currently unlocked at zero cost for participating college students.
            </p>
          </div>
          <Link href="/practice" className="shrink-0">
            <Button className="text-xs font-semibold h-9 px-5 gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0">
              <Video className="h-3.5 w-3.5" />
              <span>Launch Free Practice</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Tier 1: Free Candidate Starter */}
          <Card className="border border-white/[0.08] shadow-sm bg-white/[0.03] backdrop-blur-xl rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all">
            <CardHeader className="pb-4 border-b border-white/[0.06]">
              <Badge variant="outline" className="w-fit text-[10px] font-semibold border-white/10 text-slate-400 bg-white/[0.02] mb-2">
                Candidate Starter
              </Badge>
              <CardTitle className="text-xl font-bold text-white">Free Candidate</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                For students practicing foundational communication &amp; interview skills independently.
              </CardDescription>
              <div className="pt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">₹0</span>
                <span className="text-xs text-slate-500">/ free forever</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span><strong className="text-white">3 practice sessions</strong> per week (unlimited in pilot)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>3D iris eye contact &amp; head pose tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Real-time WPM pacing gauge &amp; filler word counter</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Standard post-session diagnostic report</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Access to 5 curated placement scenario tracks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>100% private in-browser WebAssembly (No video uploaded)</span>
                </li>
              </ul>

              <Link href="/practice" className="w-full">
                <Button variant="outline" className="w-full text-xs font-semibold h-9 border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200">
                  Start Free Practice
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tier 2: Pro Placement Pass (Highlighted) */}
          <Card className="border-2 border-indigo-500/50 shadow-[0_0_60px_rgba(99,102,241,0.25)] bg-gradient-to-b from-indigo-500/[0.08] to-white/[0.04] backdrop-blur-2xl rounded-2xl relative flex flex-col justify-between card-gradient-top">
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-4 shadow-[0_0_20px_rgba(99,102,241,0.6)] border-0">
                Most Popular for Placements
              </Badge>
            </div>

            <CardHeader className="pb-4 border-b border-white/[0.08] pt-6">
              <Badge variant="outline" className="w-fit text-[10px] font-semibold border-indigo-500/40 text-indigo-300 bg-indigo-500/10 mb-2">
                Placement Intensive
              </Badge>
              <CardTitle className="text-xl font-bold text-white">Pro Placement Pass</CardTitle>
              <CardDescription className="text-xs text-slate-300">
                Advanced AI interview intelligence, STAR-method rubric scoring, and custom JD mock drills.
              </CardDescription>
              <div className="pt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">₹199</span>
                <span className="text-xs text-slate-400">/ month or ₹499 one-time</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-white">Unlimited real-time practice sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-white">STAR-Method Answer Structure Scorer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span><strong className="text-white">Conciseness &amp; Monologue Radar</strong> (Flags answers &gt; 2.5m)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span><strong className="text-white">AI Job Description to Mock Generator</strong> (Paste any JD)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Smart Speed Teleprompter (Adjustable 130-150 WPM pacing)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Boardroom &amp; ESL Vocabulary Upgrades</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span><strong className="text-white">Verified Placement Readiness Certificate (PDF)</strong> with QR</span>
                </li>
              </ul>

              <Link href="/practice" className="w-full">
                <Button className="w-full text-xs font-semibold h-9 gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Unlocked in Pilot (Free)</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tier 3: University & TPO License */}
          <Card className="border border-white/[0.08] shadow-sm bg-white/[0.03] backdrop-blur-xl rounded-2xl flex flex-col justify-between hover:border-white/20 transition-all">
            <CardHeader className="pb-4 border-b border-white/[0.06]">
              <Badge variant="outline" className="w-fit text-[10px] font-semibold border-white/10 text-slate-400 bg-white/[0.02] mb-2">
                Institutional SaaS
              </Badge>
              <CardTitle className="text-xl font-bold text-white">University &amp; TPO</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                For engineering colleges, MBA institutes, and Training &amp; Placement cells conducting mass mock drives.
              </CardDescription>
              <div className="pt-4 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold text-white">₹15K – ₹50K</span>
                <span className="text-xs text-slate-500">/ semester</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-white font-semibold">Batch Placement Readiness Index (PRI) for 1,000+ candidates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-white font-semibold">Automated Mass Mock Screening (0 faculty workload)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong className="text-white">Weakness Clustering Heatmap</strong> (Targeted student interventions)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong className="text-white">Company-Specific Rubrics</strong> (TCS, Infosys, Deloitte, Amazon)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>LMS / ERP &amp; CSV Roster Sync (CSE, IT, ECE, MBA)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Custom institutional branding &amp; white-label reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Dedicated TPO Placement Portal &amp; Priority SLA Support</span>
                </li>
              </ul>

              <Link href="/contact" className="w-full">
                <Button variant="outline" className="w-full text-xs font-semibold h-9 gap-1.5 border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Request Campus Pilot</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Compare Features Across Tiers
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Designed to take candidates from campus basics to recruiter-ready confidence.
            </p>
          </div>

          <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-xl shadow-[0_0_30px_rgba(99,102,241,0.06)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] border-b border-white/[0.08] text-white font-semibold">
                  <tr>
                    <th className="p-4 w-1/3">Feature / Capability</th>
                    <th className="p-4 text-center text-slate-300">Free Starter</th>
                    <th className="p-4 text-center bg-indigo-500/10 text-indigo-300 border-x border-indigo-500/20">Pro Placement Pass</th>
                    <th className="p-4 text-center text-slate-300">University &amp; TPO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-slate-300">
                  <tr>
                    <td className="p-4 font-medium text-white">Practice Sessions Limit</td>
                    <td className="p-4 text-center text-slate-400">3 / week</td>
                    <td className="p-4 text-center font-semibold text-white bg-indigo-500/10 border-x border-indigo-500/20">Unlimited</td>
                    <td className="p-4 text-center font-semibold text-white">Unlimited (Batch-wide)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Real-Time Eye Gaze &amp; Iris Telemetry</td>
                    <td className="p-4 text-center text-indigo-400"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-cyan-400 bg-indigo-500/10 border-x border-indigo-500/20"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">WPM Vocal Pacing &amp; Filler Word Counter</td>
                    <td className="p-4 text-center text-indigo-400"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-cyan-400 bg-indigo-500/10 border-x border-indigo-500/20"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">STAR-Method Answer Structure Breakdown</td>
                    <td className="p-4 text-center text-slate-600">—</td>
                    <td className="p-4 text-center text-cyan-400 bg-indigo-500/10 border-x border-indigo-500/20"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Conciseness &amp; Monologue Radar (&gt;2.5m alerts)</td>
                    <td className="p-4 text-center text-slate-600">—</td>
                    <td className="p-4 text-center text-cyan-400 bg-indigo-500/10 border-x border-indigo-500/20"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Job Description to Mock Question Generator</td>
                    <td className="p-4 text-center text-slate-600">—</td>
                    <td className="p-4 text-center text-cyan-400 bg-indigo-500/10 border-x border-indigo-500/20"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Verified QR Placement Certificate (PDF)</td>
                    <td className="p-4 text-center text-slate-600">—</td>
                    <td className="p-4 text-center text-cyan-400 bg-indigo-500/10 border-x border-indigo-500/20"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Batch-Wide Placement Readiness Index (PRI)</td>
                    <td className="p-4 text-center text-slate-600">—</td>
                    <td className="p-4 text-center text-slate-600 bg-indigo-500/10 border-x border-indigo-500/20">—</td>
                    <td className="p-4 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">Mass Mock Screening &amp; Weakness Clustering</td>
                    <td className="p-4 text-center text-slate-600">—</td>
                    <td className="p-4 text-center text-slate-600 bg-indigo-500/10 border-x border-indigo-500/20">—</td>
                    <td className="p-4 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-white">LMS / ERP &amp; CSV Roster Sync</td>
                    <td className="p-4 text-center text-slate-600">—</td>
                    <td className="p-4 text-center text-slate-600 bg-indigo-500/10 border-x border-indigo-500/20">—</td>
                    <td className="p-4 text-center text-emerald-400"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Why Zero-Cost Infra Box */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <ShieldCheck className="h-4 w-4" />
            <span>The MIRAL Edge for Universities &amp; Students</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <span className="font-bold text-white block">Zero Cloud GPU Bills</span>
              <p>Vision models run client-side via WebAssembly. We never charge universities expensive per-minute video rendering fees.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <span className="font-bold text-white block">100% Student Privacy Compliant</span>
              <p>Webcam video never leaves the student browser. Zero raw recordings stored on cloud servers.</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <span className="font-bold text-white block">Actionable TPO Placement Analytics</span>
              <p>TPOs get instant visibility into which students are ready for Day-1 recruiters and which need remedial coaching.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}


