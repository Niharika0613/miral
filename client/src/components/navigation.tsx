// client/src/components/navigation.tsx
import { Link, useLocation } from "wouter";
import { User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { logout, getCurrentUser } from "@/utils/auth";
import { VaniDarpanLogo } from "@/components/miral-logo";

export function Navigation() {
  const [location] = useLocation();
  const [user, setUser] = useState<{ id: string; name: string; plan?: string } | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setIsMobileOpen(false); // Close mobile drawer on route change
  }, [location]);

  // Student bar strictly per DESIGN.md:
  // "Student bar: logo | Practice, Scenarios, Progress, Learn, Plans | account menu.
  // FAQ, Contact, Privacy, Terms and 'For colleges' live in the footer.
  // 'TPO Portal' is not in the student bar."
  const navItems = [
    { path: "/practice", label: "Practice" },
    { path: "/scenarios", label: "Scenarios" },
    { path: "/dashboard", label: "Progress" },
    { path: "/learning", label: "Learn" },
    { path: "/pricing", label: "Plans" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-paper">
      <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Brand & Student Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center shrink-0">
            <VaniDarpanLogo height={34} />
          </Link>

          <nav className="hidden md:flex items-center gap-1" aria-label="Student Navigation">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <span
                    className={`inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer ${
                      isActive
                        ? "text-darpan-blue bg-darpan-blue-tint font-semibold"
                        : "text-text hover:text-ink hover:bg-surface"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: Account Menu / Primary Sign in button */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-text hover:text-ink px-2.5 py-1.5 rounded-[6px] hover:bg-surface transition-colors cursor-pointer">
                  <User className="h-4 w-4 text-darpan-blue" />
                  <span className="max-w-[130px] truncate">{user.name || "Student"}</span>
                  {user.plan === "pro" && (
                    <span className="text-[11px] font-semibold text-brass bg-[#FBF5EC] border border-[#E8D4B4] px-1.5 py-0.5 rounded-[4px]">
                      Pro
                    </span>
                  )}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center h-9 w-9 rounded-[6px] text-muted hover:text-risk hover:bg-surface transition-colors"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link href="/login">
              <Button
                size="sm"
                className="bg-darpan-blue hover:bg-darpan-blue-hover text-white text-sm font-medium h-10 px-4 rounded-[6px] shadow-none transition-colors"
              >
                Sign in
              </Button>
            </Link>
          )}

          <ThemeToggle />

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-[6px] border border-hairline text-ink hover:bg-surface transition-colors"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer (visible on screens < md) */}
      {isMobileOpen && (
        <div className="md:hidden border-b border-hairline bg-paper px-4 py-3 space-y-1">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Student Navigation">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    onClick={() => setIsMobileOpen(false)}
                    className={`px-3 py-2.5 rounded-[6px] text-sm font-medium transition-colors ${
                      isActive
                        ? "text-darpan-blue bg-darpan-blue-tint font-semibold"
                        : "text-text hover:text-ink hover:bg-surface"
                    }`}
                  >
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-hairline flex flex-col gap-2">
            {!user && (
              <Link href="/login">
                <Button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full bg-darpan-blue hover:bg-darpan-blue-hover text-white text-sm font-medium h-10 rounded-[6px] shadow-none"
                >
                  Sign in
                </Button>
              </Link>
            )}
            <div className="flex items-center justify-between text-xs text-muted pt-1 px-1">
              <Link href="/tpo" onClick={() => setIsMobileOpen(false)} className="hover:text-ink">
                For colleges
              </Link>
              <Link href="/faq" onClick={() => setIsMobileOpen(false)} className="hover:text-ink">
                FAQ
              </Link>
              <Link href="/contact" onClick={() => setIsMobileOpen(false)} className="hover:text-ink">
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
