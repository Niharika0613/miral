// client/src/components/navigation.tsx
import { Link, useLocation } from "wouter";
import { Video, LayoutDashboard, User, LogOut, LogIn, Sparkles, Compass, Menu, X, Building2, Tag } from "lucide-react";
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
    setIsMobileOpen(false);
  }, [location]);

  const navItems = [
    { path: "/practice", label: "Practice Studio", icon: Video, primary: true },
    { path: "/scenarios", label: "Scenarios", icon: Compass },
    { path: "/dashboard", label: "Analytics", icon: LayoutDashboard },
    { path: "/tpo", label: "TPO Portal", icon: Building2, highlight: true },
    { path: "/pricing", label: "Plans", icon: Tag },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Brand & Main Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <VaniDarpanLogo width={142} height={34} />
          </Link>

          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              if (item.highlight) {
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1.5 text-xs font-semibold h-8 px-3 rounded-full transition-all border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'border-indigo-200 dark:border-indigo-800/70 text-indigo-700 dark:text-indigo-300 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                      }`}
                    >
                      <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{item.label}</span>
                      <span className="text-[9px] bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-200 px-1.5 py-0.2 rounded-full font-bold">
                        Institutional
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
                    className={`gap-1.5 text-xs font-medium h-8 px-3 rounded-lg ${
                      isActive 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8 text-slate-800 dark:text-slate-200 font-medium">
                  <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="hidden sm:inline">{user.name}</span>
                  <Badge variant="secondary" className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 py-0.5 px-2 hidden md:inline-flex">
                    Pro Pilot
                  </Badge>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="h-8 px-2 text-slate-400 hover:text-rose-600"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost" className="text-xs h-8 font-medium text-slate-700 dark:text-slate-300">
                  <span>Sign In</span>
                </Button>
              </Link>
              <Link href="/practice">
                <Button size="sm" className="text-xs h-8 font-semibold gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs">
                  <Video className="h-3.5 w-3.5" />
                  <span>Start Practice</span>
                </Button>
              </Link>
            </div>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <ThemeToggle />

          {/* Mobile Menu Hamburger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden h-8 w-8 p-0 text-slate-600 dark:text-slate-400"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div 
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    isActive 
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' 
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <Badge variant="outline" className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                      Institutional
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
