// client/src/pages/login.tsx
import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { setAuth } from '@/utils/auth';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
        if (response.status === 422) {
          const detail = error.detail || error.message || 'Invalid input parameters';
          const errorMsg = Array.isArray(detail) 
            ? detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join('; ')
            : detail;
          throw new Error(errorMsg || 'Please check your input details');
        }
        throw new Error(error.message || error.detail || 'Authentication failed');
      }

      const data = await response.json();

      if (isLogin) {
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
        
        setIsLogin(true);
        setFormData({ email: '', password: '', name: '' });
      }
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
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
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono text-lg font-bold mb-2">
              M
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">MIRAL AI</span>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            {isLogin ? 'Sign In to Your Workspace' : 'Create Candidate Account'}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {isLogin ? 'Access your private speech metrics and practice session history' : 'Start your objective interview & communication practice'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-foreground">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Niharika Pandey"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-9"
                  required
                />
              </div>
            )}

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

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">Password</Label>
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

            <Button
              type="submit"
              className="w-full text-xs font-semibold h-9 gap-1.5 mt-2"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isLoading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}</span>
              {!isLoading && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </form>

          <div className="mt-6 text-center pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              {isLogin ? "Don't have an account yet?" : "Already registered?"}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-primary hover:underline ml-1"
              >
                {isLogin ? 'Create one now' : 'Sign in here'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
