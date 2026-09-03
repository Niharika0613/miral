// client/src/pages/login.tsx
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import { setAuth } from '@/utils/auth';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    resetToken: '',
    newPassword: '',
  });

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
          throw new Error(error.detail || error.message || 'Authentication failed');
        }

        const data = await response.json();

        if (mode === 'login') {
          setAuth(data.user.id, data.user.name || data.user.email);
          toast({
            title: 'Authentication Successful',
            description: `Welcome back, ${data.user.name || data.user.email}`,
          });
          window.location.href = '/dashboard';
        } else {
          toast({
            title: 'Account Registered',
            description: 'Your account has been created. Please sign in to continue.',
          });
          setMode('login');
          setFormData({ ...formData, password: '' });
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
      <Card className="w-full max-w-md border border-border/80 shadow-lg bg-card">
        <CardHeader className="text-center pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex flex-col items-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 40" width="110" height="32">
              <defs>
                <linearGradient id="waveGradLogin" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <rect x="0" y="8" width="6" height="24" rx="3" fill="url(#waveGradLogin)" />
              <rect x="10" y="16" width="6" height="16" rx="3" fill="url(#waveGradLogin)" />
              <rect x="20" y="10" width="6" height="22" rx="3" fill="url(#waveGradLogin)" />
              <rect x="30" y="16" width="6" height="16" rx="3" fill="url(#waveGradLogin)" />
              <rect x="40" y="8" width="6" height="24" rx="3" fill="url(#waveGradLogin)" />
              <text x="56" y="28" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontSize="22" fontWeight="900" fill="currentColor" letterSpacing="-0.5">MIRAL</text>
            </svg>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {mode === 'login' && 'Sign In to Your Workspace'}
            {mode === 'signup' && 'Create Candidate Account'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'reset' && 'Set New Password'}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {mode === 'login' && 'Access your private speech metrics and practice session history'}
            {mode === 'signup' && 'Start your objective interview & communication practice'}
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
                  placeholder="e.g. Candidate Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-9"
                  required
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">Institutional / Personal Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="candidate@university.edu"
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
                  ? 'Create Account' 
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
