// client/src/pages/login.tsx
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, KeyRound, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { setAuth } from '@/utils/auth';
import { MiralLogo } from '@/components/miral-logo';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

const GOAL_OPTIONS = [
  { id: 'interviews', label: 'Job & Campus Placement Interviews', icon: '💼' },
  { id: 'gd', label: 'Group Discussions (GD) & Roundtables', icon: '🗣️' },
  { id: 'debate', label: 'Debates & Competitive Speaking', icon: '⚡' },
  { id: 'public_speaking', label: 'Public Speaking & Keynotes', icon: '🎙️' },
  { id: 'recitation', label: 'Poetry Recitation & Storytelling', icon: '🎭' },
  { id: 'pitch', label: 'Startup Pitching & Presentations', icon: '🚀' },
  { id: 'viva', label: 'College Viva & Capstone Defense', icon: '🎓' },
  { id: 'fluency', label: 'Everyday English Fluency & Accent', icon: '🌐' },
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
            email: formData.email,
            password: formData.password,
            name: formData.name,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
          if (response.status === 401 && mode === 'login') {
            throw new Error('Invalid email or password. If this is your first time, please click "Create one now" below to register.');
          }
          throw new Error(error.detail || error.message || 'Authentication failed');
        }

        const data = await response.json();

        if (mode === 'signup') {
          // Store selected onboarding goals for user
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
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to request password reset');
        }

        if (data.resetToken) {
          setFormData((prev) => ({ ...prev, resetToken: data.resetToken }));
        }

        toast({
          title: 'Reset Token Generated',
          description: data.message || 'Please enter your reset code and new password.',
        });
        setMode('reset');
      } else if (mode === 'reset') {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: formData.resetToken,
            newPassword: formData.newPassword,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || 'Failed to reset password');
        }

        toast({
          title: 'Password Updated',
          description: 'Your password has been updated. Please sign in.',
        });
        setMode('login');
        setFormData({ ...formData, password: '', newPassword: '', resetToken: '' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className={`w-full ${mode === 'signup' ? 'max-w-lg' : 'max-w-md'} border border-border/80 shadow-lg bg-card transition-all duration-200`}>
        <CardHeader className="text-center pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex flex-col items-center mb-3">
            <MiralLogo width={124} height={32} />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === 'login' && 'Sign In to Your Workspace'}
            {mode === 'signup' && 'Create Your Speaker Profile'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'reset' && 'Set New Password'}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {mode === 'login' && 'Access your private speech metrics and practice session history'}
            {mode === 'signup' && 'Set up your personalized communication & speech practice goals'}
            {mode === 'forgot' && 'Enter your registered email to receive a password reset token'}
            {mode === 'reset' && 'Enter your reset token and your new account password'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Your Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-9"
                  required
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="text-xs h-9"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">Password</Label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-primary hover:underline font-medium"
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
                  className="text-xs h-9"
                />
              </div>
            )}

            {/* Checklist: Why do you want to use MIRAL? (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Why do you want to use MIRAL?</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Select all that apply</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {GOAL_OPTIONS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-primary/10 border-primary/50 text-foreground font-semibold shadow-xs'
                            : 'bg-muted/20 border-border/50 text-muted-foreground hover:border-border hover:text-foreground'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 ${
                          isSelected 
                            ? 'bg-primary border-primary text-primary-foreground' 
                            : 'border-muted-foreground/40 bg-background'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="text-sm shrink-0">{goal.icon}</span>
                        <span className="truncate text-[11px] leading-tight">{goal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="reset-token" className="text-xs font-semibold text-foreground">15-Minute Reset Token</Label>
                  <Input
                    id="reset-token"
                    placeholder="Paste reset token"
                    value={formData.resetToken}
                    onChange={(e) => setFormData({ ...formData, resetToken: e.target.value })}
                    required
                    className="text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-semibold text-foreground">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter strong new password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    className="text-xs h-9"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full text-xs font-semibold h-9 gap-1.5 mt-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>
                {isLoading 
                  ? 'Processing...' 
                  : mode === 'login' 
                  ? 'Sign In' 
                  : mode === 'signup' 
                  ? 'Create Account & Save Goals' 
                  : mode === 'forgot'
                  ? 'Generate Reset Token'
                  : 'Update Password'}
              </span>
              {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-border/40 space-y-2">
            {(mode === 'forgot' || mode === 'reset') ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </button>
            ) : (
              <p className="text-xs text-muted-foreground">
                {mode === 'login' ? "Don't have an account yet?" : "Already registered?"}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-semibold text-primary hover:underline ml-1"
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
