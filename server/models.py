# server-fastapi/models.py
from sqlalchemy import Column, String, Integer, Float, Text, TIMESTAMP, Boolean
from sqlalchemy.dialects.postgresql import JSONB, UUID
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
    user_id = Column(String, nullable=True, index=True)  # Match userId in schema
    topic = Column(Text, nullable=True)
    mode = Column(String, default='practice')
    duration = Column(Integer, nullable=False, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    eye_contact_percentage = Column(Float, nullable=False, default=0)  # Match eyeContactPercentage
    confidence_score = Column(Float, nullable=False, default=0)
    words_per_minute = Column(Float, nullable=False, default=0)  # Match wordsPerMinute
    filler_words_count = Column(Integer, nullable=False, default=0)  # Match fillerWordsCount
    posture_score = Column(Float, default=0)
    posture_data = Column(JSONB, default=list)
    transcript = Column(Text, nullable=True)
    strengths = Column(JSONB, nullable=False, default=list)
    improvements = Column(JSONB, nullable=False, default=list)
    eye_contact_data = Column(JSONB, nullable=False, default=list)  # Match eyeContactData
    is_public = Column(Boolean, default=False)
