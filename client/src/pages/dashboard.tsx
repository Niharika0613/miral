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
    const apiList = Array.isArray(sessions) ? sessions : [];
    let localList: any[] = [];
    try {
      const stored = localStorage.getItem('miral_completed_sessions');
      localList = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(localList)) localList = [];
    } catch {
      localList = [];
    }
    
    // Merge both, deduplicate by session ID, latest first
    const map = new Map<string, any>();
    [...apiList, ...localList].forEach((item) => {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, item);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(getCreatedAt(b)).getTime() - new Date(getCreatedAt(a)).getTime()
    );
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
    <div className="min-h-screen bg-[#05060A] text-slate-100 relative overflow-x-hidden">
      {/* Aurora background blobs */}
      <div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden">
        <div className="aurora-blob-1 absolute top-[-120px] left-[-100px] w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="aurora-blob-2 absolute top-[30%] right-[-140px] w-[480px] h-[480px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="aurora-blob-3 absolute bottom-[-80px] left-[35%] w-[440px] h-[440px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>
      <div className="container max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome & Hero Banner */}
        <div data-reveal className="p-6 md:p-8 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-[0_0_40px_rgba(99,102,241,0.08)] space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Multi-Modal AI Mirror for Public Speaking &amp; Communication</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Master Public Speaking &amp; Communication Delivery
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Objective real-time 3D eye gaze tracking, posture alignment, vocal pacing calibration, and bilingual hesitation control — 100% private in your browser.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
              <Button 
                className="w-full sm:w-auto font-semibold text-xs gap-2 h-9 px-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0 transition-all"
                onClick={() => setLocation('/practice')}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Start Practice Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              <Button 
                variant="outline"
                className="w-full sm:w-auto font-semibold text-xs gap-2 h-9 px-4 border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 transition-all"
                onClick={() => setLocation('/login')}
              >
                <span>Candidate Sign In</span>
              </Button>
            </div>
          </div>

          {/* Quick Capability Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-white/[0.06]">
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-0.5 text-xs">
              <span className="font-bold text-white block">3D Iris Tracking</span>
              <p className="text-[11px] text-slate-400">478-point facial mesh via WebAssembly</p>
            </div>
            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 space-y-0.5 text-xs">
              <span className="font-bold text-white block">130–155 WPM Pacing</span>
              <p className="text-[11px] text-slate-400">Real-time speech rate &amp; filler counter</p>
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 space-y-0.5 text-xs">
              <span className="font-bold text-white block">Custom Teleprompter</span>
              <p className="text-[11px] text-slate-400">Practice your speech or notes</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-0.5 text-xs">
              <span className="font-bold text-white block">100% Client Privacy</span>
              <p className="text-[11px] text-slate-400">Zero video uploads or cloud storage</p>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div data-reveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-none transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-widest">Total Practice</CardTitle>
              <Video className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalSessions}</div>
              <p className="text-xs text-slate-500 mt-1">completed sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-none transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-widest">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-violet-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet-400">{avgConfidence} <span className="text-base font-normal text-slate-500">/ 100</span></div>
              <p className="text-xs text-slate-500 mt-1">composite confidence metric</p>
            </CardContent>
          </Card>

          <Card className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-none transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-widest">Time Invested</CardTitle>
              <Clock className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{totalMinutes} <span className="text-base font-normal text-slate-500">mins</span></div>
              <p className="text-xs text-slate-500 mt-1">speaking &amp; practicing</p>
            </CardContent>
          </Card>

          <Card className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl shadow-none transition-all hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-widest">Overall Trajectory</CardTitle>
              <TrendingUp className={`h-4 w-4 ${confidenceDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-1">
                {confidenceDelta >= 0 ? (
                  <span className="text-emerald-400">+{confidenceDelta}</span>
                ) : (
                  <span className="text-amber-400">{confidenceDelta}</span>
                )}
                <span className="text-xs font-normal text-slate-500">pts</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">vs initial baseline session</p>
            </CardContent>
          </Card>
        </div>

        {/* Quantifiable Session Comparison Engine */}
        {sessionsList.length >= 2 && baselineSession && currentSession && (
          <Card className="border border-indigo-500/30 bg-white/[0.04] backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.1)] overflow-hidden card-gradient-top">
            <CardHeader className="bg-white/[0.02] border-b border-white/[0.08] pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    <ArrowRightLeft className="h-4 w-4" />
                    Comparative Session Analytics
                  </div>
                  <CardTitle className="text-lg font-bold text-white mt-0.5">
                    Baseline vs Current Improvement
                  </CardTitle>
                </div>

                {/* Session Selectors */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-medium">Baseline:</span>
                    <select 
                      value={baselineId || baselineSession.id} 
                      onChange={(e) => setBaselineId(e.target.value)}
                      className="bg-white/[0.06] border border-white/[0.12] rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:border-indigo-500/60 focus:outline-none"
                    >
                      {sessionsList.map((s, idx) => (
                        <option key={s.id} value={s.id} className="bg-[#0b0d14] text-white">
                          Session #{sessionsList.length - idx}: {s.topic || 'Practice'} ({getConfidence(s)} pts)
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-slate-500">vs</span>

                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 font-medium">Current:</span>
                    <select 
                      value={currentId || currentSession.id} 
                      onChange={(e) => setCurrentId(e.target.value)}
                      className="bg-white/[0.06] border border-white/[0.12] rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:border-indigo-500/60 focus:outline-none"
                    >
                      {sessionsList.map((s, idx) => (
                        <option key={s.id} value={s.id} className="bg-[#0b0d14] text-white">
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
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Eye Engagement</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">
                      {currentEye}%
                    </span>
                    <span className={`text-xs font-semibold flex items-center ${eyeDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {eyeDelta >= 0 ? `+${eyeDelta}%` : `${eyeDelta}%`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Initial Baseline: {baselineEye}%
                  </div>
                </div>

                {/* Posture Delta */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Posture Alignment</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">
                      {currentPosture}%
                    </span>
                    <span className={`text-xs font-semibold flex items-center ${postureDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {postureDelta >= 0 ? `+${postureDelta}%` : `${postureDelta}%`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Initial Baseline: {baselinePosture}%
                  </div>
                </div>

                {/* Pacing WPM Delta */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Speech Pacing</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">
                      {currentWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-normal border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                      {currentWpm >= 125 && currentWpm <= 165 ? 'Optimal Band' : 'Pacing Adjustment'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Initial Baseline: {baselineWpm} WPM
                  </div>
                </div>

                {/* Filler Words Delta */}
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-1">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Filler Words Count</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-white">
                      {currentFillers}
                    </span>
                    <span className={`text-xs font-semibold flex items-center ${fillerDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {fillerDelta > 0 ? `-${fillerDelta} Less` : fillerDelta === 0 ? 'Constant' : `+${Math.abs(fillerDelta)}`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Initial Baseline: {baselineFillers} fillers
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        )}

        {/* Historical Progress Chart */}
        {chartData.length > 0 && (
          <Card className="border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.06)]">
            <CardHeader className="pb-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-white">
                    Historical Session Trajectory
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">
                    Multi-metric progression across your last {Math.min(10, chartData.length)} mock sessions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" /> Confidence</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" /> Eye Contact</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis 
                    dataKey="name" 
                    className="text-[11px]" 
                    tick={{ fill: '#94a3b8' }}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    className="text-[11px]" 
                    tick={{ fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#090b10', 
                      borderColor: 'rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    name="Confidence Score"
                    stroke="#6366f1" 
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#6366f1' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="eyeContact" 
                    name="Eye Contact %"
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#06b6d4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Practice History</h2>
            <span className="text-xs text-slate-400">{sessionsList.length} total sessions recorded</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {sessionsList.slice(0, 8).map((s) => (
              <Card 
                key={s.id} 
                className="border border-white/[0.08] hover:border-indigo-500/40 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.12)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                onClick={() => setLocation(`/report/${s.id}`)}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">
                      {s.topic || 'General Practice Session'}
                    </span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal border-white/10 text-slate-300 bg-white/[0.03]">
                      {Math.floor(getDuration(s) / 60)}m {getDuration(s) % 60}s
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">
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
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Score</span>
                    <span className="font-bold text-indigo-400 text-sm">{getConfidence(s)} / 100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Eye Contact</span>
                    <span className="font-medium text-slate-200">{getEyeContact(s)}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Pacing</span>
                    <span className="font-medium text-slate-200">{getWpm(s)} WPM</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
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
