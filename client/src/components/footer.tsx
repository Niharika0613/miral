// client/src/components/footer.tsx
import { Link } from "wouter";
import { ShieldCheck, Lock, Activity, ArrowRight, Heart } from "lucide-react";
import { MiralLogo } from "@/components/miral-logo";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#05060A] text-slate-300 transition-colors print:hidden relative overflow-hidden">
      {/* Subtle Aurora Ambient Glow at bottom */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-600/10 blur-[100px] rounded-full -z-10" />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          
          {/* Brand & Mission */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center">
              <MiralLogo width={120} height={31} />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The real-time multimodal communication mirror and speech mastery platform. Empowering students, job seekers, and debaters with objective computer vision and vocal pacing diagnostics.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>In-Browser 3D Facial Landmark &amp; Speech Analytics</span>
            </div>
          </div>

          {/* Product Tracks */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Practice Tracks</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/scenarios#campus-placement-hr" className="hover:text-indigo-300 transition-colors">Campus Placement HR</Link>
              </li>
              <li>
                <Link href="/scenarios#group-discussion-gd" className="hover:text-indigo-300 transition-colors">Group Discussion (GD)</Link>
              </li>
              <li>
                <Link href="/scenarios#technical-project-defense" className="hover:text-indigo-300 transition-colors">Technical SDE Walkthrough</Link>
              </li>
              <li>
                <Link href="/scenarios#debate-public-speaking" className="hover:text-indigo-300 transition-colors">Debate &amp; Public Speaking</Link>
              </li>
              <li>
                <Link href="/scenarios#executive-pitch" className="hover:text-indigo-300 transition-colors">Executive Keynote Pitch</Link>
              </li>
            </ul>
          </div>

          {/* Platform & Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Platform</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-indigo-300 transition-colors">Analytics Dashboard</Link>
              </li>
              <li>
                <Link href="/practice" className="hover:text-indigo-300 transition-colors">Practice Studio</Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-300 transition-colors">Pricing &amp; Institutional Plans</Link>
              </li>
              <li>
                <Link href="/learning" className="hover:text-indigo-300 transition-colors">Learning Resources</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-indigo-300 transition-colors">Frequently Asked Questions</Link>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Trust &amp; Legal</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/privacy" className="hover:text-indigo-300 transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-300 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-300 transition-colors">Contact &amp; Campus Pilot</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-Bar */}
        <div className="border-t border-white/[0.08] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MIRAL AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <Lock className="h-3 w-3 text-emerald-400" />
              Client-Side Local Vision Engine
            </span>
            <span>•</span>
            <Link href="/contact" className="hover:underline hover:text-white">University TPO Inquiries</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
