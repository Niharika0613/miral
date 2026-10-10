// client/src/pages/verify.tsx
import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  ShieldCheck, 
  Award, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/utils/auth';
import type { Session } from '@shared/schema';

export default function VerifyCertificate() {
  const [, params] = useRoute('/verify/:id');
  const [, setLocation] = useLocation();
  const certId = params?.id || 'MIRAL-CERT-SAMPLE';

  // Check if session exists in API (if id was sessionId or has session hash)
  const sessionId = certId.replace('MIRAL-CERT-2026-', '');
  const { data: session } = useQuery<Session>({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId && !sessionId.includes('SAMPLE'),
    retry: 1,
  });

  const currentUser = getCurrentUser();
  const candidateName = (currentUser?.name && currentUser.name !== 'Candidate' && currentUser.name !== 'Verified Speaker')
    ? currentUser.name
    : (localStorage.getItem('userName') || 'Verified Practicing Candidate');

  const topic = session?.topic || 'Speaking & Presentation Practice';
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 my-8">
        
        {/* Verification Status Header */}
        <div className="text-center space-y-2">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-600 bg-emerald-500/5">
            Verified Practice Milestone
          </Badge>
          <h1 className="text-xl font-bold text-foreground">
            MIRAL Certificate Record
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            {certId}
          </p>
        </div>

        {/* Certificate Details Card */}
        <Card className="border border-border/60 shadow-sm bg-card">
          <CardHeader className="border-b border-border/40 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Milestone Record Details
              </CardTitle>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Active Record
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs">
            
            <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                Awarded To
              </span>
              <span className="font-bold text-foreground text-right">{candidateName}</span>
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Practice Track
              </span>
              <span className="font-medium text-foreground text-right max-w-[200px] truncate">{topic}</span>
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Issued Date
              </span>
              <span className="font-medium text-foreground">{issueDate}</span>
            </div>

            <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Issued By
              </span>
              <span className="font-semibold text-foreground">MIRAL Speech & Vision Studio</span>
            </div>

            <div className="flex items-start justify-between gap-3 pb-1">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-primary" />
                Assessment Type
              </span>
              <span className="font-medium text-foreground">Automated Computer Vision & Audio Pacing</span>
            </div>

          </CardContent>
        </Card>

        {/* Honest Disclosure Card */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 text-[11px] text-muted-foreground leading-relaxed text-center space-y-1">
          <p className="font-semibold text-foreground">Authenticity & Scope Notice</p>
          <p>
            This certificate record confirms individual participation and multi-modal metric analysis on the MIRAL AI practice platform. It represents a practice milestone and is not an accredited academic credential or corporate certification.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="flex-1 text-xs font-semibold h-9 gap-1.5"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            MIRAL Home
          </Button>
          <Button 
            className="flex-1 text-xs font-semibold h-9 gap-1.5"
            onClick={() => setLocation('/practice')}
          >
            Practice Studio
          </Button>
        </div>

      </div>
    </div>
  );
}
