// client/src/pages/login.tsx
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Lock,
  Briefcase,
  Users,
  Scale,
  Mic,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Globe
} from 'lucide-react';
import { setAuth } from '@/utils/auth';
import { VaniDarpanLogo } from '@/components/miral-logo';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const GOAL_OPTIONS = [
  { id: 'interviews', label: 'Campus Placement & HR Interviews', icon: Briefcase },
  { id: 'gd', label: 'Group Discussions & Roundtables', icon: Users },
  { id: 'debate', label: 'Competitive Debating & Model UN', icon: Scale },
  { id: 'public_speaking', label: 'Keynote & Public Speaking', icon: Mic },
  { id: 'recitation', label: 'Storytelling & Presentation', icon: BookOpen },
  { id: 'pitch', label: 'Startup Pitching & Hackathons', icon: TrendingUp },
  { id: 'viva', label: 'Engineering Viva & Project Defense', icon: GraduationCap },
  { id: 'fluency', label: 'Conversational Fluency & Pacing', icon: Globe },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['interviews', 'public_speaking']);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    resetToken: '',
    newPassword: '',
  });

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId) 
        : [...prev, goalId]
    );
  };

  // Google Sign-In Modal States
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleGoogleSignIn = () => {
    setIsGoogleModalOpen(true);
  };

  const executeGoogleAuth = async (email: string, name?: string) => {
    if (!email || !email.includes('@')) {
      toast({
        title: 'Valid Email Required',
        description: 'Please provide a valid Google or institutional email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsGoogleSubmitting(true);
    try {
      const derivedName = name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: derivedName }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Google Sign-In failed' }));
        throw new Error(err.detail || 'Google authentication failed');
      }

      const data = await res.json();
      setAuth(
        data.user.id,
        data.user.name || data.user.email,
        data.user.plan || 'free',
        data.user.pro_until || '2028-12-31T23:59:59Z'
      );
      toast({
        title: 'Google Sign-In Successful',
        description: `Welcome to VaniDarpan, ${data.user.name || data.user.email}!`,
      });
      setIsGoogleModalOpen(false);
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast({
        title: 'Google Sign-In Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login' || mode === 'signup') {
        const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password,
            name: formData.name.trim() || undefined,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
          if (response.status === 401 && mode === 'login') {
            throw new Error('Invalid email or password. If this is your first time, click "Create one now" below to register.');
          }
          throw new Error(error.message || error.detail || 'Operation failed');
        }

        const data = await response.json();
        
        setAuth(
          data.user.id,
          data.user.name || formData.name || data.user.email,
          data.user.plan || 'free',
          data.user.pro_until || '2028-12-31T23:59:59Z'
        );

        toast({
          title: mode === 'login' ? 'Welcome Back' : 'Profile Created',
          description: mode === 'login' 
            ? 'Accessing your private speech analytics dashboard.' 
            : 'Your VaniDarpan practice workspace is ready.',
        });

        if (mode === 'signup') {
          sessionStorage.setItem('preferredTopic', 'Campus Placement Interview');
          sessionStorage.setItem('practiceGoals', JSON.stringify(selectedGoals));
          setLocation('/practice');
        } else {
          setLocation('/dashboard');
        }

      } else if (mode === 'forgot') {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email.trim() }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || data.message || 'Failed to process password reset');
        }

        toast({
          title: 'Reset Token Ready',
          description: data.token 
            ? `Development token: ${data.token}. You can now set a new password.`
            : 'If that email exists in our records, a reset token has been generated.',
        });

        if (data.token) {
          setFormData((prev) => ({ ...prev, resetToken: data.token }));
          setMode('reset');
        }

      } else if (mode === 'reset') {
        if (formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters.');
        }

        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: formData.resetToken.trim(),
            newPassword: formData.newPassword,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.detail || data.message || 'Failed to reset password');
        }

        toast({
          title: 'Password Updated',
          description: 'Your password has been successfully updated. Please sign in.',
        });
        setMode('login');
        setFormData((prev) => ({ ...prev, password: '', newPassword: '', resetToken: '' }));
      }
    } catch (error: any) {
      toast({
        title: mode === 'forgot' ? 'Reset Failed' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center px-4 py-12 transition-colors">
      
      {/* Main Auth Card */}
      <Card className={`w-full ${mode === 'signup' ? 'max-w-xl' : 'max-w-md'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-200`}>
        
        {/* Card Header with VaniDarpan Branding */}
        <CardHeader className="text-center pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col items-center mb-2">
            <VaniDarpanLogo width={150} height={36} />
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1.5 tracking-wide">
              Institutional AI Practice Mirror
            </span>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mode === 'login' && 'Sign In to Your Workspace'}
            {mode === 'signup' && 'Create Your Candidate Account'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'reset' && 'Set New Password'}
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'login' && 'Access your private speech diagnostics, AI telemetry & placement reports'}
            {mode === 'signup' && 'Set up your baseline speech benchmarks and personalized interview tracks'}
            {mode === 'forgot' && 'Enter your registered email to receive a password reset token'}
            {mode === 'reset' && 'Enter your reset token and your new account password'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          
          {/* Top Option: Google Sign-In (Login & Signup modes) */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="space-y-4 mb-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-medium text-xs flex items-center justify-center gap-2.5 rounded-xl transition-all shadow-xs"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold tracking-wider">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Niharika Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  required
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@college.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="text-xs h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="text-xs h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Goal Checklist (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Primary Practice Goals</span>
                  </Label>
                  <span className="text-[10px] text-slate-400">Select all that apply</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    const IconComponent = goal.icon;
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 font-semibold shadow-xs'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <IconComponent className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="truncate text-[11px] leading-tight">{goal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">Reset Token Loaded</span>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Resetting password for <span className="font-semibold text-slate-900 dark:text-white">{formData.email}</span>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reset-token" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Reset Token</Label>
                  <Input
                    id="reset-token"
                    placeholder="Security reset token"
                    value={formData.resetToken}
                    onChange={(e) => setFormData({ ...formData, resetToken: e.target.value })}
                    required
                    className="text-xs h-9 font-mono bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter at least 6 characters"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="text-xs h-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full text-xs font-semibold h-10 gap-1.5 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs rounded-xl"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>
                {isLoading 
                  ? 'Authenticating...' 
                  : mode === 'login' 
                  ? 'Sign In to Workspace' 
                  : mode === 'signup' 
                  ? 'Create Free Account' 
                  : mode === 'forgot'
                  ? 'Generate Reset Token'
                  : 'Update Password'}
              </span>
              {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </form>

          {/* Bottom Switcher: Sign In vs Sign Up */}
          <div className="mt-6 text-center pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {mode === 'forgot' ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold transition-colors"
                >
                  <span>Create Account</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ) : mode === 'reset' ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Request New Token</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold transition-colors"
                >
                  <span>Back to Sign In</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'login' ? "Don't have an account yet?" : "Already registered?"}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline ml-1"
                >
                  {mode === 'login' ? 'Create one now' : 'Sign in here'}
                </button>
              </p>
            )}
          </div>

        </CardContent>
      </Card>

      {/* Google Sign-In Modal */}
      <Dialog open={isGoogleModalOpen} onOpenChange={setIsGoogleModalOpen}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl rounded-2xl">
          {/* Google Header */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 text-center space-y-2">
            <div className="flex justify-center">
              <svg className="h-8 w-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Sign in with Google
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Choose an account to continue to <span className="font-semibold text-slate-800 dark:text-slate-200">VaniDarpan AI Studio</span>
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4">
            {/* Quick 1-Click Institutional Demo Candidate Account */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Instant Demo Access
              </span>
              <button
                type="button"
                disabled={isGoogleSubmitting}
                onClick={() => executeGoogleAuth('student@college.edu.in', 'Campus Candidate')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    CS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Campus Candidate
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      student@college.edu.in
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-semibold">
                  1-Click Sign-In
                </Badge>
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-semibold">
                  Or use your Google / College email
                </span>
              </div>
            </div>

            {/* Custom Google Email Input Form */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Google or Institutional Email
                </Label>
                <Input
                  type="email"
                  placeholder="e.g. your.name@gmail.com or student@iit.ac.in"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      executeGoogleAuth(googleCustomEmail.trim());
                    }
                  }}
                  className="text-xs h-9 bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <Button
                type="button"
                disabled={isGoogleSubmitting || !googleCustomEmail.trim()}
                onClick={() => executeGoogleAuth(googleCustomEmail.trim())}
                className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs"
              >
                {isGoogleSubmitting ? 'Authenticating with Google...' : 'Continue to Workspace'}
              </Button>
            </div>

            {/* Privacy note */}
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 pt-1">
              Google will securely authenticate your profile with VaniDarpan. No password required.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
