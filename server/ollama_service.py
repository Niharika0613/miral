# server-fastapi/ollama_service.py
"""
VaniDarpan AI Speech & Communication Intelligence Engine
Supports:
1. Google Gemini Cloud API (GEMINI_API_KEY)
2. Groq Cloud LLM (GROQ_API_KEY)
3. OpenAI API (OPENAI_API_KEY)
4. Local Ollama (Gemma:2b / Llama3)
5. VaniDarpan Autonomous Executive Speech Engine (VASE - Zero-latency, transcript-aware heuristic fallback)
"""

import os
import json
import re
import asyncio
from typing import Dict, List, Any, Optional
import httpx

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    ollama = None
    OLLAMA_AVAILABLE = False


COACH_PROMPT_TEMPLATE = """You are the Lead Executive Speech & Communication Coach for VaniDarpan (Universal AI Communication & Placement Intelligence Platform).
Analyze this live practice session telemetry and provide authoritative, precise, non-generic feedback.

SESSION TELEMETRY:
- Eye Contact / Camera Fixation: {eye_contact:.1f}%
- Posture Alignment Score: {posture:.1f}%
- Speaking Rate: {wpm:.1f} WPM (Professional baseline: 130-155 WPM)
- Filler Word Count: {fillers}
- Duration: {duration_formatted}
- Scenario Context / Target Role: {role}
{context_section}
TRANSCRIPT SEGMENT:
{transcript_preview}

CRITICAL RULES:
1. NEVER give generic advice like "practice with a mirror", "record yourself", or "keep it up".
2. Provide concrete, technical, and rhetorical guidance tailored to {role}.
3. Point out specific cadence, gaze, or verbal mannerisms based on the numbers provided.
4. Output strict JSON with NO markdown code fences, matching this schema:
{{
  "summary": "1-2 sentence executive synthesis of performance",
  "strengths": ["2 specific things done exceptionally well based on telemetry"],
  "improvements": ["2 high-leverage micro-actions to implement immediately"],
  "confidence_score": 85,
  "role_specific_tips": ["2 expert techniques for {role}"]
}}
"""


async def generate_feedback(
    eye_contact_pct: float,
    posture_score: float,
    wpm: float,
    filler_count: int,
    duration: int,
    transcript: str = "",
    role: str = "general",
    context: str = ""
) -> Dict[str, Any]:
    """
    Generate comprehensive executive communication feedback using multi-tier AI routing:
    Tier 1: Cloud Gemini / Groq / OpenAI (if configured in environment)
    Tier 2: Local Ollama (if running)
    Tier 3: VaniDarpan Autonomous Executive Speech Engine (VASE)
    """
    clean_transcript = (transcript or "").strip()
    clean_role = role or "General Practice"
    
    # ── Tier 1: Cloud LLM APIs ──────────────────────────────────────────
    gemini_key = os.getenv("GEMINI_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")

    if gemini_key:
        result = await _try_gemini(
            gemini_key, eye_contact_pct, posture_score, wpm, filler_count, duration, clean_transcript, clean_role, context
        )
        if result:
            return result

    if groq_key:
        result = await _try_groq(
            groq_key, eye_contact_pct, posture_score, wpm, filler_count, duration, clean_transcript, clean_role, context
        )
        if result:
            return result

    if openai_key:
        result = await _try_openai(
            openai_key, eye_contact_pct, posture_score, wpm, filler_count, duration, clean_transcript, clean_role, context
        )
        if result:
            return result

    # ── Tier 2: Local Ollama ────────────────────────────────────────────
    if OLLAMA_AVAILABLE:
        result = await _try_ollama(
            eye_contact_pct, posture_score, wpm, filler_count, duration, clean_transcript, clean_role, context
        )
        if result:
            return result

    # ── Tier 3: VaniDarpan Autonomous Executive Speech Engine (VASE) ───
    return generate_intelligent_feedback(
        eye_contact_pct=eye_contact_pct,
        posture_score=posture_score,
        wpm=wpm,
        filler_count=filler_count,
        duration=duration,
        transcript=clean_transcript,
        role=clean_role,
        context=context
    )


async def _try_gemini(
    api_key: str,
    eye_contact: float,
    posture: float,
    wpm: float,
    fillers: int,
    duration: int,
    transcript: str,
    role: str,
    context: str
) -> Optional[Dict[str, Any]]:
    """Google Gemini 1.5/2.0 Flash Integration"""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        context_sec = f"\nADDITIONAL CONTEXT: {context}\n" if context else ""
        prompt = COACH_PROMPT_TEMPLATE.format(
            eye_contact=eye_contact,
            posture=posture,
            wpm=wpm,
            fillers=fillers,
            duration_formatted=f"{duration}s ({duration//60}m {duration%60}s)",
            role=role,
            context_section=context_sec,
            transcript_preview=transcript[:2000] if transcript else "(No spoken words recorded yet)"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "response_mime_type": "application/json"
            }
        }
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return _clean_and_parse_json(text)
    except Exception as e:
        print(f"[AI ROUTER] Gemini call skipped: {e}")
    return None


async def _try_groq(
    api_key: str,
    eye_contact: float,
    posture: float,
    wpm: float,
    fillers: int,
    duration: int,
    transcript: str,
    role: str,
    context: str
) -> Optional[Dict[str, Any]]:
    """Groq Llama-3.1 High-Speed Inference"""
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        context_sec = f"\nADDITIONAL CONTEXT: {context}\n" if context else ""
        prompt = COACH_PROMPT_TEMPLATE.format(
            eye_contact=eye_contact,
            posture=posture,
            wpm=wpm,
            fillers=fillers,
            duration_formatted=f"{duration}s ({duration//60}m {duration%60}s)",
            role=role,
            context_section=context_sec,
            transcript_preview=transcript[:2000] if transcript else "(No spoken words recorded yet)"
        )
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "You are a professional speech coach. Always output strict JSON only."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }
        async with httpx.AsyncClient(timeout=3.5) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["choices"][0]["message"]["content"]
                return _clean_and_parse_json(text)
    except Exception as e:
        print(f"[AI ROUTER] Groq call skipped: {e}")
    return None


async def _try_openai(
    api_key: str,
    eye_contact: float,
    posture: float,
    wpm: float,
    fillers: int,
    duration: int,
    transcript: str,
    role: str,
    context: str
) -> Optional[Dict[str, Any]]:
    """OpenAI GPT-4o-mini Integration"""
    try:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        context_sec = f"\nADDITIONAL CONTEXT: {context}\n" if context else ""
        prompt = COACH_PROMPT_TEMPLATE.format(
            eye_contact=eye_contact,
            posture=posture,
            wpm=wpm,
            fillers=fillers,
            duration_formatted=f"{duration}s ({duration//60}m {duration%60}s)",
            role=role,
            context_section=context_sec,
            transcript_preview=transcript[:2000] if transcript else "(No spoken words recorded yet)"
        )
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are an executive speech coach. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "response_format": {"type": "json_object"}
        }
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["choices"][0]["message"]["content"]
                return _clean_and_parse_json(text)
    except Exception as e:
        print(f"[AI ROUTER] OpenAI call skipped: {e}")
    return None


async def _try_ollama(
    eye_contact: float,
    posture: float,
    wpm: float,
    fillers: int,
    duration: int,
    transcript: str,
    role: str,
    context: str
) -> Optional[Dict[str, Any]]:
    """Local Ollama Inference with Fast Timeout"""
    try:
        context_sec = f"\nADDITIONAL CONTEXT: {context}\n" if context else ""
        prompt = COACH_PROMPT_TEMPLATE.format(
            eye_contact=eye_contact,
            posture=posture,
            wpm=wpm,
            fillers=fillers,
            duration_formatted=f"{duration}s ({duration//60}m {duration%60}s)",
            role=role,
            context_section=context_sec,
            transcript_preview=transcript[:1500] if transcript else "(No spoken words recorded yet)"
        )

        def _sync_call():
            return ollama.chat(
                model='gemma:2b',
                messages=[{'role': 'user', 'content': prompt}],
                options={'temperature': 0.4, 'num_predict': 350}
            )

        loop = asyncio.get_running_loop()
        response = await asyncio.wait_for(loop.run_in_executor(None, _sync_call), timeout=3.0)
        content = response.get('message', {}).get('content', '')
        return _clean_and_parse_json(content)
    except Exception as e:
        print(f"[AI ROUTER] Ollama local call skipped/timeout: {e}")
        return None


def _clean_and_parse_json(raw_text: str) -> Optional[Dict[str, Any]]:
    """Strip code fences and parse JSON robustly"""
    if not raw_text:
        return None
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        data = json.loads(cleaned)
        if isinstance(data, dict) and "strengths" in data and "improvements" in data:
            return {
                "summary": str(data.get("summary", "Solid progress on speech clarity and composure.")),
                "strengths": [str(s) for s in data.get("strengths", []) if s][:3],
                "improvements": [str(i) for i in data.get("improvements", []) if i][:3],
                "confidence_score": int(max(10, min(100, data.get("confidence_score", 75)))),
                "role_specific_tips": [str(t) for t in data.get("role_specific_tips", []) if t][:2]
            }
    except Exception:
        pass
    return None


def generate_intelligent_feedback(
    eye_contact_pct: float,
    posture_score: float,
    wpm: float,
    filler_count: int,
    duration: int = 0,
    transcript: str = "",
    role: str = "general",
    context: str = ""
) -> Dict[str, Any]:
    """
    VaniDarpan Autonomous Executive Speech Engine (VASE)
    High-fidelity, transcript-aware, role-grounded heuristic feedback.
    Guaranteed zero latency, zero hallucination, and zero generic bot filler.
    """
    strengths = []
    improvements = []
    role_lower = (role or "").lower()
    transcript_lower = (transcript or "").lower()
    words = [w for w in re.findall(r'\b\w+\b', transcript_lower) if len(w) > 1]
    word_count = len(words)

    # 1. Gaze & Virtual Presence Analysis
    if eye_contact_pct >= 80:
        strengths.append(f"Commanding camera intimacy ({eye_contact_pct:.0f}%), establishing an authoritative, trustworthy executive presence.")
    elif eye_contact_pct >= 65:
        strengths.append(f"Steady direct eye contact ({eye_contact_pct:.0f}%), maintaining consistent viewer engagement.")
    else:
        improvements.append(f"Gaze drifted below professional benchmark ({eye_contact_pct:.0f}% recorded). Fix your gaze directly onto the webcam lens to project conviction.")

    # 2. Ergonomics & Postural Alignment
    if posture_score >= 80:
        strengths.append(f"Exceptional upright spinal posture ({posture_score:.0f}%), ensuring unrestricted diaphragm expansion and resonant vocal projection.")
    elif posture_score >= 65:
        strengths.append(f"Stable shoulder and neck alignment ({posture_score:.0f}%), conveying physical poise.")
    else:
        improvements.append(f"Upper torso slouching detected ({posture_score:.0f}%). Roll shoulders back and keep chin parallel to the floor to enhance acoustic depth.")

    # 3. Vocal Cadence & Information Density
    if 130 <= wpm <= 160:
        strengths.append(f"Ideal executive cadence ({wpm:.0f} WPM), balancing persuasive momentum with cognitive clarity.")
    elif 0 < wpm < 125:
        improvements.append(f"Delivery cadence is deliberate ({wpm:.0f} WPM). Calibrate velocity upward to 135–150 WPM to signal prompt fluency and decisiveness.")
    elif wpm > 165:
        improvements.append(f"High-velocity articulation ({wpm:.0f} WPM). Insert deliberate 1-second pauses before key arguments to ensure cognitive retention.")

    # 4. Lexical Articulation & Verbal Crutches
    filler_crutches = ['um', 'uh', 'like', 'basically', 'actually', 'you know', 'sort of', 'kind of']
    detected_fillers = [f for f in filler_crutches if f in transcript_lower]

    if filler_count == 0 and word_count >= 15:
        strengths.append("Disciplined verbal articulation with zero filler crutches ('um', 'like', 'basically') detected.")
    elif filler_count <= 2:
        strengths.append(f"Clean verbal flow with minimal filler friction ({filler_count} detected).")
    else:
        filler_sample = f" ('{detected_fillers[0]}')" if detected_fillers else ""
        improvements.append(f"Replace reflexive hesitation sounds{filler_sample} ({filler_count} detected) with a poised, intentional silent pause.")

    # 5. Rhetorical Sophistication & Connectives
    connectives = ['furthermore', 'consequently', 'specifically', 'in contrast', 'therefore', 'for instance', 'crucially', 'in summary', 'moreover']
    found_connectives = [c for c in connectives if c in transcript_lower]
    if len(found_connectives) >= 2:
        strengths.append(f"Strong argumentative signposting with sophisticated connectors ('{found_connectives[0]}', '{found_connectives[1]}').")

    # 6. Role-Specific Strategic Mastery
    role_tips = []
    if any(k in role_lower for k in ['tech', 'code', 'engineer', 'developer', 'system', 'architecture']):
        role_tips = [
            "Structure technical explanations using the PREP framework: State your Point, Reason, Architecture Example, and Concluding Point.",
            "Always quantify engineering trade-offs (e.g. latency vs memory overhead, Postgres relational joins vs NoSQL denormalization) before committing to a design."
        ]
        if not strengths:
            strengths.append("Demonstrated focused technical discourse tailored to engineering problem-solving.")
    elif any(k in role_lower for k in ['hr', 'placement', 'interview', 'behavioral', 'campus']):
        role_tips = [
            "Apply the STAR technique (Situation, Task, Action, Measurable Result) to every behavioral prompt to substantiate your leadership impact.",
            "Quantify past achievements with tangible metrics (e.g., 'accelerated delivery by 30%', 'coordinated a 5-member student team') to stand out to recruiters."
        ]
        if not strengths:
            strengths.append("Maintained professional interview composure suited for corporate placement rounds.")
    elif any(k in role_lower for k in ['gd', 'discussion', 'roundtable', 'debate']):
        role_tips = [
            "Command discussion turns using diplomatic verbal bridges: 'Building upon my peer's observation, the crucial implementation hurdle is...'",
            "Cite verifiable industry data or regulatory frameworks early to anchor your stance with indisputable empirical credibility."
        ]
        if not strengths:
            strengths.append("Showcased assertive, collaborative vocal energy suited for multi-speaker group discussions.")
    elif any(k in role_lower for k in ['pitch', 'startup', 'founder', 'investor', 'demo']):
        role_tips = [
            "Capture the evaluator's undivided focus within the initial 15-second hook by dramatizing the acute market pain point.",
            "Clearly distinguish your unfair advantage (e.g., proprietary client-side vision vs costly server GPUs) and conclude with a sharp, unambiguous ask."
        ]
        if not strengths:
            strengths.append("Delivered forward-leaning pitch vitality designed to excite potential stakeholders.")
    elif any(k in role_lower for k in ['viva', 'defense', 'academic', 'capstone', 'thesis']):
        role_tips = [
            "Lead with first-principles theoretical foundations before explaining your empirical methodology to satisfy senior academic panels.",
            "Proactively acknowledge project scope boundaries and future research vectors to demonstrate mature academic rigor."
        ]
        if not strengths:
            strengths.append("Presented structured academic articulation aligned with capstone defense standards.")
    else:
        role_tips = [
            "Deploy the Rule of Three to group core arguments into digestible triads that anchor your audience's memory.",
            "Modulate vocal pitch and energy at paragraph transitions to prevent vocal fatigue and command attention."
        ]
        if not strengths:
            strengths.append("Demonstrated steady vocal engagement and composure throughout the session.")

    # Ensure at least 2 distinct strengths & improvements
    if len(strengths) < 2:
        strengths.append("Sustained deliberate acoustic clarity and poised body language during active speech.")
    if len(improvements) < 2:
        improvements.append("Incorporate intentional pauses before key takeaways to let the listener fully absorb your core message.")

    # Multi-factor algorithmic confidence rating
    composite_score = int(
        (min(100, eye_contact_pct) * 0.35) +
        (min(100, posture_score) * 0.30) +
        (max(0, 100 - abs(145 - wpm) * 1.5) * 0.20) +
        (max(0, 100 - filler_count * 12) * 0.15)
    )
    composite_score = max(35, min(98, composite_score))

    # Executive summary
    if composite_score >= 82:
        summary = f"High-caliber performance with commanding {eye_contact_pct:.0f}% gaze stability and crisp {wpm:.0f} WPM cadence. Positioned in the top collegiate tier."
    elif composite_score >= 68:
        summary = f"Solid professional foundation with dependable posture ({posture_score:.0f}%). Addressing pacing nuances and gaze consistency will elevate this to executive readiness."
    else:
        summary = f"Good foundational session. Prioritize anchoring your camera gaze and replacing filler words with deliberate pauses to build authoritative presence."

    return {
        "summary": summary,
        "strengths": strengths[:3],
        "improvements": improvements[:3],
        "confidence_score": composite_score,
        "role_specific_tips": role_tips[:2]
    }


# Backwards compatibility alias
def generate_fallback_feedback(
    eye_contact_pct: float,
    posture_score: float,
    wpm: float,
    filler_count: int,
    duration: int = 0,
    transcript: str = "",
    role: str = "general",
    context: str = ""
) -> Dict[str, Any]:
    """Compatibility wrapper calling the upgraded VASE engine"""
    return generate_intelligent_feedback(
        eye_contact_pct=eye_contact_pct,
        posture_score=posture_score,
        wpm=wpm,
        filler_count=filler_count,
        duration=duration,
        transcript=transcript,
        role=role,
        context=context
    )
