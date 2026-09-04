# server-fastapi/database.py
import os
import socket
import ssl as ssl_lib
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from config import settings

Base = declarative_base()

# 1. Prepare SQLite Local Fallback Engine
SQLITE_URL = "sqlite+aiosqlite:///./miral.db"
sqlite_engine = create_async_engine(
    SQLITE_URL,
    echo=False,
    future=True,
    connect_args={"check_same_thread": False}
)
SqliteSessionLocal = async_sessionmaker(
    sqlite_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# 2. Prepare Primary Engine (PostgreSQL / Supabase or SQLite)
raw_db_url = settings.database_url or SQLITE_URL
primary_engine = None
PrimarySessionLocal = None

if raw_db_url.startswith("sqlite"):
    if not raw_db_url.startswith("sqlite+aiosqlite"):
        raw_db_url = raw_db_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    primary_engine = create_async_engine(raw_db_url, echo=False, future=True)
    PrimarySessionLocal = async_sessionmaker(
        primary_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False
    )
else:
    try:
        parsed = urlparse(raw_db_url)
        query_params = parse_qs(parsed.query)

        sslmode = query_params.pop('sslmode', [None])[0]
        incompatible_params = ['channel_binding', 'sslcert', 'sslkey', 'sslrootcert']
        for param in incompatible_params:
            query_params.pop(param, None)

        new_query = urlencode(query_params, doseq=True) if query_params else ''
        parsed = parsed._replace(query=new_query)

        connect_args = {
            "timeout": 15,
            "command_timeout": 15,
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0
        }

        if sslmode == 'disable':
            connect_args['ssl'] = False
        else:
            connect_args['ssl'] = True

        if parsed.scheme in ["postgres", "postgresql"]:
            parsed = parsed._replace(scheme="postgresql+asyncpg")

        pg_url = urlunparse(parsed)

        primary_engine = create_async_engine(
            pg_url,
            echo=False,
            future=True,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            pool_timeout=15,
            pool_recycle=1800,
            connect_args=connect_args
        )
        PrimarySessionLocal = async_sessionmaker(
            primary_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False
        )
    except Exception as e:
        print(f"[DATABASE] Error configuring PostgreSQL engine: {e}. Falling back to SQLite.")
        primary_engine = sqlite_engine
        PrimarySessionLocal = SqliteSessionLocal

# Export active engine for startup metadata initialization
engine = primary_engine or sqlite_engine
AsyncSessionLocal = PrimarySessionLocal or SqliteSessionLocal

async def init_db_tables():
    """Initializes tables on both primary and fallback engines safely"""
    # 1. Initialize primary
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[DATABASE] Primary database tables initialized successfully.")
    except Exception as e:
        print(f"[DATABASE] Primary DB table init failed ({e}). Initializing SQLite fallback...")
        async with sqlite_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[DATABASE] SQLite fallback tables ready.")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields a working database session with automatic failover"""
    session_factory = AsyncSessionLocal
    
    try:
        async with session_factory() as session:
            # Test connectivity with a lightweight check
            try:
                yield session
            except Exception as conn_err:
                await session.rollback()
                raise conn_err
    except Exception as outer_err:
        err_str = str(outer_err).lower()
        if "network is unreachable" in err_str or "name or service not known" in err_str or "connection" in err_str:
            print(f"[DATABASE] Primary connection error ({outer_err}). Switching request to SQLite fallback session.")
            # Ensure SQLite tables exist
            async with sqlite_engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            async with SqliteSessionLocal() as fallback_session:
                try:
                    yield fallback_session
                except Exception as fb_err:
                    await fallback_session.rollback()
                    raise fb_err
        else:
            raise outer_err
