# server-fastapi/models.py
from sqlalchemy import Column, String, Integer, Float, Text, TIMESTAMP, Boolean, JSON
from sqlalchemy.sql import func
from database import Base
import uuid

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(Text, nullable=False)
    name = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True, index=True)
    topic = Column(Text, nullable=True)
    mode = Column(String, default='practice')
    duration = Column(Integer, nullable=False, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    eye_contact_percentage = Column(Float, nullable=False, default=0)
    confidence_score = Column(Float, nullable=False, default=0)
    words_per_minute = Column(Float, nullable=False, default=0)
    filler_words_count = Column(Integer, nullable=False, default=0)
    posture_score = Column(Float, default=0)
    posture_data = Column(JSON, default=list)
    transcript = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=False, default=list)
    improvements = Column(JSON, nullable=False, default=list)
    eye_contact_data = Column(JSON, nullable=False, default=list)
    is_public = Column(Boolean, default=False)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    email = Column(String, nullable=False, index=True)
    token = Column(String, unique=True, nullable=False, index=True)
    expires_at = Column(TIMESTAMP, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=True, index=True)
    session_id = Column(String, nullable=True, index=True)
    rating = Column(Integer, nullable=False, default=5)
    had_issue = Column(Boolean, default=False)
    comment = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
