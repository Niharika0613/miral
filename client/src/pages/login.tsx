// client/src/pages/login.tsx
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles,
  Briefcase,
  Users,
  Scale,
  Mic,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Globe,
  Mail,
  Lock,
  UserCheck
} from 'lucide-react';
import { setAuth } from '@/utils/auth';
import { MiralLogo } from '@/components/miral-logo';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const GOAL_OPTIONS = [
  { id: 'interviews', label: 'Job & Campus Placement Interviews', icon: Briefcase },
  { id: 'gd', label: 'Group Discussions (GD) & Roundtables', icon: Users },
  { id: 'debate', label: 'Debates & Competitive Speaking', icon: Scale },
  { id: 'public_speaking', label: 'Public Speaking & Keynotes', icon: Mic },
  { id: 'recitation', label: 'Poetry Recitation & Storytelling', icon: BookOpen },
  { id: 'pitch', label: 'Startup Pitching & Presentations', icon: TrendingUp },
  { id: 'viva', label: 'College Viva & Capstone Defense', icon: GraduationCap },
  { id: 'fluency', label: 'Everyday English Fluency & Accent', icon: Globe },
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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const email = prompt("Enter your Google Account email (e.g. your.name@gmail.com or @college.edu.in):", "student@college.edu.in");
      if (!email || !email.includes('@')) {
        setIsLoading(false);
        return;
      }
      const derivedName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: derivedName }),
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
        data.user.pro_until || '2026-10-31T23:59:59Z'
      );
      toast({
        title: 'Google Sign-In Successful',
        description: `Welcome back, ${data.user.name || data.user.email}!`,
      });
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast({
        title: 'Google Sign-In Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
          throw new Error(error.detail || error.message || 'Authentication failed');
        }

        const data = await response.json();

        if (mode === 'signup') {
          try {
            localStorage.setItem('miral_user_goals', JSON.stringify(selectedGoals));
            if (data.user?.id) {
              localStorage.setItem(`miral_user_goals_${data.user.id}`, JSON.stringify(selectedGoals));
            }
          } catch {}

          toast({
            title: 'Account Registered',
            description: 'Your account and learning goals have been set! Please sign in to continue.',
          });
          setMode('login');
          setFormData({ ...formData, password: '' });
        } else {
          setAuth(
            data.user.id, 
            data.user.name || data.user.email,
            data.user.plan || 'free',
            data.user.pro_until || '2026-10-31T23:59:59Z'
          );
          toast({
            title: 'Authentication Successful',
            description: `Welcome back, ${data.user.name || data.user.email}`,
          });
          window.location.href = '/dashboard';
        }
      } else if (mode === 'forgot') {
        const emailToReset = formData.email.trim();
        if (!emailToReset) {
          throw new Error('Please enter your email address to generate a reset token.');
        }

        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToReset }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`No account found for "${emailToReset}". Click "Create Account" below to register.`);
          }
          throw new Error(data.detail || data.message || 'Failed to request password reset');
        }

        if (data.resetToken) {
          setFormData((prev) => ({ ...prev, resetToken: data.resetToken }));
        }

        toast({
          title: 'Reset Token Generated',
          description: data.message || 'Security reset token loaded. Please enter your new password.',
        });
        setMode('reset');
      } else if (mode === 'reset') {
        if (!formData.resetToken.trim()) {
          throw new Error('Reset token is required. Please generate a token first.');
        }
        if (!formData.newPassword || formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long.');
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
    <div className="min-h-screen bg-[#05060A] text-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Aurora Ambient Glow Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Auth Card */}
      <Card className={`w-full ${mode === 'signup' ? 'max-w-xl' : 'max-w-md'} relative z-10 bg-[#090D1A]/85 backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_0_80px_rgba(99,102,241,0.18)] transition-all duration-300`}>
        
        {/* Card Header with VaniDarpan Branding */}
        <CardHeader className="text-center pb-5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex flex-col items-center mb-3">
            <MiralLogo width={138} height={36} />
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400/90 mt-1">
              वाणीदर्पण • Institutional AI Mirror
            </span>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-white">
            {mode === 'login' && 'Sign In to Your Workspace'}
            {mode === 'signup' && 'Create Your Speaker Profile'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'reset' && 'Set New Password'}
          </CardTitle>
          <CardDescription className="text-xs text-slate-400 mt-1">
            {mode === 'login' && 'Access your private speech diagnostics, AI telemetry & placement reports'}
            {mode === 'signup' && 'Set up your AI speech benchmarks and personalized learning targets'}
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
                className="w-full h-10 bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2.5 rounded-xl transition-all shadow-sm"
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
                  <span className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-[#090D1A] px-2 text-slate-400 font-semibold tracking-wider">
                    Or continue with email
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Direct Email Registration / Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-200">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Niharika Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-9 bg-white/[0.04] border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/60"
                  required
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-200">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@college.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="text-xs h-9 bg-white/[0.04] border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/60"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-200">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
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
                  className="text-xs h-9 bg-white/[0.04] border-white/[0.1] text-white placeholder:text-slate-500 focus:border-indigo-500/60"
                />
              </div>
            )}

            {/* Goal Checklist (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Why do you want to use VaniDarpan?</span>
                  </Label>
                  <span className="text-[10px] text-slate-400">Select target goals</span>
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
                            ? 'bg-indigo-500/15 border-indigo-500/50 text-white font-semibold shadow-xs'
                            : 'bg-white/[0.02] border-white/[0.06] text-slate-400 hover:border-white/20 hover:text-slate-200'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 ${
                          isSelected 
                            ? 'bg-indigo-600 border-indigo-500 text-white' 
                            : 'border-slate-600 bg-black/40'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <IconComponent className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span className="truncate text-[11px] leading-tight">{goal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">Reset Token Active</span>
                    <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">15m expiry</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Resetting credentials for <span className="font-semibold text-indigo-200">{formData.email}</span>. Your security token has been loaded below.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reset-token" className="text-xs font-semibold text-slate-200">Security Reset Token</Label>
                    <span className="text-[10px] text-emerald-400 font-mono">Token Loaded</span>
                  </div>
                  <Input
                    id="reset-token"
                    placeholder="Paste security reset token"
                    value={formData.resetToken}
                    onChange={(e) => setFormData({ ...formData, resetToken: e.target.value })}
                    required
                    className="text-xs h-9 font-mono bg-white/[0.04] border-white/[0.1] text-indigo-300 placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-semibold text-slate-200">New Account Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter at least 6 characters"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="text-xs h-9 bg-white/[0.04] border-white/[0.1] text-white placeholder:text-slate-500"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full text-xs font-semibold h-10 gap-1.5 mt-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>
                {isLoading 
                  ? 'Authenticating...' 
                  : mode === 'login' 
                  ? 'Sign In to Workspace' 
                  : mode === 'signup' 
                  ? 'Create Free Account & Save Goals' 
                  : mode === 'forgot'
                  ? 'Generate Reset Token'
                  : 'Update Password'}
              </span>
              {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </form>

          {/* Bottom Switcher: Sign In vs Sign Up */}
          <div className="mt-6 text-center pt-4 border-t border-white/[0.08] space-y-2">
            {mode === 'forgot' ? (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </button>
                <span className="text-slate-600 text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
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
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Request New Token</span>
                </button>
                <span className="text-slate-600 text-xs">•</span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  <span>Back to Sign In</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                {mode === 'login' ? "Don't have an account yet?" : "Already registered?"}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline ml-1"
                >
                  {mode === 'login' ? 'Create one now' : 'Sign in here'}
                </button>
              </p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
