// client/src/components/navigation.tsx
import { Link, useLocation } from "wouter";
import { Video, LayoutDashboard, User, LogOut, LogIn, Sparkles, Compass, Menu, X, ShieldCheck, HelpCircle, Mail, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { logout, getCurrentUser } from "@/utils/auth";
import { MiralLogo } from "@/components/miral-logo";

export function Navigation() {
  const [location] = useLocation();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setIsMobileOpen(false); // Close mobile drawer on route change
  }, [location]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/practice", label: "Practice", icon: Video },
    { path: "/scenarios", label: "Scenarios", icon: Compass },
    { path: "/pricing", label: "Plans", icon: Tag },
    { path: "/learning", label: "Learn", icon: Sparkles },
    { path: "/faq", label: "FAQ", icon: HelpCircle },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#05060A]/80 backdrop-blur-xl">
      <div className="container max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        
        {/* Brand & Nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <MiralLogo width={132} height={34} />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1.5 text-xs font-medium h-8 rounded-lg transition-all ${
                      isActive 
                        ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.2)]' 
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : ''}`} />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions: User / Sign In + Theme Toggle + Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-white font-medium hover:bg-white/[0.06] rounded-lg">
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="h-8 px-2 text-slate-400 hover:text-red-400 hover:bg-white/[0.06] rounded-lg"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="text-xs h-8 font-semibold gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0 rounded-lg">
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Button>
            </Link>
          )}

          <ThemeToggle />

          {/* Mobile Menu Hamburger */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/[0.06]"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

      </div>

      {/* Mobile Drawer (Visible on screens < lg) */}
      {isMobileOpen && (
        <div className="lg:hidden border-b border-white/[0.08] bg-[#090b10]/95 backdrop-blur-2xl p-4 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-semibold shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
            <Link href="/privacy" onClick={() => setIsMobileOpen(false)} className="hover:underline hover:text-white">Privacy Policy</Link>
            <Link href="/terms" onClick={() => setIsMobileOpen(false)} className="hover:underline hover:text-white">Terms of Service</Link>
            <Link href="/contact" onClick={() => setIsMobileOpen(false)} className="hover:underline hover:text-white">Campus Pilot</Link>
          </div>
        </div>
      )}
    </header>
  );
}
