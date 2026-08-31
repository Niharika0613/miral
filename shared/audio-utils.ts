export const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'well'];

export function detectFillerWords(transcript: string): { word: string; count: number }[] {
  const lowerTranscript = transcript.toLowerCase();
  const results: { word: string; count: number }[] = [];
  
  FILLER_WORDS.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerTranscript.match(regex);
    const count = matches ? matches.length : 0;
    if (count > 0) {
      results.push({ word: filler, count });
    }
  });
  
  return results;
}

export function calculateWordsPerMinute(transcript: string, durationSeconds: number): number {
  if (durationSeconds === 0) return 0;
  const words = transcript.trim().split(/\s+/).filter(word => word.length > 0);
  const minutes = durationSeconds / 60;
  return Math.round(words.length / minutes);
}

export function generateConfidenceScore(
  eyeContactPercentage: number,
  wpm: number,
  fillerWordsCount: number,
  durationSeconds: number
): number {
  let score = 50;
  
  if (eyeContactPercentage >= 70) score += 20;
  else if (eyeContactPercentage >= 50) score += 10;
  else if (eyeContactPercentage >= 30) score += 5;
  
  if (wpm >= 130 && wpm <= 160) score += 15;
  else if (wpm >= 110 && wpm <= 180) score += 10;
  else if (wpm >= 90 && wpm <= 200) score += 5;
  
  const minutes = durationSeconds / 60;
  const fillerWordsPerMinute = fillerWordsCount / minutes;
  if (fillerWordsPerMinute < 2) score += 15;
  else if (fillerWordsPerMinute < 4) score += 10;
  else if (fillerWordsPerMinute < 6) score += 5;
  else score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

export function generateStrengths(
  eyeContactPercentage: number,
  wpm: number,
  fillerWordsCount: number,
  durationSeconds: number
): string[] {
  const strengths: string[] = [];
  const minutes = durationSeconds / 60;
  const fillerWordsPerMinute = fillerWordsCount / minutes;
  
  if (eyeContactPercentage >= 70) {
    strengths.push("Excellent eye contact throughout the session");
  }
  if (wpm >= 130 && wpm <= 160) {
    strengths.push("Perfect speaking pace - clear and engaging");
  }
  if (fillerWordsPerMinute < 2) {
    strengths.push("Minimal use of filler words - very professional");
  }
  if (durationSeconds >= 120) {
    strengths.push("Good session duration for meaningful practice");
  }
  
  if (strengths.length === 0) {
    strengths.push("Completed a full practice session - great commitment");
  }
  
  return strengths;
}

export function generateImprovements(
  eyeContactPercentage: number,
  wpm: number,
  fillerWordsCount: number
): string[] {
  const improvements: string[] = [];
  const minutes = 1;
  const fillerWordsPerMinute = fillerWordsCount / minutes;
  
  if (eyeContactPercentage < 50) {
    improvements.push("Practice maintaining eye contact with the camera more consistently");
  }
  if (wpm < 120) {
    improvements.push("Try speaking slightly faster to maintain audience engagement");
  } else if (wpm > 170) {
    improvements.push("Slow down your speaking pace to improve clarity");
  }
  if (fillerWordsPerMinute > 4) {
    improvements.push("Work on reducing filler words like 'um', 'uh', and 'like'");
  }
  
  if (improvements.length === 0) {
    improvements.push("Continue practicing regularly to maintain your strong performance");
  }
  
  return improvements;
}
