// client/src/pages/privacy.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Lock, Eye, Video, Server, FileText } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Header */}
        <div className="border-b border-border/40 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-4 w-4" />
            Data Protection & Privacy Charter
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Last Updated: September 1, 2026 • Effective for all MIRAL candidates, student pilots, and educational partners.
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-card border border-border/60 shadow-xs space-y-1.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
              <Lock className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-foreground">Client-Side Inference</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Camera feeds and 3D facial landmark meshes are computed locally inside your browser via WebAssembly. Raw video is never stored on our cloud servers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/60 shadow-xs space-y-1.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
              <Eye className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-foreground">Zero Biometric Selling</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We do not sell, rent, or monetize your facial metrics, speech recordings, or transcript logs to third-party advertisers or recruitment brokers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border/60 shadow-xs space-y-1.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary w-fit">
              <Server className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-foreground">User-Controlled Data</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You own your practice performance history. Candidates can view, export, or permanently purge their recorded sessions at any time from the profile settings.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
          
          <Card className="border border-border/60 shadow-xs bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                1. Information We Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong>Webcam & Video Feed:</strong> When you start a practice session, your device's camera stream is passed directly into client-side computer vision models (Google MediaPipe / Fast Vision Canvas) to extract geometric landmark points (eye gaze angles, head orientation, and shoulder stability). This video stream never leaves your local browser memory.
              </p>
              <p>
                <strong>Speech & Microphone Audio:</strong> We process your spoken audio to calculate speaking rate (Words Per Minute), vocal hesitation pauses, and conversational filler word frequencies. Audio recordings are transmitted securely over TLS encryption solely for speech-to-text transcript generation and diagnostic scoring.
              </p>
              <p>
                <strong>Account Data:</strong> If you create a candidate account, we store your name, email, encrypted password hash, and numerical practice scores to power your historical progress trajectory dashboard.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                2. How Information is Used
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>• Generating personalized speech and body language diagnostic reports.</p>
              <p>• Calculating quantifiable before-and-after improvement deltas across sessions.</p>
              <p>• Providing actionable placement, debate, and interview coaching feedback.</p>
              <p>• Powering institutional aggregate performance analytics for college placement cells (anonymized cohort statistics).</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                3. Institutional Pilot & Campus Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                When MIRAL is deployed across university campuses and placement drives, institutional administrators only receive aggregated, cohort-level readiness metrics (e.g. "84% of candidates reached optimal pacing"). Individual practice transcripts remain private to the candidate unless explicitly shared via an exported report.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-foreground">
                4. Contact Our Data Protection Officer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground leading-relaxed">
              <p>
                For questions regarding data processing, privacy compliance, or account deletion requests, reach out directly to our team at <span className="font-mono text-primary font-semibold">privacy@miral.ai</span> or through our <a href="/contact" className="text-primary underline">Contact Portal</a>.
              </p>
            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
