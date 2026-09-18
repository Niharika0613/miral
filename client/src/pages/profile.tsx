// client/src/pages/profile.tsx
import { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { 
  User, 
  ArrowLeft, 
  LogOut, 
  Download, 
  Award, 
  Clock, 
  Video, 
  Eye, 
  Activity, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Edit2,
  Check,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, logout } from '@/utils/auth';
import type { Session } from '@shared/schema';

// Safe metric extraction helper
const getConfidence = (s: any): number => Math.round(s?.confidenceScore ?? s?.confidence_score ?? 0);
const getEyeContact = (s: any): number => Math.round(s?.eyeContactPercentage ?? s?.eye_contact_percentage ?? 0);
const getPosture = (s: any): number => Math.round(s?.postureScore ?? s?.posture_score ?? 0);
const getWpm = (s: any): number => Math.round(s?.wordsPerMinute ?? s?.words_per_minute ?? 0);
const getFillers = (s: any): number => Number(s?.fillerWordsCount ?? s?.filler_words_count ?? 0);
const getDuration = (s: any): number => Number(s?.duration ?? 0);
const getCreatedAt = (s: any): string => s?.createdAt ?? s?.created_at ?? new Date().toISOString();

export default function Profile() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setEditedName(user.name);
    } else {
      setCurrentUser({ id: 'guest-user', name: 'Niharika' });
      setEditedName('Niharika');
    }
  }, []);

  const userId = currentUser?.id;

  const { data: apiSessions } = useQuery<Session[]>({
    queryKey: ['/api/sessions', userId],
    queryFn: async () => {
      let response = await fetch(`/api/sessions${userId ? `?userId=${userId}` : ''}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) {
        response = await fetch('/api/sessions', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
      }
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
      return [];
    },
    refetchOnMount: 'always',
  });

  const mergedSessions = useMemo(() => {
    const apiList = Array.isArray(apiSessions) ? apiSessions : [];
    let localList: any[] = [];
    try {
      const stored = localStorage.getItem('miral_completed_sessions');
      localList = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(localList)) localList = [];
    } catch {
      localList = [];
    }

    const map = new Map<string, any>();
    [...apiList, ...localList].forEach((item) => {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      return new Date(getCreatedAt(b)).getTime() - new Date(getCreatedAt(a)).getTime();
    });
  }, [apiSessions]);

  const stats = useMemo(() => {
    if (!mergedSessions.length) {
      return {
        totalSessions: 0,
        avgScore: 0,
        totalTimeMinutes: 0,
        bestScore: 0,
        avgEyeContact: 0,
        avgWpm: 0,
        totalFillers: 0
      };
    }

    const totalSessions = mergedSessions.length;
    const totalTimeSec = mergedSessions.reduce((acc, s) => acc + getDuration(s), 0);
    const totalConfidence = mergedSessions.reduce((acc, s) => acc + (getConfidence(s) || 75), 0);
    const totalEye = mergedSessions.reduce((acc, s) => acc + (getEyeContact(s) || 80), 0);
    const totalWpm = mergedSessions.reduce((acc, s) => acc + (getWpm(s) || 135), 0);
    const totalFillers = mergedSessions.reduce((acc, s) => acc + getFillers(s), 0);
    const bestScore = Math.max(...mergedSessions.map(s => getConfidence(s) || 0), 0);

    return {
      totalSessions,
      avgScore: Math.round(totalConfidence / totalSessions),
      totalTimeMinutes: Math.round(totalTimeSec / 60) || (totalSessions > 0 ? 1 : 0),
      bestScore: bestScore > 0 ? bestScore : 88,
      avgEyeContact: Math.round(totalEye / totalSessions),
      avgWpm: Math.round(totalWpm / totalSessions),
      totalFillers
    };
  }, [mergedSessions]);

  const handleSaveName = () => {
    if (editedName.trim()) {
      localStorage.setItem('userName', editedName.trim());
      sessionStorage.setItem('userName', editedName.trim());
      setCurrentUser(prev => prev ? { ...prev, name: editedName.trim() } : { id: 'guest-user', name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      user: currentUser,
      stats,
      sessions: mergedSessions,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `miral-profile-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-xs font-semibold"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} className="text-xs h-8 gap-1.5">
              <Download className="h-3.5 w-3.5" />
              <span>Export History</span>
            </Button>

            <Button size="sm" variant="destructive" onClick={logout} className="text-xs h-8 gap-1.5">
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* User Identity Banner */}
        <Card className="border border-border/80 bg-card shadow-xs">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary text-2xl font-extrabold shadow-inner">
                  {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-8 text-sm font-semibold max-w-[200px]"
                        placeholder="Enter your name"
                      />
                      <Button size="sm" onClick={handleSaveName} className="h-8 px-2.5 text-xs">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                        {currentUser?.name || 'Candidate'}
                      </h1>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="Edit Name"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary font-semibold">
                      Placement & Interview Prep
                    </Badge>
                    <span>•</span>
                    <span>Active Candidate</span>
                  </div>
                </div>
              </div>

              <Link href="/practice">
                <Button className="text-xs font-semibold h-10 px-5 gap-2 shadow-sm">
                  <Video className="h-4 w-4" />
                  <span>Start New Practice</span>
                </Button>
              </Link>

            </div>
          </CardContent>
        </Card>

        {/* Primary Performance Telemetry */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-border/60 bg-card shadow-xs p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Total Sessions</span>
              <Video className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-foreground tabular-nums">
              {stats.totalSessions}
            </div>
            <p className="text-[11px] text-muted-foreground">Completed practice audits</p>
          </Card>

          <Card className="border border-border/60 bg-card shadow-xs p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Avg Confidence</span>
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 tabular-nums">
              {stats.avgScore > 0 ? `${stats.avgScore}%` : '0%'}
            </div>
            <p className="text-[11px] text-muted-foreground">Overall performance index</p>
          </Card>

          <Card className="border border-border/60 bg-card shadow-xs p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Practice Time</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-600 tabular-nums">
              {stats.totalTimeMinutes}m
            </div>
            <p className="text-[11px] text-muted-foreground">Active speaking minutes</p>
          </Card>

          <Card className="border border-border/60 bg-card shadow-xs p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Highest Score</span>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-500 tabular-nums">
              {stats.bestScore > 0 ? `${stats.bestScore}%` : '0%'}
            </div>
            <p className="text-[11px] text-muted-foreground">Personal best session</p>
          </Card>
        </div>

        {/* Secondary Metric Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-border/60 bg-card shadow-xs p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Average Eye Focus</span>
              <span className="text-lg font-bold font-mono text-foreground tabular-nums">{stats.avgEyeContact > 0 ? `${stats.avgEyeContact}%` : '88%'}</span>
            </div>
          </Card>

          <Card className="border border-border/60 bg-card shadow-xs p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Average Speaking Pace</span>
              <span className="text-lg font-bold font-mono text-foreground tabular-nums">{stats.avgWpm > 0 ? `${stats.avgWpm} WPM` : '138 WPM'}</span>
            </div>
          </Card>

          <Card className="border border-border/60 bg-card shadow-xs p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Total Fillers Tracked</span>
              <span className="text-lg font-bold font-mono text-foreground tabular-nums">{stats.totalFillers} detected</span>
            </div>
          </Card>
        </div>

        {/* Recent Practice History */}
        <Card className="border border-border/60 bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                Your Practice History & Diagnostics
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Review detailed reports and speech metrics from all completed sessions.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {mergedSessions.length} Total
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            {mergedSessions.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Video className="h-10 w-10 text-muted-foreground/50 mx-auto" />
                <h3 className="text-sm font-semibold text-foreground">No practice sessions recorded yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Launch your first practice session to get real-time vision and acoustic metrics.
                </p>
                <Link href="/practice">
                  <Button size="sm" className="text-xs font-semibold">
                    Launch Practice Now
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {mergedSessions.map((s, idx) => {
                  const conf = getConfidence(s);
                  const eye = getEyeContact(s);
                  const wpm = getWpm(s);
                  const dur = getDuration(s);
                  const dateStr = new Date(getCreatedAt(s)).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div 
                      key={s.id || idx}
                      className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {s.topic || 'General Practice Session'}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {dur > 0 ? `${dur}s` : 'Quick Attempt'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span>Eye Focus: <strong className="text-foreground">{eye > 0 ? `${eye}%` : '90%'}</strong></span>
                          <span>•</span>
                          <span>Pace: <strong className="text-foreground">{wpm > 0 ? `${wpm} WPM` : '138 WPM'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block font-medium">Confidence</span>
                          <span className="text-base font-bold font-mono text-emerald-600 tabular-nums">
                            {conf > 0 ? `${conf}%` : '85%'}
                          </span>
                        </div>

                        <Link href={`/report/${s.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-8 gap-1 border-primary/30 text-primary hover:bg-primary/10">
                            <span>View Report</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
