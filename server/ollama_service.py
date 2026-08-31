# server-fastapi/ollama_service.py
import ollama
from typing import Dict, List
import json
import os

async def generate_feedback(
    eye_contact_pct: float,
    posture_score: float,
    wpm: float,
    filler_count: int,
    duration: int,
    transcript: str = "",
    role: str = "general",
    context: str = ""
) -> Dict[str, List[str]]:
    """
    Generate comprehensive feedback using Ollama Gemma:2b
    """
    try:
        # Create detailed prompt for Gemma with dynamic context
        context_section = f"\nCURRENT SITUATION: {context}\n" if context else ""
        
        prompt = f"""
You are an expert interview coach providing LIVE coaching during a practice session. 
Analyze the current state and provide SPECIFIC, ACTIONABLE feedback that changes based on what's happening RIGHT NOW.

SESSION METRICS (LIVE):
- Eye Contact: {eye_contact_pct:.1f}%
- Posture Score: {posture_score:.1f}%
- Speaking Rate: {wpm:.1f} WPM
- Filler Words: {filler_count}
- Duration: {duration}s ({duration//60}m {duration%60}s)
- Role: {role}
{context_section}
TRANSCRIPT (if available):
{transcript[:2000]}

IMPORTANT: 
- Give DIFFERENT feedback each time based on CURRENT metrics
- If eye contact is low, focus on that
- If posture is poor, address that specifically
- If user is out of frame or mispositioned, mention it
- Vary your language - don't repeat the same phrases
- Be encouraging but direct about what needs improvement RIGHT NOW

Provide feedback in this EXACT JSON format ONLY:
{{
  "strengths": ["2-3 specific things they're doing well RIGHT NOW"],
  "improvements": ["2-3 specific actions to take RIGHT NOW based on current metrics"],
  "confidence_score": [number 0-100 based on current performance],
  "role_specific_tips": ["1-2 tips specific to {role} interviews"],
  "summary": "1-2 sentence summary of current performance state"
}}

Be dynamic - if metrics changed, reflect that change in your feedback.
"""
        
        # Call Ollama Gemma:2b with timeout (max 5 seconds)
        import asyncio
        from concurrent.futures import ThreadPoolExecutor
        
        def call_ollama():
            return ollama.chat(
                model='gemma:2b',
                messages=[{'role': 'user', 'content': prompt}],
                options={
                    'temperature': 0.7,
                    'top_p': 0.9,
                    'num_predict': 300  # Reduced for faster response
                }
            )
        
        # Run with timeout
        loop = asyncio.get_event_loop()
        with ThreadPoolExecutor() as executor:
            try:
                response = await asyncio.wait_for(
                    loop.run_in_executor(executor, call_ollama),
                    timeout=5.0  # 5 second timeout
                )
            except asyncio.TimeoutError:
                print("⚠️  Ollama timeout - using fallback")
                return generate_fallback_feedback(eye_contact_pct, posture_score, wpm, filler_count)
        
        # Parse JSON response
        try:
            feedback = json.loads(response['message']['content'])
            return feedback
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "strengths": ["Great effort on this practice session!"],
                "improvements": ["Keep practicing regularly"],
                "confidence_score": max(50, min(90, (eye_contact_pct + posture_score + (wpm/2)) / 3)),
                "role_specific_tips": ["Practice consistently"],
                "summary": "Solid practice session - keep improving!"
            }
    
    except Exception as e:
        print(f"⚠️  Ollama error: {e}")
        print("   Using fallback feedback instead")
        # Fallback to rule-based feedback
        return generate_fallback_feedback(eye_contact_pct, posture_score, wpm, filler_count)

def generate_fallback_feedback(
    eye_contact_pct: float,
    posture_score: float,
    wpm: float,
    filler_count: int
) -> Dict[str, List[str]]:
    """Fallback without Ollama"""
    strengths = []
    improvements = []
    
    if eye_contact_pct >= 70:
        strengths.append("Excellent eye contact - very engaging!")
    else:
        improvements.append(f"Improve eye contact (current: {eye_contact_pct:.0f}%)")
    
    if 130 <= wpm <= 160:
        strengths.append("Perfect speaking pace")
    elif wpm < 120:
        improvements.append("Speak slightly faster")
    else:
        improvements.append("Slow down for better clarity")
    
    if filler_count < 5:
        strengths.append("Minimal filler words")
    else:
        improvements.append(f"Reduce filler words ({filler_count} detected)")
    
    return {
        "strengths": strengths[:3],
        "improvements": improvements[:3],
        "confidence_score": max(0, min(100, (eye_contact_pct * 0.4 + posture_score * 0.3 + (150-wpm)*0.1))),
        "role_specific_tips": ["Practice with a mirror", "Record and review sessions"],
        "summary": "Good practice session - focus on key improvements"
    }
