// client/src/components/navigation.tsx
import { Link, useLocation } from "wouter";
import { Video, LayoutDashboard, User, LogOut, LogIn, Sparkles, Compass, Menu, X, ShieldCheck, HelpCircle, Mail } from "lucide-react";
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
    { path: "/learning", label: "Learn", icon: Sparkles },
    { path: "/faq", label: "FAQ", icon: HelpCircle },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="container max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        
        {/* Brand & Nav */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center">
            <MiralLogo width={132} height={34} />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (location === '/' && item.path === '/dashboard');
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`gap-1.5 text-xs font-medium h-8 ${isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
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
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-foreground font-medium">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="h-8 px-2 text-muted-foreground hover:text-destructive"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" variant="default" className="text-xs h-8 font-semibold gap-1.5">
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
            className="lg:hidden h-8 w-8 p-0"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

      </div>

      {/* Mobile Drawer (Visible on screens < lg) */}
      {isMobileOpen && (
        <div className="lg:hidden border-b border-border/60 bg-card p-4 space-y-2 animate-in slide-in-from-top-2 duration-150 shadow-md">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                      isActive 
                        ? 'bg-primary/10 border-primary/30 text-primary font-semibold' 
                        : 'bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
            <Link href="/privacy" onClick={() => setIsMobileOpen(false)} className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" onClick={() => setIsMobileOpen(false)} className="hover:underline">Terms of Service</Link>
            <Link href="/contact" onClick={() => setIsMobileOpen(false)} className="hover:underline">Campus Pilot</Link>
          </div>
        </div>
      )}
    </header>
  );
}
