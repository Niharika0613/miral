# server-fastapi/routes.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Dict, Any
import json
import os
import secrets
from datetime import datetime, timedelta
import aiofiles

from database import get_db, SqliteSessionLocal, sqlite_engine, Base
from storage import storage
from auth import verify_password
from openai_service import transcribe_audio
from audio_utils import (
    detect_filler_words,
    calculate_words_per_minute,
    generate_confidence_score,
)
from ollama_service import generate_feedback
from schemas import (
    UserSignup,
    UserLogin,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    FeedbackCreate,
    FeedbackResponse,
    SessionCreate,
    SessionResponse,
    SessionCompleteResponse,
    LiveFeedbackRequest,
    LiveFeedbackResponse,
)

router = APIRouter()

# ============ AUTH ROUTES ============

@router.post("/api/auth/signup", response_model=dict)
async def signup(user_data: UserSignup, db: AsyncSession = Depends(get_db)):
    """
    User signup with automatic SQLite fallback
    """
    if not user_data.email or not user_data.password:
        raise HTTPException(status_code=400, detail='Email and password required')

    async def _execute_signup(session: AsyncSession):
        existing_user = await storage.get_user(user_data.email, session)
        if existing_user:
            raise HTTPException(status_code=400, detail='Email already registered')
        
        user = await storage.create_user(
            email=user_data.email,
            password=user_data.password,
            name=user_data.name,
            db=session
        )
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        }

    try:
        return await _execute_signup(db)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[SIGNUP NOTICE] Retrying signup on local SQLite fallback due to: {e}")
        try:
            async with sqlite_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            async with SqliteSessionLocal() as fb_session:
                return await _execute_signup(fb_session)
        except HTTPException:
            raise
        except Exception as fb_err:
            raise HTTPException(status_code=500, detail=str(fb_err))

@router.post("/api/auth/login", response_model=dict)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    User login with automatic SQLite fallback
    """
    if not user_data.email or not user_data.password:
        raise HTTPException(status_code=400, detail='Email and password required')

    async def _execute_login(session: AsyncSession):
        user = await storage.get_user(user_data.email, session)
        if not user or not verify_password(user_data.password, user.password):
            raise HTTPException(status_code=401, detail='Invalid credentials')
        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name
            }
        }

    try:
        return await _execute_login(db)
    except HTTPException:
        raise
    except Exception as e:
        print(f"[LOGIN NOTICE] Retrying login on local SQLite fallback due to: {e}")
        try:
            async with sqlite_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            async with SqliteSessionLocal() as fb_session:
                return await _execute_login(fb_session)
        except HTTPException:
            raise
        except Exception as fb_err:
            raise HTTPException(status_code=500, detail=str(fb_err))

@router.post("/api/auth/forgot-password", response_model=dict)
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Generate a password reset token"""
    try:
        user = await storage.get_user(data.email, db)
        if not user:
            return {
                "status": "ok",
                "message": "If an account exists with this email, a password reset token has been generated."
            }
        
        token = secrets.token_urlsafe(24)
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        
        await storage.create_password_reset_token(
            user_id=user.id,
            email=user.email,
            token=token,
            expires_at=expires_at,
            db=db
        )
        
        return {
            "status": "ok",
            "message": "Password reset token generated successfully. Valid for 15 minutes.",
            "resetToken": token
        }
    except Exception as e:
        print(f"Error in forgot_password: {e}")
        raise HTTPException(status_code=500, detail="Failed to process password reset")

@router.post("/api/auth/reset-password", response_model=dict)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using a valid token"""
    try:
        reset_token = await storage.get_password_reset_token(data.token, db)
        if not reset_token or reset_token.is_used or reset_token.expires_at < datetime.utcnow():
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        await storage.update_user_password(reset_token.user_id, data.newPassword, db)
        await storage.mark_password_reset_token_used(reset_token.id, db)
        
        return {
            "status": "ok",
            "message": "Password has been successfully updated. Please sign in with your new password."
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in reset_password: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset password")

# ============ FEEDBACK ROUTES ============

@router.post("/api/feedback", response_model=dict)
async def submit_feedback(data: FeedbackCreate, db: AsyncSession = Depends(get_db)):
    """Submit in-app session feedback"""
    try:
        feedback = await storage.create_feedback(
            user_id=None,
            session_id=data.sessionId,
            rating=data.rating,
            had_issue=data.hadIssue,
            comment=data.comment,
            db=db
        )
        return {
            "status": "ok",
            "id": feedback.id,
            "message": "Thank you for your feedback!"
        }
    except Exception as e:
        print(f"Error in submit_feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

@router.get("/api/feedback", response_model=List[FeedbackResponse])
async def get_feedback(db: AsyncSession = Depends(get_db)):
    """Retrieve all feedback for admin review"""
    feedback_list = await storage.get_all_feedback(db)
    return feedback_list

# ============ SESSION ROUTES ============

@router.post("/api/sessions", response_model=SessionResponse)
async def create_session(
    session_data: SessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create new practice session
    Matches: POST /api/sessions from routes.ts
    """
    try:
        session = await storage.create_session(
            topic=session_data.topic or 'Untitled Session',
            user_id=session_data.userId,
            db=db
        )
        return session
    
    except Exception as e:
        print(f'Error creating session: {e}')
        raise HTTPException(status_code=500, detail=str(e))

def serialize_session(session) -> dict:
    resp = SessionResponse.model_validate(session)
    camel = resp.model_dump(by_alias=False)
    snake = resp.model_dump(by_alias=True)
    return {**snake, **camel}

@router.get("/api/sessions")
async def get_sessions(
    userId: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all sessions (optionally filtered by user)
    Matches: GET /api/sessions from routes.ts
    """
    try:
        sessions = await storage.get_all_sessions(userId, db)
        if sessions is None:
            return []
        
        return [serialize_session(session) for session in sessions]
    
    except Exception as e:
        import traceback
        error_msg = f'Error fetching sessions: {e}'
        print(error_msg)
        print(f'Traceback: {traceback.format_exc()}')
        raise HTTPException(status_code=500, detail=error_msg)

@router.get("/api/sessions/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get specific session by ID
    Matches: GET /api/sessions/:id from routes.ts
    """
    try:
        session = await storage.get_session(session_id, db)
        
        if not session:
            raise HTTPException(status_code=404, detail='Session not found')
        
        return serialize_session(session)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f'Error fetching session: {e}')
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/sessions/{session_id}/complete", response_model=SessionCompleteResponse)
async def complete_session(
    session_id: str,
    duration: float = Form(0),
    eyeContactPercentage: float = Form(0),
    postureScore: float = Form(0),
    wordsPerMinute: float = Form(0),
    fillerWordsCount: int = Form(0),
    transcript: str = Form(""),
    eyeContactData: str = Form("[]"),
    postureData: str = Form("[]"),
    audio: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Complete session with audio analysis
    Matches: POST /api/sessions/:id/complete from routes.ts
    """
    uploaded_file_path = None
    
    try:
        # Validate duration
        if duration < 0:
            duration = 0
        
        # Parse JSON data
        try:
            eye_contact_data = json.loads(eyeContactData)
            if not isinstance(eye_contact_data, list):
                eye_contact_data = []
        except Exception:
            eye_contact_data = []
        
        try:
            posture_data = json.loads(postureData)
            if not isinstance(posture_data, list):
                posture_data = []
        except Exception:
            posture_data = []
        
        # Check if session exists or create it
        session = await storage.get_session(session_id, db)
        if not session:
            session = await storage.create_session_with_id(
                session_id=session_id,
                topic="Practice Session",
                user_id=None,
                db=db
            )
        
        # Initialize variables
        session_transcript = transcript  # Save form parameter
        transcript = ''  # For audio transcription
        filler_words_count = fillerWordsCount  # Use provided count from frontend
        words_per_minute = wordsPerMinute  # Use provided WPM
        transcription_error = None
        
        # Process audio if provided
        if audio:
            # Create uploads directory
            upload_dir = "server-fastapi/uploads"
            os.makedirs(upload_dir, exist_ok=True)
            
            # Save uploaded file
            uploaded_file_path = os.path.join(upload_dir, audio.filename)
            
            async with aiofiles.open(uploaded_file_path, 'wb') as f:
                content = await audio.read()
                await f.write(content)
            
            # Always attempt local transcription (Vosk); handle any errors gracefully
            try:
                # Transcribe audio
                transcript = await transcribe_audio(uploaded_file_path)
                
                # Analyze transcript
                filler_words = detect_filler_words(transcript)
                filler_words_count = sum(fw['count'] for fw in filler_words)
                words_per_minute = calculate_words_per_minute(transcript, duration)
            
            except Exception as e:
                transcription_error = str(e)
                print(f'Error transcribing audio: {e}')
                # Use live transcript as fallback
                if session_transcript:
                    transcript = session_transcript
            
            # Clean up uploaded file
            if os.path.exists(uploaded_file_path):
                os.remove(uploaded_file_path)
                uploaded_file_path = None
        
        # Use provided averages (already calculated in frontend)
        eye_contact_percentage = eyeContactPercentage
        posture_score = postureScore
        
        # Always prefer live transcript over audio transcription
        if session_transcript:
            transcript = session_transcript
            # Recalculate WPM from transcript if we have it
            if transcript:
                filler_words = detect_filler_words(transcript)
                filler_words_count = sum(fw['count'] for fw in filler_words)
                words_per_minute = calculate_words_per_minute(transcript, duration)
        
        # Ensure we have valid values
        eye_contact_percentage = max(0, min(100, eye_contact_percentage))
        posture_score = max(0, min(100, posture_score))
        words_per_minute = max(0, words_per_minute)
        
        print(f'📊 Final metrics for session {session_id}:')
        print(f'  Duration: {duration}s')
        print(f'  Eye Contact: {eye_contact_percentage}%')
        print(f'  Posture: {posture_score}%')
        print(f'  WPM: {words_per_minute}')
        print(f'  Fillers: {filler_words_count}')
        print(f'  Transcript length: {len(transcript)} chars')
        
        # Base confidence score using rule-based metrics
        confidence_score = generate_confidence_score(
            eye_contact_percentage,
            words_per_minute,
            filler_words_count,
            duration
        )

        # === AI feedback via Ollama Gemma:2b (DISABLED for speed) ===
        # Skip Ollama to make processing instant - use rule-based feedback
        strengths = []
        improvements = []
        
        # Generate rule-based feedback
        if eye_contact_percentage >= 70:
            strengths.append("Excellent eye contact - very engaging!")
        else:
            improvements.append(f"Improve eye contact (current: {eye_contact_percentage:.0f}%)")
        
        if 130 <= words_per_minute <= 160:
            strengths.append("Perfect speaking pace")
        elif words_per_minute < 120:
            improvements.append("Speak slightly faster for better engagement")
        elif words_per_minute > 160:
            improvements.append("Slow down for better clarity")
        
        if posture_score >= 70:
            strengths.append("Good posture maintained")
        else:
            improvements.append("Maintain better posture")
        
        if filler_words_count < 5:
            strengths.append("Minimal filler words - great!")
        else:
            improvements.append(f"Reduce filler words ({filler_words_count} detected)")
        
        # Ensure we have at least some feedback
        if not strengths:
            strengths = ["Completed the practice session"]
        if not improvements:
            improvements = ["Keep practicing to improve"]
        
        # Update session - use live transcript if available, otherwise use transcribed audio
        final_transcript = session_transcript if session_transcript else (transcript if transcript else None)
        
        update_data = {
            'duration': int(duration),
            'eye_contact_percentage': float(eye_contact_percentage),
            'confidence_score': float(confidence_score),
            'words_per_minute': float(words_per_minute),
            'filler_words_count': int(filler_words_count),
            'posture_score': float(posture_score),
            'posture_data': posture_data if isinstance(posture_data, list) else [],
            'transcript': final_transcript or "",
            'strengths': strengths if strengths else ["Completed the practice session"],
            'improvements': improvements if improvements else ["Keep practicing to improve"],
            'eye_contact_data': eye_contact_data if isinstance(eye_contact_data, list) else [],
        }
        
        print(f'💾 Updating session {session_id} with data: {update_data}')
        updated_session = await storage.update_session(session_id, update_data, db)
        print(f'✅ Session updated successfully')
        
        result = {
            "session": updated_session,
            "transcriptionError": transcription_error
        }
        print(f'📤 Returning result: confidence={confidence_score}, eye_contact={eye_contact_percentage}%, posture={posture_score}%')
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        print(f'Error completing session: {e}')
        
        # Clean up file if error occurred
        if uploaded_file_path and os.path.exists(uploaded_file_path):
            os.remove(uploaded_file_path)
        
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/feedback/live", response_model=LiveFeedbackResponse)
async def live_feedback(metrics: LiveFeedbackRequest):
    """
    Generate near-live AI coaching feedback using current session metrics.
    """
    try:
        topic = metrics.topic or "general"
        base_confidence = generate_confidence_score(
            metrics.eyeContactPercentage,
            metrics.wordsPerMinute,
            metrics.fillerWordsCount,
            metrics.duration
        )

        # Build context string for more dynamic prompts
        context_parts = []
        if not metrics.isInFrame:
            context_parts.append("User is currently OUT OF FRAME")
        elif metrics.facePosition and metrics.facePosition != 'center':
            context_parts.append(f"User is positioned: {metrics.facePosition}")
        if metrics.headTilt and metrics.headTilt != 'straight':
            context_parts.append(f"Head tilt: {metrics.headTilt}")
        
        context = ". ".join(context_parts) if context_parts else "User is well-positioned"

        feedback = await generate_feedback(
            eye_contact_pct=metrics.eyeContactPercentage,
            posture_score=metrics.postureScore,
            wpm=metrics.wordsPerMinute,
            filler_count=metrics.fillerWordsCount,
            duration=metrics.duration,
            transcript=metrics.transcript or "",
            role=topic,
            context=context
        )

        return {
            "summary": feedback.get("summary") or "Keep going – stay focused and confident!",
            "strengths": feedback.get("strengths") or [],
            "improvements": feedback.get("improvements") or [],
            "confidence_score": int(feedback.get("confidence_score") or base_confidence),
            "role_specific_tips": feedback.get("role_specific_tips") or []
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating live feedback: {e}")
        raise HTTPException(status_code=500, detail="Unable to generate live feedback. Please try again.")
