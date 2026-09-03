// client/src/App.tsx
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { useEffect, useState } from "react";
import Practice from "@/pages/practice";
import Dashboard from "@/pages/dashboard";
import Report from "@/pages/report";
import Login from "@/pages/login";
import Profile from "@/pages/profile";
import Scenarios from "@/pages/scenarios";
import LearningResources from "@/pages/learning-resources";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import Pricing from "@/pages/pricing";
import NotFound from "@/pages/not-found";
import { getCurrentUser } from "@/utils/auth";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/practice" component={Practice} />
      <Route path="/scenarios" component={Scenarios} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/learning" component={LearningResources} />
      <Route path="/report/:id" component={Report} />
      <Route path="/profile" component={Profile} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Login} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={FAQ} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAuthPage = location === '/login' || location === '/signup';

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-primary/20">
            <Navigation />
            <main className="flex-1">
              <AppRouter />
            </main>
            {!isAuthPage && <Footer />}
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
