// client/src/components/navigation.tsx
import { Link, useLocation } from "wouter";
import { 
  Video, 
  LayoutDashboard, 
  User, 
  LogOut, 
  LogIn, 
  Sparkles, 
  Compass, 
  Menu, 
  X, 
  HelpCircle, 
  Mail, 
  Tag, 
  Building2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { logout, getCurrentUser } from "@/utils/auth";
import { VaniDarpanLogo } from "@/components/miral-logo";

export function Navigation() {
  const [location] = useLocation();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setIsMobileOpen(false); // Close mobile drawer on route change
  }, [location]);

  const navItems = [
    { path: "/practice", label: "Practice", icon: Video, isPrimary: true },
    { path: "/scenarios", label: "Scenarios", icon: Compass },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/tpo", label: "TPO Portal", icon: Building2, isTpo: true },
    { path: "/pricing", label: "Plans", icon: Tag },
    { path: "/learning", label: "Learn", icon: Sparkles },
    { path: "/faq", label: "FAQ", icon: HelpCircle },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md transition-colors">
      <div className="container max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        
        {/* Brand & Desktop Navigation */}
        <div className="flex items-center gap-5 sm:gap-7">
          <Link href="/" className="flex items-center">
            <VaniDarpanLogo width={140} height={34} />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              if (item.isTpo) {
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "secondary" : "outline"}
                      size="sm"
                      className={`gap-1.5 text-xs font-semibold h-8 px-2.5 rounded-md border transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{item.label}</span>
                      <span className="text-[9px] bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200 px-1 rounded-sm font-bold">
                        Pilot
                      </span>
                    </Button>
                  </Link>
                );
              }

              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`gap-1.5 text-xs font-medium h-8 px-2.5 ${
                      isActive 
                        ? 'bg-muted text-foreground font-semibold' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-foreground font-medium">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">{user.name}</span>
                  <Badge variant="secondary" className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/25 py-0.5 px-2 hidden md:inline-flex">
                    Pro Pilot • Extended Access
                  </Badge>
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
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-xs h-8 font-medium">
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/practice">
                <Button size="sm" className="text-xs h-8 font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                  <Video className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Start Practice</span>
                  <span className="sm:hidden">Practice</span>
                </Button>
              </Link>
            </div>
          )}

          <ThemeToggle />

          {/* Mobile Menu Hamburger */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0 text-slate-600 dark:text-slate-400"
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
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      isActive 
                        ? 'bg-primary/10 border-primary/30 text-primary font-semibold' 
                        : 'bg-muted/30 border-border/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.isTpo && (
                      <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1 rounded font-bold">
                        TPO
                      </span>
                    )}
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
