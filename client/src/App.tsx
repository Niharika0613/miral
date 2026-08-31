import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { Navigation } from "@/components/navigation";
import { useEffect, useState } from "react";
import Practice from "@/pages/practice";
import Dashboard from "@/pages/dashboard";
import Report from "@/pages/report";
import Login from "@/pages/login";
import Profile from "@/pages/profile";
import Scenarios from "@/pages/scenarios";
import LearningResources from "@/pages/learning-resources";
import NotFound from "@/pages/not-found";
import { AudioStreamDemo } from "@/components/AudioStreamDemo";

function Router({ userId }: { userId: string | null }) {
  // If not logged in, show only login/signup
  if (!userId) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  // If logged in, show all protected pages
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/practice" component={Practice} />
      <Route path="/report/:id" component={Report} />
      <Route path="/profile" component={Profile} />
      <Route path="/scenarios" component={Scenarios} />
      <Route path="/learning" component={LearningResources} />
      <Route path="/audio-test" component={AudioStreamDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthPage = location === '/login';

  useEffect(() => {
    // Check sessionStorage first (cleared on browser/tab close)
    const sessionUserId = sessionStorage.getItem('userId');
    if (sessionUserId) {
      setUserId(sessionUserId);
    } else {
      // Clear any old localStorage data
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      setUserId(null);
    }
    setIsLoading(false);
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const sessionUserId = sessionStorage.getItem('userId');
      setUserId(sessionUserId);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            {userId && !isAuthPage && <Navigation />}
            <Router userId={userId} />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
