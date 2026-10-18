// client/src/components/footer.tsx
import { Link } from "wouter";
import { VaniDarpanLogo } from "@/components/vanidarpan-logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-hairline bg-surface text-text transition-colors print:hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
        
        {/* Main Grid: 5 columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand & Purpose (2 cols wide on desktop) */}
          <div className="col-span-2 space-y-3.5 pr-0 md:pr-4">
            <Link href="/" className="inline-block">
              <VaniDarpanLogo height={32} />
            </Link>
            
            <p className="text-sm text-text leading-relaxed max-w-sm font-normal">
              A private practice mirror for speaking. Students practise in front of the camera and see what they cannot see themselves: eye contact, posture, pace, and speech clarity.
            </p>

            <div className="pt-1 text-xs text-muted leading-normal">
              Your video is analysed on your device and is not uploaded.
            </div>
          </div>

          {/* Student Practice */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink">
              Practice
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/practice" className="hover:text-ink transition-colors">
                  Practice studio
                </Link>
              </li>
              <li>
                <Link href="/scenarios" className="hover:text-ink transition-colors">
                  Scenarios
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-ink transition-colors">
                  Progress
                </Link>
              </li>
              <li>
                <Link href="/learning" className="hover:text-ink transition-colors">
                  Learn
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-ink transition-colors">
                  Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutions & Colleges */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink">
              Colleges
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/tpo" className="hover:text-ink transition-colors font-medium text-darpan-blue">
                  For colleges
                </Link>
              </li>
              <li>
                <Link href="/tpo" className="hover:text-ink transition-colors">
                  Readiness heatmap
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ink transition-colors">
                  Request a pilot
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-ink transition-colors">
                  Verify certificate
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Legal (FAQ, Contact, Privacy, Terms) */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-ink">
              Support & legal
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/faq" className="hover:text-ink transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ink transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ink transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-ink transition-colors">
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Sub-Bar */}
        <div className="border-t border-hairline pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>
            © {currentYear} VaniDarpan (वाणीदर्पण). Built for students and institutions.
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted">
            <Link href="/tpo" className="hover:text-ink transition-colors">
              For colleges
            </Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-ink transition-colors">
              FAQ
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-ink transition-colors">
              Contact
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
