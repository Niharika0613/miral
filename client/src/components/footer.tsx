// client/src/components/footer.tsx
import { Link } from "wouter";
import { ShieldCheck, Lock, Activity, ArrowRight, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/20 text-foreground transition-colors print:hidden">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand & Mission */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 40" width="110" height="32">
                <defs>
                  <linearGradient id="waveGradFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <rect x="0" y="8" width="6" height="24" rx="3" fill="url(#waveGradFooter)" />
                <rect x="10" y="16" width="6" height="16" rx="3" fill="url(#waveGradFooter)" />
                <rect x="20" y="10" width="6" height="22" rx="3" fill="url(#waveGradFooter)" />
                <rect x="30" y="16" width="6" height="16" rx="3" fill="url(#waveGradFooter)" />
                <rect x="40" y="8" width="6" height="24" rx="3" fill="url(#waveGradFooter)" />
                <text x="56" y="28" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="22" fontWeight="900" fill="currentColor" letterSpacing="-0.5">MIRAL</text>
              </svg>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              The real-time multimodal communication mirror and speech mastery platform. Empowering students, job seekers, and debaters with objective computer vision and vocal pacing diagnostics.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>In-Browser 3D Facial Landmark & Speech Analytics</span>
            </div>
          </div>

          {/* Product Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Practice Tracks</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/scenarios" className="hover:text-primary transition-colors">Campus Placement HR</Link>
              </li>
              <li>
                <Link href="/scenarios" className="hover:text-primary transition-colors">Aviation & Cabin Crew GD</Link>
              </li>
              <li>
                <Link href="/scenarios" className="hover:text-primary transition-colors">Technical SDE Walkthrough</Link>
              </li>
              <li>
                <Link href="/scenarios" className="hover:text-primary transition-colors">Debate & Public Speaking</Link>
              </li>
              <li>
                <Link href="/scenarios" className="hover:text-primary transition-colors">Executive Keynote Pitch</Link>
              </li>
            </ul>
          </div>

          {/* Platform & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">Analytics Dashboard</Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-primary transition-colors">Practice Studio</Link>
              </li>
              <li>
                <Link href="/learning" className="hover:text-primary transition-colors">Learning Resources</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">Frequently Asked Questions</Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Trust & Legal</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">Contact & Campus Pilot</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-Bar */}
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} MIRAL AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-green-600" />
              Client-Side Local Vision Engine
            </span>
            <span>•</span>
            <Link href="/contact" className="hover:underline">University TPO Inquiries</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
