// client/src/pages/terms.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, AlertCircle, Scale } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="border-b border-border/40 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Scale className="h-4 w-4" />
            Terms of Service & Usage Charter
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: September 1, 2026 • Applicable to all individual practitioners, university students, and institutional pilot accounts.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
          
          <Card className="border border-border/60 shadow-xs bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                By accessing or using MIRAL ("the Platform"), you agree to be bound by these Terms of Service. If you are participating as part of an institutional university pilot or placement cell program, your usage is also governed by your institution's academic conduct charter.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                2. Practice & Coaching Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                MIRAL is designed as an educational, non-judgmental speech and non-verbal confidence coaching mirror. The diagnostic metrics (including composite confidence index, visual focus percentage, posture stability score, and words-per-minute pacing) represent automated algorithmic estimations intended for self-improvement and mock practice.
              </p>
              <p>
                While MIRAL metrics significantly correlate with human interview performance, the platform does not guarantee specific job offers or formal academic grades.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                3. User Responsibilities & Acceptable Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                Candidates agree to use the microphone and webcam stream strictly for legitimate interview practice, speech rehearsal, and debate preparation. Users may not record abusive, unlawful, or infringing content during practice sessions.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                4. Intellectual Property & Candidate Ownership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                Candidates retain full ownership of their original speech transcripts, interview responses, and exported diagnostic reports. MIRAL and its technology partners retain all rights, titles, and interests in the underlying multimodal computer vision algorithms, user interface, and diagnostic engines.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                5. Institutional Pilots & Governance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                Universities and placement cells participating in campus pilots may request institutional dashboard access to aggregate student cohort performance. For enterprise and university inquiries, contact <span className="font-mono text-primary font-semibold">tpo-pilot@miral.ai</span>.
              </p>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
