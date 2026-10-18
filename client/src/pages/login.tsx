// client/src/pages/login.tsx
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Check, 
  ShieldCheck,
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
import { VaniDarpanLogo } from '@/components/vanidarpan-logo';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const GOAL_OPTIONS = [
  { id: 'interviews', label: 'Job and placement interviews', icon: Briefcase },
  { id: 'gd', label: 'Group discussions and roundtables', icon: Users },
  { id: 'debate', label: 'Debates and competitive speaking', icon: Scale },
  { id: 'public_speaking', label: 'Public speaking and keynotes', icon: Mic },
  { id: 'recitation', label: 'Poetry recitation and storytelling', icon: BookOpen },
  { id: 'pitch', label: 'Startup pitching and presentations', icon: TrendingUp },
  { id: 'viva', label: 'College viva and capstone defense', icon: GraduationCap },
  { id: 'fluency', label: 'Everyday spoken English fluency', icon: Globe },
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
        const err = await res.json().catch(() => ({ detail: 'Google sign-in failed' }));
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
        title: 'Sign in successful',
        description: `Welcome back, ${data.user.name || data.user.email}.`,
      });
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast({
        title: 'Sign in error',
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
            throw new Error('Invalid email or password. If this is your first time, click "Create account" below to register.');
          }
          throw new Error(error.detail || error.message || 'Authentication failed');
        }

        const data = await response.json();

        if (mode === 'signup') {
          try {
            localStorage.setItem('vanidarpan_user_goals', JSON.stringify(selectedGoals));
            if (data.user?.id) {
              localStorage.setItem(`vanidarpan_user_goals_${data.user.id}`, JSON.stringify(selectedGoals));
            }
          } catch {}

          toast({
            title: 'Account created',
            description: 'Your account has been created. Please sign in to continue.',
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
            title: 'Sign in successful',
            description: `Welcome back, ${data.user.name || data.user.email}.`,
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
            throw new Error(`No account found for "${emailToReset}". Click "Create account" below to register.`);
          }
          throw new Error(data.detail || data.message || 'Failed to request password reset');
        }

        if (data.resetToken) {
          setFormData((prev) => ({ ...prev, resetToken: data.resetToken }));
        }

        toast({
          title: 'Reset token generated',
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
          title: 'Password updated',
          description: 'Your password has been successfully updated. Please sign in.',
        });
        setMode('login');
        setFormData((prev) => ({ ...prev, password: '', newPassword: '', resetToken: '' }));
      }
    } catch (error: any) {
      toast({
        title: mode === 'forgot' ? 'Reset failed' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4 sm:px-6 font-sans">
      
      {/* Two-Column Card Container */}
      <div className={`w-full ${mode === 'signup' ? 'max-w-4xl' : 'max-w-3xl'} bg-paper border border-hairline rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-sm`}>
        
        {/* Left Column: Brand Panel with Mirror Frame Illustration */}
        <div className="md:col-span-5 bg-surface p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-hairline text-left">
          
          {/* Top: Logo with readable wordmark */}
          <div>
            <Link href="/" className="inline-block">
              <VaniDarpanLogo height={36} showHindi={true} />
            </Link>
          </div>

          {/* Middle: The Mirror Frame Illustration */}
          <div className="my-6">
            <div className="relative bg-studio rounded-lg border border-hairline p-4 aspect-[4/3] flex flex-col justify-between overflow-hidden">
              
              {/* Mirror Frame Viewfinder Markings */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-darpan-blue/80" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-darpan-blue/80" />
                <div className="absolute top-1/2 left-2 -translate-y-1/2 w-0.5 h-3 bg-darpan-blue/80" />
                <div className="absolute top-1/2 right-2 -translate-y-1/2 w-0.5 h-3 bg-darpan-blue/80" />
                
                <div className="absolute top-3 left-3 w-2.5 h-2.5 border-t border-l border-white/20" />
                <div className="absolute top-3 right-3 w-2.5 h-2.5 border-t border-r border-white/20" />
                <div className="absolute bottom-3 left-3 w-2.5 h-2.5 border-b border-l border-white/20" />
                <div className="absolute bottom-3 right-3 w-2.5 h-2.5 border-b border-r border-white/20" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-darpan-blue/80" />
                </div>
              </div>

              {/* Status pill & Eye contact chip */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1B1F26] border border-[#262B35] text-[11px] text-slate-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Camera active</span>
                </div>
                <div className="bg-paper text-ink rounded-md border border-hairline px-2 py-1 text-left">
                  <div className="text-[10px] text-muted leading-tight">Eye contact</div>
                  <div className="text-xs font-semibold tabular-nums text-success">88%</div>
                </div>
              </div>

              {/* Center Speaker Outline */}
              <div className="relative z-0 flex flex-col items-center justify-center my-auto opacity-75">
                <div className="w-12 h-12 rounded-full border border-white/15 bg-white/5 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white/10" />
                </div>
                <div className="w-24 h-6 mt-1 rounded-t-full bg-white/5 border-t border-white/15" />
              </div>

              {/* Pace & Fillers metric chips */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="bg-paper text-ink rounded-md border border-hairline px-2 py-1 text-left">
                  <div className="text-[10px] text-muted leading-tight">Pace</div>
                  <div className="text-xs font-semibold tabular-nums text-ink">142 wpm</div>
                </div>
                <div className="bg-paper text-ink rounded-md border border-hairline px-2 py-1 text-left">
                  <div className="text-[10px] text-muted leading-tight">Fillers</div>
                  <div className="text-xs font-semibold tabular-nums text-caution">2 detected</div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom: One short promise line & privacy guarantee */}
          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium text-ink leading-snug">
              See what you cannot see when you speak.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-darpan-blue shrink-0" strokeWidth={1.75} />
              <span>Your video is analysed on your device and is not uploaded.</span>
            </div>
          </div>

        </div>

        {/* Right Column: Form Panel */}
        <div className="md:col-span-7 p-6 sm:p-8 bg-paper flex flex-col justify-center text-left">
          
          <div className="space-y-1 mb-6">
            <h1 className="text-2xl font-semibold tracking-[-0.01em] text-ink">
              {mode === 'login' && 'Sign in to your account'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
              {mode === 'reset' && 'Set new password'}
            </h1>
            <p className="text-sm text-muted">
              {mode === 'login' && 'Enter your email and password to access your practice history and reports.'}
              {mode === 'signup' && 'Set up your account to save practice sessions and track your progress.'}
              {mode === 'forgot' && 'Enter your registered email to receive a password reset token.'}
              {mode === 'reset' && 'Enter your security reset token and new password.'}
            </p>
          </div>

          {/* Google Sign-In */}
          {(mode === 'login' || mode === 'signup') && (
            <div className="space-y-4 mb-5">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-10 bg-paper hover:bg-surface border-hairline text-ink font-medium text-sm flex items-center justify-center gap-2.5 rounded-md transition-colors"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
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
                  <span className="w-full border-t border-hairline" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-paper px-3 text-muted">or</span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium text-ink">Full name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Niharika Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 text-sm bg-paper border-hairline text-ink rounded-md focus:border-darpan-blue"
                  required
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-ink">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@college.edu.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="h-10 text-sm bg-paper border-hairline text-ink rounded-md focus:border-darpan-blue"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-ink">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-darpan-blue hover:underline font-medium"
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
                  className="h-10 text-sm bg-paper border-hairline text-ink rounded-md focus:border-darpan-blue"
                />
              </div>
            )}

            {/* Goal Checklist (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2 pt-2 border-t border-hairline">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-ink">
                    What would you like to practice?
                  </Label>
                  <span className="text-[11px] text-muted">Select goals</span>
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
                        className={`flex items-center gap-2 p-2.5 rounded-md border text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-darpan-blue-tint border-darpan-blue text-darpan-blue font-medium'
                            : 'bg-paper border-hairline text-text hover:border-gray-300'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-sm flex items-center justify-center border shrink-0 ${
                          isSelected 
                            ? 'bg-darpan-blue border-darpan-blue text-white' 
                            : 'border-hairline bg-paper'
                        }`}>
                          {isSelected && <Check className="h-3 w-3" strokeWidth={2.5} />}
                        </div>
                        <IconComponent className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.75} />
                        <span className="truncate text-xs">{goal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="p-3.5 rounded-md bg-darpan-blue-tint border border-darpan-blue/20 space-y-1 text-left">
                  <span className="text-xs font-semibold text-darpan-blue">Reset token loaded</span>
                  <p className="text-xs text-text">
                    Resetting credentials for {formData.email}. Please set your new password below.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reset-token" className="text-xs font-medium text-ink">Security reset token</Label>
                  <Input
                    id="reset-token"
                    placeholder="Security reset token"
                    value={formData.resetToken}
                    onChange={(e) => setFormData({ ...formData, resetToken: e.target.value })}
                    required
                    className="h-10 text-sm bg-paper border-hairline text-ink rounded-md focus:border-darpan-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-medium text-ink">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    minLength={6}
                    className="h-10 text-sm bg-paper border-hairline text-ink rounded-md focus:border-darpan-blue"
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 text-sm font-medium rounded-md bg-darpan-blue text-white hover:bg-darpan-blue-hover transition-colors"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <span>
                {isLoading 
                  ? 'Signing in...' 
                  : mode === 'login' 
                  ? 'Sign in' 
                  : mode === 'signup' 
                  ? 'Create account' 
                  : mode === 'forgot'
                  ? 'Send reset token'
                  : 'Update password'}
              </span>
            </Button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 text-center pt-4 border-t border-hairline">
            {mode === 'forgot' ? (
              <div className="flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-muted hover:text-ink font-medium transition-colors"
                >
                  Back to sign in
                </button>
                <span className="text-muted">•</span>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-darpan-blue hover:underline font-medium transition-colors"
                >
                  Create account
                </button>
              </div>
            ) : mode === 'reset' ? (
              <div className="flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-muted hover:text-ink font-medium transition-colors"
                >
                  Request new token
                </button>
                <span className="text-muted">•</span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-darpan-blue hover:underline font-medium transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted">
                {mode === 'login' ? "Don't have an account?" : "Already registered?"}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-medium text-darpan-blue hover:underline ml-1"
                >
                  {mode === 'login' ? 'Create account' : 'Sign in'}
                </button>
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
