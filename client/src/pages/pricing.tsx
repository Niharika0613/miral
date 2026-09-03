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
  Users
} from 'lucide-react';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-12">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Transparent Plans & Institutional Licensing</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Simple, Accessible Pricing for Students & Universities
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Zero cloud compute costs mean infinite scalability. Practice free during our campus validation wave, or license institutional dashboards for your college batch.
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

          {/* Tier 1: Free Candidate Pilot */}
          <Card className="border border-border/60 shadow-xs bg-card flex flex-col justify-between">
            <CardHeader className="pb-4 border-b border-border/30">
              <Badge variant="outline" className="w-fit text-[10px] font-semibold border-border/70 text-muted-foreground mb-2">
                Candidate Starter
              </Badge>
              <CardTitle className="text-xl font-bold text-foreground">Free Candidate</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                For students preparing independently for upcoming placement interviews.
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
                  <span>3 practice sessions per week</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>3D iris eye contact & posture tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Real-time WPM pacing & filler word counter</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Standard session diagnostic reports</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>100% private in-browser WebAssembly</span>
                </li>
              </ul>

              <Link href="/practice" className="w-full">
                <Button variant="outline" className="w-full text-xs font-semibold h-9">
                  Start Practicing
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
                Intensive 30-day interview prep with unlimited sessions and custom teleprompters.
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
                  <span className="font-semibold">Unlimited practice sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Custom Speech Notepad & Live Teleprompter</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Executive Vocabulary Upgrades (ESL Bridge)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Full historical progress charts & comparison</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Exportable executive PDF diagnostic reports</span>
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
                For engineering colleges, MBA institutes, and Training & Placement cells.
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
                  <span className="text-foreground font-semibold">Batch-wide student cohort dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Automated mock drive communication screening</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Custom institutional question banks & rubric</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Dedicated campus onboarding & TPO support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Official campus placement readiness certs</span>
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

        {/* Why Zero-Cost Infra Box */}
        <div className="p-6 rounded-2xl border border-border/60 bg-muted/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-4 w-4" />
            <span>The MIRAL Architecture Advantage</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
            <div className="p-3.5 rounded-xl bg-card border border-border/40 space-y-1">
              <span className="font-bold text-foreground block">Zero Cloud GPU Costs</span>
              <p>Vision models run client-side via WebAssembly. We have no server video processing bills to pass on to students.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border/40 space-y-1">
              <span className="font-bold text-foreground block">Complete Student Privacy</span>
              <p>Webcam video never leaves the browser. No raw recordings stored on cloud databases.</p>
            </div>
            <div className="p-3.5 rounded-xl bg-card border border-border/40 space-y-1">
              <span className="font-bold text-foreground block">Institutionally Defensible</span>
              <p>TPOs can audit batch improvement graphs without exposing individual candidate video feeds.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
