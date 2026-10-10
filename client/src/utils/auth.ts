// client/src/utils/auth.ts
export const setAuth = (userId: string, userName: string, plan: string = 'free', proUntil?: string) => {
  localStorage.setItem('userId', userId);
  localStorage.setItem('userName', userName);
  localStorage.setItem('userPlan', plan);
  if (proUntil) localStorage.setItem('proUntil', proUntil);
  sessionStorage.setItem('userId', userId);
  sessionStorage.setItem('userName', userName);
  sessionStorage.setItem('userPlan', plan);
  if (proUntil) sessionStorage.setItem('proUntil', proUntil);
};

export const logout = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userPlan');
  localStorage.removeItem('proUntil');
  sessionStorage.clear();
  window.location.href = '/login';
};

export const isLoggedIn = (): boolean => {
  return !!(localStorage.getItem('userId') || sessionStorage.getItem('userId'));
};

export const getCurrentUser = () => {
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
  
  if (!userId) return null;
  
  return {
    id: userId,
    name: userName || 'Candidate',
    plan: localStorage.getItem('userPlan') || 'free',
    proUntil: localStorage.getItem('proUntil') || '2026-10-31T23:59:59Z',
  };
};

export const getUserPlan = () => {
  const storedPlan = localStorage.getItem('userPlan') || sessionStorage.getItem('userPlan') || 'free';
  const proUntil = localStorage.getItem('proUntil') || '2026-10-31T23:59:59Z';
  
  // Pilot wave runs through October 31, 2026
  const pilotExpiry = new Date('2026-10-31T23:59:59Z');
  const isPilotActive = new Date() <= pilotExpiry;
  const isPro = storedPlan === 'pro' || isPilotActive;

  return {
    plan: isPro ? 'pro' : 'free',
    basePlan: storedPlan,
    proUntil,
    isPro,
    isPilotActive,
    badgeText: "Pilot mein free, 31 Oct tak",
    englishBadge: "Free in Pilot • Until 31 Oct",
  };
};

export const getDailyAnalysisUsage = () => {
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || 'guest';
  const today = new Date().toISOString().slice(0, 10);
  const key = `miral_daily_transcript_analyses_${userId}_${today}`;
  
  let count = 0;
  try {
    count = parseInt(localStorage.getItem(key) || '0', 10);
    if (isNaN(count)) count = 0;
  } catch {
    count = 0;
  }

  const limit = 10; // Daily cap for transcript analyses
  const remaining = Math.max(0, limit - count);

  return {
    count,
    limit,
    remaining,
    isCapped: count >= limit,
    recordAnalysis: () => {
      const next = count + 1;
      try {
        localStorage.setItem(key, next.toString());
      } catch {}
      return next;
    }
  };
};

