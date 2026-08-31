# server-fastapi/audio_utils.py
import re
from typing import List, Dict


FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so', 'well']

def detect_filler_words(transcript: str) -> List[Dict[str, any]]:
    """
    Detect filler words in transcript
    Matches: detectFillerWords() from audio-utils.ts
    """
    lower_transcript = transcript.lower()
    results = []
    
    for filler in FILLER_WORDS:
        pattern = r'\b' + re.escape(filler) + r'\b'
        matches = re.findall(pattern, lower_transcript, re.IGNORECASE)
        count = len(matches)
        if count > 0:
            results.append({"word": filler, "count": count})
    
    return results

def calculate_words_per_minute(transcript: str, duration_seconds: int) -> int:
    """
    Calculate speaking rate (WPM)
    Matches: calculateWordsPerMinute() from audio-utils.ts
    """
    if duration_seconds == 0:
        return 0
    
    words = [w for w in transcript.strip().split() if len(w) > 0]
    minutes = duration_seconds / 60
    return round(len(words) / minutes)

def generate_confidence_score(
    eye_contact_percentage: float,
    wpm: float,
    filler_words_count: int,
    duration_seconds: int
) -> int:
    """
    Generate confidence score based on metrics
    Matches: generateConfidenceScore() from audio-utils.ts
    """
    score = 50
    
    # Eye contact scoring
    if eye_contact_percentage >= 70:
        score += 20
    elif eye_contact_percentage >= 50:
        score += 10
    elif eye_contact_percentage >= 30:
        score += 5
    
    # Speaking pace scoring
    if 130 <= wpm <= 160:
        score += 15
    elif 110 <= wpm <= 180:
        score += 10
    elif 90 <= wpm <= 200:
        score += 5
    
    # Filler words scoring
    minutes = duration_seconds / 60
    filler_words_per_minute = filler_words_count / minutes if minutes > 0 else 0
    
    if filler_words_per_minute < 2:
        score += 15
    elif filler_words_per_minute < 4:
        score += 10
    elif filler_words_per_minute < 6:
        score += 5
    else:
        score -= 5
    
    return max(0, min(100, score))

def generate_strengths(
    eye_contact_percentage: float,
    wpm: float,
    filler_words_count: int,
    duration_seconds: int
) -> List[str]:
    """
    Generate list of strengths
    Matches: generateStrengths() from audio-utils.ts
    """
    strengths = []
    minutes = duration_seconds / 60
    filler_words_per_minute = filler_words_count / minutes if minutes > 0 else 0
    
    if eye_contact_percentage >= 70:
        strengths.append("Excellent eye contact throughout the session")
    
    if 130 <= wpm <= 160:
        strengths.append("Perfect speaking pace - clear and engaging")
    
    if filler_words_per_minute < 2:
        strengths.append("Minimal use of filler words - very professional")
    
    if duration_seconds >= 120:
        strengths.append("Good session duration for meaningful practice")
    
    if not strengths:
        strengths.append("Completed a full practice session - great commitment")
    
    return strengths

def generate_improvements(
    eye_contact_percentage: float,
    wpm: float,
    filler_words_count: int
) -> List[str]:
    """
    Generate list of improvements
    Matches: generateImprovements() from audio-utils.ts
    """
    improvements = []
    minutes = 1  # Normalized per minute
    filler_words_per_minute = filler_words_count / minutes
    
    if eye_contact_percentage < 50:
        improvements.append("Practice maintaining eye contact with the camera more consistently")
    
    if wpm < 120:
        improvements.append("Try speaking slightly faster to maintain audience engagement")
    elif wpm > 170:
        improvements.append("Slow down your speaking pace to improve clarity")
    
    if filler_words_per_minute > 4:
        improvements.append("Work on reducing filler words like 'um', 'uh', and 'like'")
    
    if not improvements:
        improvements.append("Continue practicing regularly to maintain your strong performance")
    
    return improvements
