import { Link, useLocation } from "wouter";
import { Video, LayoutDashboard, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect, useState } from "react";
import { logout } from "@/utils/auth";

export function Navigation() {
  const [location] = useLocation();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('userId');
    const name = sessionStorage.getItem('userName');
    setUserId(id);
    setUserName(name || '');
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/practice", label: "Practice", icon: Video },
    { path: "/scenarios", label: "Scenarios", icon: LayoutDashboard },
    { path: "/learning", label: "Learn", icon: LayoutDashboard },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full overflow-hidden">
              <img src="/logo.png" alt="MIRAL AI" className="h-full w-full object-cover" />
            </div>
            <span className="hidden sm:inline text-lg font-semibold">MIRAL</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (location === '/' && item.path === '/dashboard');
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="gap-2"
                    data-testid={`link-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {userId && (
            <>
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">{userName}</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
