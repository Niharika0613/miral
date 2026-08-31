// client/src/pages/dashboard.tsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Video, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Activity, 
  Sparkles, 
  ArrowRight,
  BarChart3,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Session } from '@shared/schema';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Safe metric extraction helper supporting both camelCase and snake_case API serialization
const getConfidence = (s: any): number => Math.round(s?.confidenceScore ?? s?.confidence_score ?? 0);
const getEyeContact = (s: any): number => Math.round(s?.eyeContactPercentage ?? s?.eye_contact_percentage ?? 0);
const getPosture = (s: any): number => Math.round(s?.postureScore ?? s?.posture_score ?? 0);
const getWpm = (s: any): number => Math.round(s?.wordsPerMinute ?? s?.words_per_minute ?? 0);
const getFillers = (s: any): number => Number(s?.fillerWordsCount ?? s?.filler_words_count ?? 0);
const getDuration = (s: any): number => Number(s?.duration ?? 0);
const getCreatedAt = (s: any): string => s?.createdAt ?? s?.created_at ?? new Date().toISOString();

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const userId = sessionStorage.getItem('userId');
  
  const { data: sessions, isLoading } = useQuery<Session[]>({
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
    refetchOnWindowFocus: true,
  });

  const sessionsList = useMemo(() => {
    return Array.isArray(sessions) ? sessions : [];
  }, [sessions]);

  // Selected session IDs for comparison
  const [baselineId, setBaselineId] = useState<string>('');
  const [currentId, setCurrentId] = useState<string>('');

  // Default comparison to oldest (baseline) vs newest (current)
  const baselineSession = useMemo(() => {
    if (!sessionsList.length) return null;
    if (baselineId) return sessionsList.find(s => s.id === baselineId) || sessionsList[sessionsList.length - 1];
    return sessionsList[sessionsList.length - 1]; // Oldest recorded
  }, [sessionsList, baselineId]);

  const currentSession = useMemo(() => {
    if (!sessionsList.length) return null;
    if (currentId) return sessionsList.find(s => s.id === currentId) || sessionsList[0];
    return sessionsList[0]; // Most recent recorded
  }, [sessionsList, currentId]);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const totalSessions = sessionsList.length;
  const avgConfidence = totalSessions > 0
    ? Math.round(sessionsList.reduce((sum, s) => sum + getConfidence(s), 0) / totalSessions)
    : 0;
  const totalMinutes = totalSessions > 0
    ? Math.round(sessionsList.reduce((sum, s) => sum + getDuration(s), 0) / 60)
    : 0;

  // Chart data sorted chronologically
  const chartData = [...sessionsList]
    .sort((a, b) => new Date(getCreatedAt(a)).getTime() - new Date(getCreatedAt(b)).getTime())
    .slice(-10)
    .map((session, index) => ({
      name: `#${index + 1}`,
      confidence: getConfidence(session),
      eyeContact: getEyeContact(session),
      posture: getPosture(session),
      wpm: getWpm(session),
      date: new Date(getCreatedAt(session)).toLocaleDateString(),
      topic: session.topic || 'Practice Session',
    }));

  // Delta calculations
  const baselineConfidence = baselineSession ? getConfidence(baselineSession) : 0;
  const currentConfidence = currentSession ? getConfidence(currentSession) : 0;
  const confidenceDelta = currentConfidence - baselineConfidence;

  const baselineEye = baselineSession ? getEyeContact(baselineSession) : 0;
  const currentEye = currentSession ? getEyeContact(currentSession) : 0;
  const eyeDelta = currentEye - baselineEye;

  const baselinePosture = baselineSession ? getPosture(baselineSession) : 0;
  const currentPosture = currentSession ? getPosture(currentSession) : 0;
  const postureDelta = currentPosture - baselinePosture;

  const baselineWpm = baselineSession ? getWpm(baselineSession) : 0;
  const currentWpm = currentSession ? getWpm(currentSession) : 0;

  const baselineFillers = baselineSession ? getFillers(baselineSession) : 0;
  const currentFillers = currentSession ? getFillers(currentSession) : 0;
  const fillerDelta = baselineFillers - currentFillers;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="p-6 md:p-8 rounded-xl border border-border/60 bg-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
              <Activity className="h-4 w-4" />
              Communication Analytics Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Candidate Performance & Progress
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track objective non-verbal engagement, vocal pacing, and quantifiable mock interview improvement.
            </p>
          </div>
          <Button 
            className="font-semibold text-xs gap-2 px-4 py-2"
            onClick={() => setLocation('/scenarios')}
          >
            <span>Launch New Session</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-border/60 bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Practice</CardTitle>
              <Video className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">completed sessions</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{avgConfidence} <span className="text-base font-normal text-muted-foreground">/ 100</span></div>
              <p className="text-xs text-muted-foreground mt-1">composite confidence metric</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time Invested</CardTitle>
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalMinutes} <span className="text-base font-normal text-muted-foreground">mins</span></div>
              <p className="text-xs text-muted-foreground mt-1">speaking & practicing</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overall Trajectory</CardTitle>
              <TrendingUp className={`h-4 w-4 ${confidenceDelta >= 0 ? 'text-green-600' : 'text-amber-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-1">
                {confidenceDelta >= 0 ? (
                  <span className="text-green-600 dark:text-green-400">+{confidenceDelta}</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">{confidenceDelta}</span>
                )}
                <span className="text-xs font-normal text-muted-foreground">pts</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">vs initial baseline session</p>
            </CardContent>
          </Card>
        </div>

        {/* Quantifiable Session Comparison Engine */}
        {sessionsList.length >= 2 && baselineSession && currentSession && (
          <Card className="border-2 border-primary/20 bg-card shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                    <ArrowRightLeft className="h-4 w-4" />
                    Comparative Session Analytics
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground mt-0.5">
                    Baseline vs Current Improvement
                  </CardTitle>
                </div>

                {/* Session Selectors */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground font-medium">Baseline:</span>
                    <select 
                      value={baselineId || baselineSession.id} 
                      onChange={(e) => setBaselineId(e.target.value)}
                      className="bg-background border border-border/80 rounded px-2 py-1 text-xs text-foreground font-medium"
                    >
                      {sessionsList.map((s, idx) => (
                        <option key={s.id} value={s.id}>
                          Session #{sessionsList.length - idx}: {s.topic || 'Practice'} ({getConfidence(s)} pts)
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-muted-foreground">vs</span>

                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground font-medium">Current:</span>
                    <select 
                      value={currentId || currentSession.id} 
                      onChange={(e) => setCurrentId(e.target.value)}
                      className="bg-background border border-border/80 rounded px-2 py-1 text-xs text-foreground font-medium"
                    >
                      {sessionsList.map((s, idx) => (
                        <option key={s.id} value={s.id}>
                          Session #{sessionsList.length - idx}: {s.topic || 'Practice'} ({getConfidence(s)} pts)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Eye Contact Delta */}
                <div className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Eye Engagement</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {currentEye}%
                    </span>
                    <span className={`text-xs font-semibold flex items-center ${eyeDelta >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                      {eyeDelta >= 0 ? `+${eyeDelta}%` : `${eyeDelta}%`}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground pt-1">
                    Initial Baseline: {baselineEye}%
                  </div>
                </div>

                {/* Posture Delta */}
                <div className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Posture Alignment</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {currentPosture}%
                    </span>
                    <span className={`text-xs font-semibold flex items-center ${postureDelta >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                      {postureDelta >= 0 ? `+${postureDelta}%` : `${postureDelta}%`}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground pt-1">
                    Initial Baseline: {baselinePosture}%
                  </div>
                </div>

                {/* Pacing WPM Delta */}
                <div className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Speech Pacing</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {currentWpm} <span className="text-xs font-normal text-muted-foreground">WPM</span>
                    </span>
                    <Badge variant="secondary" className="text-[10px] font-normal">
                      {currentWpm >= 125 && currentWpm <= 165 ? 'Optimal Band' : 'Pacing Adjustment'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground pt-1">
                    Initial Baseline: {baselineWpm} WPM
                  </div>
                </div>

                {/* Filler Words Delta */}
                <div className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filler Words Count</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {currentFillers}
                    </span>
                    <span className={`text-xs font-semibold flex items-center ${fillerDelta >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                      {fillerDelta > 0 ? `-${fillerDelta} Less` : fillerDelta === 0 ? 'Constant' : `+${Math.abs(fillerDelta)}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground pt-1">
                    Initial Baseline: {baselineFillers} fillers
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        )}

        {/* Historical Progress Chart */}
        {chartData.length > 0 && (
          <Card className="border border-border/60 bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    Historical Session Trajectory
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Multi-metric progression across your last {Math.min(10, chartData.length)} mock sessions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Confidence</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Eye Contact</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis 
                    dataKey="name" 
                    className="text-[11px]" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    className="text-[11px]" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    name="Confidence Score"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="eyeContact" 
                    name="Eye Contact %"
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Recent Practice History</h2>
            <span className="text-xs text-muted-foreground">{sessionsList.length} total sessions recorded</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {sessionsList.slice(0, 8).map((s) => (
              <Card 
                key={s.id} 
                className="border border-border/60 hover:border-primary/40 bg-card transition-all cursor-pointer shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                onClick={() => setLocation(`/report/${s.id}`)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {s.topic || 'General Practice Session'}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                      {Math.floor(getDuration(s) / 60)}m {getDuration(s) % 60}s
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(getCreatedAt(s)).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px] uppercase">Score</span>
                    <span className="font-bold text-primary text-sm">{getConfidence(s)} / 100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px] uppercase">Eye Contact</span>
                    <span className="font-medium text-foreground">{getEyeContact(s)}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground block text-[10px] uppercase">Pacing</span>
                    <span className="font-medium text-foreground">{getWpm(s)} WPM</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-primary">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
