import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Calendar, Clock, TrendingUp, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Session } from '@shared/schema';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const userId = sessionStorage.getItem('userId');
  
  const { data: sessions, isLoading, error } = useQuery<Session[]>({
    queryKey: ['/api/sessions', userId],
    queryFn: async () => {
      // Try fetching with userId first
      let response = await fetch(`/api/sessions?userId=${userId}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }
      let data = await response.json();
      
      // If no sessions found with userId, fetch all sessions (for backward compatibility)
      if (!data || data.length === 0) {
        console.log('⚠️ No sessions found for userId, fetching all sessions');
        response = await fetch('/api/sessions', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (response.ok) {
          data = await response.json();
        }
      }
      
      console.log('📊 Dashboard sessions:', data);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!userId,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const sessionsArray = Array.isArray(sessions) ? sessions : [];
  
  console.log('📈 Dashboard stats:', {
    totalSessions: sessionsArray.length,
    sessions: sessionsArray.map(s => ({
      id: s.id,
      confidence: s.confidenceScore,
      duration: s.duration,
      eyeContact: s.eyeContactPercentage,
    })),
  });
  


  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalSessions = sessionsArray.length;
  
  // Calculate average score with detailed logging
  const totalConfidence = sessionsArray.reduce((sum, s) => {
    const score = s.confidenceScore || 0;
    console.log(`Session ${s.id}: confidence = ${score}`);
    return sum + score;
  }, 0);
  const avgScore = sessionsArray.length > 0
    ? Math.round(totalConfidence / sessionsArray.length)
    : 0;
  
  console.log(`📊 Average calculation: ${totalConfidence} / ${sessionsArray.length} = ${avgScore}`);
  
  const totalTime = sessionsArray.length > 0
    ? Math.round(sessionsArray.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)
    : 0;
  
  // Calculate improvement: latest session vs previous session
  const improvement = sessionsArray.length >= 2
    ? Math.round((sessionsArray[0].confidenceScore || 0) - (sessionsArray[1].confidenceScore || 0))
    : 0;
  
  console.log(`📈 Improvement calculation:`, {
    latestScore: sessionsArray[0]?.confidenceScore || 0,
    previousScore: sessionsArray[1]?.confidenceScore || 0,
    improvement,
    totalSessions: sessionsArray.length
  });

  // Sort sessions by date (oldest first) and take last 10
  const sortedSessions = [...sessionsArray].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  const chartData = sortedSessions.length > 0
    ? sortedSessions
        .slice(-10) // Take last 10 sessions
        .map((session, index) => {
          const score = session.confidenceScore || 0;
          console.log(`Chart data point ${index + 1}: score=${score}, session=${session.id}`);
          return {
            name: `#${index + 1}`,
            score: score,
            date: new Date(session.createdAt).toLocaleDateString(),
            topic: session.topic || 'Practice',
          };
        })
    : [];
  
  console.log('📊 Chart data:', chartData);
  console.log('🎯 Graph will display:', chartData.length > 0 ? 'YES' : 'NO (no sessions or all scores are 0)');
  
  if (chartData.length > 0 && chartData.every(d => d.score === 0)) {
    console.warn('⚠️ All confidence scores are 0! Complete a NEW practice session to see the graph.');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 sm:p-8 rounded-lg border border-primary/20">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Practice Dashboard</h1>
          <p className="text-muted-foreground">Track progress, celebrate wins, and improve every session 📊</p>
        </div>
        


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="border-2 border-primary/20 hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Sessions</CardTitle>
              <Video className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold" data-testid="text-total-sessions">{totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">practice sessions</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/20 hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600" data-testid="text-avg-score">{avgScore}</div>
              <p className="text-xs text-muted-foreground mt-1">/ 100</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20 hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Practice</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalTime}</div>
              <p className="text-xs text-muted-foreground mt-1">minutes invested</p>
            </CardContent>
          </Card>

          <Card className={`border-2 hover-elevate ${improvement >= 0 ? 'border-amber-500/20' : 'border-red-500/20'}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Progress</CardTitle>
              <TrendingUp className={`h-4 w-4 ${improvement > 0 ? 'text-amber-500' : 'text-red-500'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl sm:text-3xl font-bold ${improvement > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                {improvement > 0 ? '↑' : improvement < 0 ? '↓' : '→'} {Math.abs(improvement)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">vs previous</p>
            </CardContent>
          </Card>
        </div>

        {chartData.length > 0 && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📈 Your Progress
                <span className="text-xs font-normal text-muted-foreground ml-auto">Last {Math.min(10, chartData.length)} sessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                    formatter={(value: any, name: string) => [
                      `${value}`,
                      'Confidence Score'
                    ]}
                    labelFormatter={(label: string, payload: any) => {
                      if (payload && payload[0]) {
                        return `${payload[0].payload.topic} - ${payload[0].payload.date}`;
                      }
                      return label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-4">📚 Recent Sessions</h2>
          {error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Video className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Sessions</h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : 'Failed to load sessions'}
                </p>
              </CardContent>
            </Card>
          ) : sessionsArray.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessionsArray.map((session) => (
                <Card
                  key={session.id}
                  className="hover-elevate cursor-pointer transition-all border-2 border-transparent hover:border-primary/20"
                  onClick={() => setLocation(`/report/${session.id}`)}
                  data-testid={`card-session-${session.id}`}
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base sm:text-lg truncate">{session.topic || 'Practice Session'}</CardTitle>
                      <Badge variant="secondary" className="text-xs sm:text-sm">{session.confidenceScore || 0}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.floor((session.duration || 0) / 60)}m {(session.duration || 0) % 60}s
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Eye Contact</span>
                      <span className="font-medium">{session.eyeContactPercentage || 0}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Speaking Pace</span>
                      <span className="font-medium">{session.wordsPerMinute || 0} WPM</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Filler Words</span>
                      <span className="font-medium">{session.fillerWordsCount || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Video className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your first practice session to see your progress here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
