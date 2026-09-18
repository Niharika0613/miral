import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import { setAuth } from '@/utils/auth';
import { MiralLogo } from '@/components/miral-logo';

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
          if (response.status === 401 && mode === 'login') {
            throw new Error('Invalid email or password. If this is your first time, please click "Create one now" below to register.');
          }
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
    <div className="min-h-screen bg-[#05060A] flex items-center justify-center relative overflow-hidden px-4 py-12">

      {/* Aurora background blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[55%] w-[350px] h-[350px] rounded-full bg-cyan-500/10 blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Card wrapper with glow ring */}
      <div className="relative w-full max-w-md">
        {/* Gradient glow ring behind card */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 blur-2xl -z-10" />

        {/* Glass login card */}
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_0_80px_rgba(99,102,241,0.15)] w-full p-8 sm:p-10">

          {/* Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <MiralLogo width={124} height={32} />
            <h1 className="mt-5 text-xl font-bold tracking-tight text-white">
              {mode === 'login' && 'Sign In to Your Workspace'}
              {mode === 'signup' && 'Create Candidate Account'}
              {mode === 'forgot' && 'Reset Your Password'}
              {mode === 'reset' && 'Set New Password'}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {mode === 'login' && 'Access your private speech metrics and practice session history'}
              {mode === 'signup' && 'Start your objective interview & communication practice'}
              {mode === 'forgot' && 'Enter your registered email to receive a password reset token'}
              {mode === 'reset' && 'Enter your reset token and your new account password'}
            </p>
          </div>

          <div className="w-full h-px bg-white/[0.08] mb-6" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  id="name"
                  placeholder="e.g. Candidate Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 rounded-lg px-3 text-sm bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                  required
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-semibold text-slate-300">Institutional / Personal Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="candidate@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full h-10 rounded-lg px-3 text-sm bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full h-10 rounded-lg px-3 text-sm bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                />
              </div>
            )}

            {mode === 'reset' && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="reset-token" className="block text-xs font-semibold text-slate-300">15-Minute Reset Token</label>
                  <input
                    id="reset-token"
                    placeholder="Paste reset token"
                    value={formData.resetToken}
                    onChange={(e) => setFormData({ ...formData, resetToken: e.target.value })}
                    required
                    className="w-full h-10 rounded-lg px-3 text-sm font-mono bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="block text-xs font-semibold text-slate-300">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    placeholder="Enter strong new password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    className="w-full h-10 rounded-lg px-3 text-sm bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
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
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-center space-y-2">
            {(mode === 'forgot' || mode === 'reset') ? (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </button>
            ) : (
              <p className="text-xs text-slate-500">
                {mode === 'login' ? "Don't have an account yet?" : "Already registered?"}{' '}
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 ml-1 transition-colors"
                >
                  {mode === 'login' ? 'Create one now' : 'Sign in here'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

