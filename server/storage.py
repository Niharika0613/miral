# server-fastapi/storage.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.sql import desc
from typing import Optional, List, Dict, Any
import uuid

from models import User, Session
from auth import hash_password

class DatabaseStorage:
    """
    Database storage operations
    Matches: DatabaseStorage class from storage.ts
    """
    
    async def create_session(
        self, 
        topic: str, 
        user_id: Optional[str],
        db: AsyncSession
    ) -> Session:
        """Create new practice session"""
        new_session = Session(
            id=str(uuid.uuid4()),
            topic=topic,
            user_id=user_id,
            duration=0,
            eye_contact_percentage=0,
            confidence_score=0,
            words_per_minute=0,
            filler_words_count=0,
            transcript='',
            strengths=[],
            improvements=[],
            eye_contact_data=[],
        )
        
        db.add(new_session)
        await db.commit()
        await db.refresh(new_session)
        return new_session
    
    async def get_session(self, session_id: str, db: AsyncSession) -> Optional[Session]:
        """Get session by ID"""
        result = await db.execute(
            select(Session).where(Session.id == session_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all_sessions(
        self, 
        user_id: Optional[str],
        db: AsyncSession
    ) -> List[Session]:
        """Get all sessions, optionally filtered by user"""
        if user_id:
            return await self.get_user_sessions(user_id, db)
        
        result = await db.execute(
            select(Session).order_by(desc(Session.created_at))
        )
        return result.scalars().all()
    
    async def get_user_sessions(self, user_id: str, db: AsyncSession) -> List[Session]:
        """Get all sessions for a specific user"""
        result = await db.execute(
            select(Session)
            .where(Session.user_id == user_id)
            .order_by(desc(Session.created_at))
        )
        return result.scalars().all()
    
    async def update_session(
        self, 
        session_id: str, 
        data: Dict[str, Any],
        db: AsyncSession
    ) -> Session:
        """Update session with analysis results"""
        await db.execute(
            update(Session)
            .where(Session.id == session_id)
            .values(**data)
        )
        await db.commit()
        
        # Fetch and return updated session
        return await self.get_session(session_id, db)
    
    async def create_user(
        self, 
        email: str, 
        password: str, 
        name: Optional[str],
        db: AsyncSession
    ) -> User:
        """Create new user with hashed password"""
        hashed_password = hash_password(password)
        
        new_user = User(
            id=str(uuid.uuid4()),
            email=email,
            password=hashed_password,
            name=name
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    
    async def get_user(self, email: str, db: AsyncSession) -> Optional[User]:
        """Get user by email"""
        result = await db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_user_by_id(self, user_id: str, db: AsyncSession) -> Optional[User]:
        """Get user by ID"""
        result = await db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

# Global storage instance
storage = DatabaseStorage()
