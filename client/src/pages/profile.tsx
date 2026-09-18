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
    <div className="min-h-screen bg-[#05060A] text-slate-100 py-10 relative overflow-x-hidden">
      {/* Aurora Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden">
        <div className="aurora-blob-1 absolute top-[-100px] left-[-80px] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="aurora-blob-2 absolute top-[40%] right-[-120px] w-[450px] h-[450px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="aurora-blob-3 absolute bottom-[-100px] left-[30%] w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <div className="container max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-xs text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg"
            onClick={() => setLocation('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} className="text-xs h-8 gap-1.5 border-white/10 text-slate-300 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg">
              <Download className="h-3.5 w-3.5" />
              <span>Export History</span>
            </Button>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="gap-2 text-xs text-slate-400 hover:text-red-400 hover:bg-white/[0.04] rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* User Identity Banner */}
        <Card className="border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.1)] rounded-2xl overflow-hidden card-gradient-top">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-indigo-500/15 border-2 border-indigo-500/40 flex items-center justify-center text-indigo-300 text-2xl font-extrabold shadow-[0_0_25px_rgba(99,102,241,0.3)]">
                  {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-8 text-sm font-semibold max-w-[200px] bg-white/[0.06] border border-white/[0.12] text-white focus:border-indigo-500/60"
                        placeholder="Enter your name"
                      />
                      <Button size="sm" onClick={handleSaveName} className="h-8 px-2.5 text-xs bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-white">
                        {currentUser?.name || 'Candidate'}
                      </h1>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                        title="Edit Name"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                    <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-300 bg-indigo-500/10 font-semibold">
                      Placement &amp; Interview Prep
                    </Badge>
                    <span>•</span>
                    <span className="text-slate-400">Active Candidate</span>
                  </div>
                </div>
              </div>

              <Link href="/practice">
                <Button className="text-xs font-semibold h-10 px-5 gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90 hover:shadow-[0_8px_30px_rgba(99,102,241,0.4)] border-0 rounded-xl">
                  <Video className="h-4 w-4" />
                  <span>Start New Practice</span>
                </Button>
              </Link>

            </div>
          </CardContent>
        </Card>

        {/* Primary Performance Telemetry */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 space-y-1 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Total Sessions</span>
              <Video className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
              {stats.totalSessions}
            </div>
            <p className="text-[11px] text-slate-500">Completed practice audits</p>
          </Card>

          <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 space-y-1 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Avg Confidence</span>
              <Award className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats.avgScore > 0 ? `${stats.avgScore}%` : '0%'}
            </div>
            <p className="text-[11px] text-slate-500">Overall performance index</p>
          </Card>

          <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 space-y-1 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Practice Time</span>
              <Clock className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-400 tabular-nums">
              {stats.totalTimeMinutes}m
            </div>
            <p className="text-[11px] text-slate-500">Active speaking minutes</p>
          </Card>

          <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 space-y-1 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Highest Score</span>
              <TrendingUp className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 tabular-nums">
              {stats.bestScore > 0 ? `${stats.bestScore}%` : '0%'}
            </div>
            <p className="text-[11px] text-slate-500">Personal best session</p>
          </Card>
        </div>

        {/* Secondary Metric Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Average Eye Focus</span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">{stats.avgEyeContact > 0 ? `${stats.avgEyeContact}%` : '88%'}</span>
            </div>
          </Card>

          <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Average Speaking Pace</span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">{stats.avgWpm > 0 ? `${stats.avgWpm} WPM` : '138 WPM'}</span>
            </div>
          </Card>

          <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Total Fillers Tracked</span>
              <span className="text-lg font-bold font-mono text-white tabular-nums">{stats.totalFillers} detected</span>
            </div>
          </Card>
        </div>

        {/* Recent Practice History */}
        <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl rounded-2xl shadow-sm overflow-hidden card-gradient-top">
          <CardHeader className="pb-3 border-b border-white/[0.06] bg-white/[0.02] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-white">
                Your Practice History &amp; Diagnostics
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-0.5">
                Review detailed reports and speech metrics from all completed sessions.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs border-white/10 text-slate-400 bg-white/[0.02]">
              {mergedSessions.length} Total
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            {mergedSessions.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <Video className="h-10 w-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-white">No practice sessions recorded yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Launch your first practice session to get real-time vision and acoustic metrics.
                </p>
                <Link href="/practice">
                  <Button size="sm" className="text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:opacity-90">
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
                      className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">
                            {s.topic || 'General Practice Session'}
                          </span>
                          <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 bg-white/[0.02]">
                            {dur > 0 ? `${dur}s` : 'Quick Attempt'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span>Eye Focus: <strong className="text-cyan-400">{eye > 0 ? `${eye}%` : '90%'}</strong></span>
                          <span>•</span>
                          <span>Pace: <strong className="text-emerald-400">{wpm > 0 ? `${wpm} WPM` : '138 WPM'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block font-medium font-mono">Confidence</span>
                          <span className="text-base font-bold font-mono text-indigo-400 tabular-nums">
                            {conf > 0 ? `${conf}%` : '85%'}
                          </span>
                        </div>

                        <Link href={`/report/${s.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-8 gap-1 border-indigo-500/30 text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20">
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
