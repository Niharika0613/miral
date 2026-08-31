import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { ArrowLeft, Eye, Clock, MessageSquare, TrendingUp, CheckCircle, AlertCircle, Activity, Zap, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface AICoachSectionProps {
  session: Session;
}

function AICoachSection({ session }: AICoachSectionProps) {
  const [aiCoach, setAiCoach] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAICoach = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `You are a communication coach. Analyze this practice session and give brief feedback in 2-3 sentences.

Metrics: Eye Contact ${session.eyeContactPercentage}%, Posture ${session.postureScore}%, Pace ${session.wordsPerMinute} WPM, Confidence ${session.confidenceScore}.

Be encouraging and specific.`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma:2b',
          prompt,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error('AI service unavailable');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const json = JSON.parse(line);
              if (json.response) {
                fullResponse += json.response;
                setAiCoach(fullResponse);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err: any) {
      setError('AI feedback unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateAICoach();
  }, []);

  return (
    <Card className="border-2 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Coach Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Generating personalized coaching...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">
            {error}
          </div>
        ) : aiCoach ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-foreground leading-relaxed">{aiCoach}</p>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No AI insights available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import type { Session } from '@shared/schema';

export default function Report() {
  const [, params] = useRoute('/report/:id');
  const [, setLocation] = useLocation();
  const sessionId = params?.id;

  const { data: session, isLoading, error } = useQuery<Session>({
    queryKey: ['/api/sessions', sessionId],
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 1000,
  });
  
  // Debug logging and data sanitization
  if (session) {
    console.log('📊 FULL SESSION DATA:', JSON.stringify(session, null, 2));
    console.log('🔢 Metrics:', {
      eyeContact: session.eyeContactPercentage,
      posture: session.postureScore,
      wpm: session.wordsPerMinute,
      confidence: session.confidenceScore,
      fillers: session.fillerWordsCount,
      duration: session.duration,
    });
    console.log('🎯 AI Feedback:', {
      strengths: session.strengths,
      improvements: session.improvements,
      strengthsLength: session.strengths?.length,
      improvementsLength: session.improvements?.length,
    });
    console.log('📝 Transcript:', session.transcript ? 'Present' : 'Missing');
    
    // Sanitize NaN values
    const sanitize = (val: any) => {
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };
    
    session.eyeContactPercentage = sanitize(session.eyeContactPercentage);
    session.postureScore = sanitize(session.postureScore);
    session.wordsPerMinute = sanitize(session.wordsPerMinute);
    session.confidenceScore = sanitize(session.confidenceScore);
    session.fillerWordsCount = sanitize(session.fillerWordsCount);
    session.duration = sanitize(session.duration);
  }
  
  if (error) {
    console.error('❌ Error loading session:', error);
  }
  
  if (isLoading) {
    console.log('⏳ Loading session data...');
  }

  const { data: allSessions } = useQuery<Session[]>({
    queryKey: ['/api/sessions'],
  });

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">Invalid Session</h2>
          <p className="text-muted-foreground mb-4">No session ID provided.</p>
          <Button onClick={() => setLocation('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-4">
            {error ? 'Error loading session data. Please try again.' : 'The session you\'re looking for doesn\'t exist.'}
          </p>
          <Button onClick={() => setLocation('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const previousSessions = allSessions?.filter(s => s.id !== session.id) || [];
  const avgPreviousScore = previousSessions.length > 0
    ? Math.round(previousSessions.reduce((sum, s) => sum + s.confidenceScore, 0) / previousSessions.length)
    : null;
  const avgPreviousEyeContact = previousSessions.length > 0
    ? Math.round(previousSessions.reduce((sum, s) => sum + s.eyeContactPercentage, 0) / previousSessions.length)
    : null;
  const avgPreviousWPM = previousSessions.length > 0
    ? Math.round(previousSessions.reduce((sum, s) => sum + s.wordsPerMinute, 0) / previousSessions.length)
    : null;
  
  const avgPreviousPosture = previousSessions.length > 0
    ? Math.round(previousSessions.reduce((sum, s) => sum + (s.postureScore || 0), 0) / previousSessions.length)
    : null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-orange-600';
  };

  const getPostureColor = (posture?: string) => {
    if (!posture) return 'text-gray-600';
    switch (posture) {
      case 'good': return 'text-green-600';
      case 'slouching': return 'text-amber-600';
      case 'leaning': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-background">
      <div className="container max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Button
          variant="ghost"
          className="gap-2 mb-4 sm:mb-6"
          onClick={() => setLocation('/dashboard')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="space-y-6 sm:space-y-8">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 sm:p-8 rounded-lg border border-primary/20 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{session.topic || 'Practice Session'}</h1>
              <p className="text-xs sm:text-base text-muted-foreground">
                {new Date(session.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })} at {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-center">
              <div className={`text-4xl sm:text-6xl font-bold ${getScoreColor(session.confidenceScore ?? 0)}`} data-testid="text-confidence-score">
                {Math.round(session.confidenceScore ?? 0) || 0}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">Confidence</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
          <Card className="border-2 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Eye Contact</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{Math.round(session.eyeContactPercentage ?? 0)}%</div>
              <Progress value={session.eyeContactPercentage ?? 0} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-500/20">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Posture</CardTitle>
              <Activity className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-teal-600">{Math.round(session.postureScore ?? 0)}%</div>
              <Progress value={session.postureScore ?? 0} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Pace</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{Math.round(session.wordsPerMinute ?? 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">WPM</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-500/20">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Fillers</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-amber-600">{session.fillerWordsCount ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">count</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">Duration</CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{formatDuration(session.duration)}</div>
            </CardContent>
          </Card>
        </div>

        {session.transcript && (
          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="leading-relaxed text-foreground whitespace-pre-wrap" data-testid="text-transcript">
                  {session.transcript}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-chart-2" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(session.strengths && session.strengths.length > 0) ? (
                  session.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-chart-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Analyzing your performance...</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-4" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {(session.improvements && session.improvements.length > 0) ? (
                  session.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-chart-4 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-chart-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Keep practicing to get personalized feedback</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        <AICoachSection session={session} />

        {previousSessions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Comparison with Previous Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm font-medium border-b pb-2">
                  <div>Metric</div>
                  <div className="text-center">This Session</div>
                  <div className="text-center">Previous Average</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm items-center">
                  <div>Confidence Score</div>
                  <div className="text-center font-medium">{Math.round(session.confidenceScore ?? 0)}</div>
                  <div className="text-center font-medium">{avgPreviousScore ?? 0}</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm items-center">
                  <div>Eye Contact</div>
                  <div className="text-center font-medium">{Math.round(session.eyeContactPercentage ?? 0)}%</div>
                  <div className="text-center font-medium">{avgPreviousEyeContact ?? 0}%</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm items-center">
                  <div>Speaking Pace</div>
                  <div className="text-center font-medium">{Math.round(session.wordsPerMinute ?? 0)} WPM</div>
                  <div className="text-center font-medium">{avgPreviousWPM ?? 0} WPM</div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm items-center">
                  <div>Filler Words</div>
                  <div className="text-center font-medium">{session.fillerWordsCount ?? 0}</div>
                  <div className="text-center font-medium">
                    {Math.round(previousSessions.reduce((sum, s) => sum + s.fillerWordsCount, 0) / previousSessions.length)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm items-center">
                  <div>Posture Score</div>
                  <div className="text-center font-medium">{Math.round(session.postureScore ?? 0)}%</div>
                  <div className="text-center font-medium">{avgPreviousPosture ?? 0}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}
