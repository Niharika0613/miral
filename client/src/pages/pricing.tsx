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
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-14">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Transparent Plans & Institutional Licensing</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Simple, High-Impact Pricing for Candidates & Universities
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Zero cloud compute costs mean infinite scalability. Practice free during our campus validation wave, accelerate with Pro interview intelligence, or license institutional cohort analytics for your college TPO cell.
          </p>
        </div>

        {/* Pilot Waiver Banner */}
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-primary/40 bg-primary/5 text-foreground flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <Badge className="bg-primary text-primary-foreground text-xs font-bold">
                Wave 1 Pilot Active
              </Badge>
              <span className="text-xs font-bold text-foreground">100% Free Campus Access</span>
            </div>
            <p className="text-xs text-muted-foreground">
              All candidate practice tracks, live teleprompters, and AI speech diagnostics are currently unlocked at zero cost for participating college students.
            </p>
          </div>
          <Link href="/practice" className="shrink-0">
            <Button className="text-xs font-semibold h-9 px-5 gap-2">
              <Video className="h-3.5 w-3.5" />
              <span>Launch Free Practice</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* 3 Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Tier 1: Free Candidate Starter */}
          <Card className="border border-border/60 shadow-xs bg-card flex flex-col justify-between">
            <CardHeader className="pb-4 border-b border-border/30">
              <Badge variant="outline" className="w-fit text-[10px] font-semibold border-border/70 text-muted-foreground mb-2">
                Candidate Starter
              </Badge>
              <CardTitle className="text-xl font-bold text-foreground">Free Candidate</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                For students practicing foundational communication & interview skills independently.
              </CardDescription>
              <div className="pt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">₹0</span>
                <span className="text-xs text-muted-foreground">/ free forever</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span><strong>3 practice sessions</strong> per week (unlimited in pilot)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>3D iris eye contact & head pose tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Real-time WPM pacing gauge & filler word counter</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Standard post-session diagnostic report</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Access to 5 curated placement scenario tracks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>100% private in-browser WebAssembly (No video uploaded)</span>
                </li>
              </ul>

              <Link href="/practice" className="w-full">
                <Button variant="outline" className="w-full text-xs font-semibold h-9">
                  Start Free Practice
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tier 2: Pro Placement Pass (Highlighted) */}
          <Card className="border-2 border-primary shadow-lg bg-card relative flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-0.5 px-3">
                Most Popular for Placements
              </Badge>
            </div>

            <CardHeader className="pb-4 border-b border-border/30 pt-6">
              <Badge variant="outline" className="w-fit text-[10px] font-semibold border-primary/40 text-primary mb-2">
                Placement Intensive
              </Badge>
              <CardTitle className="text-xl font-bold text-foreground">Pro Placement Pass</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Advanced AI interview intelligence, STAR-method rubric scoring, and custom JD mock drills.
              </CardDescription>
              <div className="pt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-primary">₹199</span>
                <span className="text-xs text-muted-foreground">/ month or ₹499 one-time</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-xs text-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold">Unlimited real-time practice sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold">STAR-Method Answer Structure Scorer</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span><strong>Conciseness & Monologue Radar</strong> (Flags answers &gt; 2.5m)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span><strong>AI Job Description to Mock Generator</strong> (Paste any JD)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Smart Speed Teleprompter (Adjustable 130-150 WPM pacing)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Boardroom & ESL Vocabulary Upgrades</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span><strong>Verified Placement Readiness Certificate (PDF)</strong> with QR</span>
                </li>
              </ul>

              <Link href="/practice" className="w-full">
                <Button className="w-full text-xs font-semibold h-9 gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Unlocked in Pilot (Free)</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tier 3: University & TPO License */}
          <Card className="border border-border/60 shadow-xs bg-card flex flex-col justify-between">
            <CardHeader className="pb-4 border-b border-border/30">
              <Badge variant="outline" className="w-fit text-[10px] font-semibold border-border/70 text-muted-foreground mb-2">
                Institutional SaaS
              </Badge>
              <CardTitle className="text-xl font-bold text-foreground">University & TPO</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                For engineering colleges, MBA institutes, and Training & Placement cells conducting mass mock drives.
              </CardDescription>
              <div className="pt-4 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold text-foreground">₹15K – ₹50K</span>
                <span className="text-xs text-muted-foreground">/ semester</span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-foreground font-semibold">Batch Placement Readiness Index (PRI) for 1,000+ candidates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-foreground font-semibold">Automated Mass Mock Screening (0 faculty workload)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span><strong>Weakness Clustering Heatmap</strong> (Targeted student interventions)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span><strong>Company-Specific Rubrics</strong> (TCS, Infosys, Deloitte, Amazon)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>LMS / ERP & CSV Roster Sync (CSE, IT, ECE, MBA)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Custom institutional branding & white-label reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Dedicated TPO Placement Portal & Priority SLA Support</span>
                </li>
              </ul>

              <Link href="/contact" className="w-full">
                <Button variant="outline" className="w-full text-xs font-semibold h-9 gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Request Campus Pilot</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Compare Features Across Tiers
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Designed to take candidates from campus basics to recruiter-ready confidence.
            </p>
          </div>

          <div className="border border-border/60 rounded-2xl overflow-hidden bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border/50 text-foreground font-semibold">
                  <tr>
                    <th className="p-4 w-1/3">Feature / Capability</th>
                    <th className="p-4 text-center">Free Starter</th>
                    <th className="p-4 text-center bg-primary/5 text-primary">Pro Placement Pass</th>
                    <th className="p-4 text-center">University & TPO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-muted-foreground">
                  <tr>
                    <td className="p-4 font-medium text-foreground">Practice Sessions Limit</td>
                    <td className="p-4 text-center">3 / week</td>
                    <td className="p-4 text-center font-semibold text-foreground bg-primary/5">Unlimited</td>
                    <td className="p-4 text-center font-semibold text-foreground">Unlimited (Batch-wide)</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Real-Time Eye Gaze & Iris Telemetry</td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-primary bg-primary/5"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">WPM Vocal Pacing & Filler Word Counter</td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-primary bg-primary/5"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">STAR-Method Answer Structure Breakdown</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-primary bg-primary/5"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Conciseness & Monologue Radar (&gt;2.5m alerts)</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-primary bg-primary/5"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Job Description to Mock Question Generator</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-primary bg-primary/5"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Verified QR Placement Certificate (PDF)</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-primary bg-primary/5"><Check className="h-4 w-4 mx-auto" /></td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Batch-Wide Placement Readiness Index (PRI)</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">Mass Mock Screening & Weakness Clustering</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-foreground">LMS / ERP & CSV Roster Sync</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-muted-foreground/40">—</td>
                    <td className="p-4 text-center text-primary"><Check className="h-4 w-4 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Why Zero-Cost Infra Box */}
        <div className="p-6 rounded-2xl border border-border/60 bg-muted/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-4 w-4" />
            <span>The MIRAL Edge for Universities & Students</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
            <div className="p-4 rounded-xl bg-card border border-border/40 space-y-1.5">
              <span className="font-bold text-foreground block">Zero Cloud GPU Bills</span>
              <p>Vision models run client-side via WebAssembly. We never charge universities expensive per-minute video rendering fees.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/40 space-y-1.5">
              <span className="font-bold text-foreground block">100% Student Privacy Compliant</span>
              <p>Webcam video never leaves the student browser. Zero raw recordings stored on cloud servers.</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/40 space-y-1.5">
              <span className="font-bold text-foreground block">Actionable TPO Placement Analytics</span>
              <p>TPOs get instant visibility into which students are ready for Day-1 recruiters and which need remedial coaching.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

