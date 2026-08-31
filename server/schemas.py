# server-fastapi/schemas.py
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]

    class Config:
        from_attributes = True

# Session schemas
class SessionCreate(BaseModel):
    topic: str
    userId: Optional[str] = None

class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    userId: Optional[str] = Field(None, alias='user_id')
    topic: Optional[str] = None
    mode: str = 'practice'
    duration: int = 0
    createdAt: datetime = Field(alias='created_at')
    eyeContactPercentage: float = Field(0.0, alias='eye_contact_percentage')
    confidenceScore: float = Field(0.0, alias='confidence_score')
    wordsPerMinute: float = Field(0.0, alias='words_per_minute')
    fillerWordsCount: int = Field(0, alias='filler_words_count')
    postureScore: float = Field(0.0, alias='posture_score')
    postureData: List[Dict[str, Any]] = Field(default_factory=list, alias='posture_data')
    transcript: Optional[str] = None
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    eyeContactData: List[Dict[str, Any]] = Field(default_factory=list, alias='eye_contact_data')
    isPublic: bool = Field(False, alias='is_public')

class SessionCompleteResponse(BaseModel):
    session: SessionResponse
    transcriptionError: Optional[str] = None


class LiveFeedbackRequest(BaseModel):
    eyeContactPercentage: float
    postureScore: float
    wordsPerMinute: float = 0
    fillerWordsCount: int = 0
    duration: int
    topic: Optional[str] = "general"
    transcript: Optional[str] = None
    facePosition: Optional[str] = None
    headTilt: Optional[str] = None
    isInFrame: Optional[bool] = True


class LiveFeedbackResponse(BaseModel):
    summary: str
    strengths: List[str]
    improvements: List[str]
    confidence_score: int
    role_specific_tips: List[str]