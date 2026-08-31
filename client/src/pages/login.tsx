import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

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
        // Handle 422 validation errors
        if (response.status === 422) {
          const detail = error.detail || error.message || 'Invalid input data';
          const errorMsg = Array.isArray(detail) 
            ? detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join('; ')
            : detail;
          throw new Error(errorMsg || 'Please check your input and try again');
        }
        throw new Error(error.message || error.detail || 'Authentication failed');
      }

      const data = await response.json();

      if (isLogin) {
        // Login successful - store user and redirect to dashboard
        sessionStorage.setItem('userId', data.user.id);
        sessionStorage.setItem('userName', data.user.name || data.user.email);
        
        toast({
          title: 'Welcome Back!',
          description: 'Logged in successfully',
        });
        
        window.location.href = '/dashboard';
      } else {
        // Signup successful - show message and redirect to login
        toast({
          title: 'Account Created!',
          description: 'Your account has been created. Please log in to continue.',
        });
        
        // Switch to login view
        setIsLogin(true);
        // Clear form
        setFormData({ email: '', password: '', name: '' });
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
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
              <img src="/logo.png" alt="MIRAL AI" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-4xl font-bold">MIRAL AI</h1>
          </div>
          <CardTitle className="text-2xl">{isLogin ? 'Welcome Back' : 'Get Started'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to continue your practice journey' : 'Create your MIRAL account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-semibold text-primary hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
