import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LogOut, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Session } from '@shared/schema';

export default function Profile() {
  const [, setLocation] = useLocation();
  const [userName, setUserName] = useState('');
  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const name = sessionStorage.getItem('userName');
    setUserName(name || 'User');
  }, []);

  const { data: sessions } = useQuery<Session[]>({
    queryKey: ['/api/sessions', userId],
    queryFn: async () => {
      // Try fetching with userId first
      let response = await fetch(`/api/sessions?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      let data = await response.json();
      
      // If no sessions found with userId, fetch all sessions (for backward compatibility)
      if (!data || data.length === 0) {
        response = await fetch('/api/sessions');
        if (response.ok) {
          data = await response.json();
        }
      }
      
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
  });

  const stats = {
    totalSessions: sessions?.length || 0,
    avgScore: sessions && sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / sessions.length)
      : 0,
    totalTime: sessions && sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)
      : 0,
    bestScore: sessions && sessions.length > 0
      ? Math.max(...sessions.map(s => s.confidenceScore || 0))
      : 0,
  };

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    window.location.href = '/login';
  };

  const handleExport = () => {
    const exportData = {
      user: { name: userName, id: userId },
      stats,
      sessions,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `miral-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Button
          variant="ghost"
          className="gap-2 mb-6"
          onClick={() => setLocation('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
              <CardTitle className="text-3xl">{userName}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">{stats.totalSessions}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sessions</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats.avgScore}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Avg Score</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalTime}m</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Practice Time</p>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600">{stats.bestScore}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Best Score</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleExport} variant="secondary" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export Data</span>
                  <span className="sm:hidden">Export</span>
                </Button>
                <Button onClick={handleLogout} variant="destructive" className="gap-2 ml-auto">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Exit</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>IoT & Integration Ready</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-2">
                <p>✓ Your data is API-ready for external IoT devices</p>
                <p>✓ All sessions available via REST API with authentication</p>
                <p>✓ Export data for integration with other platforms</p>
                <p>✓ API tokens available for device integration</p>
                <Badge className="mt-2">Coming Soon: Webhook support, Device pairing, MQTT integration</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
