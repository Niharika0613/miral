# server-fastapi/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from config import settings

DATABASE_URL = settings.database_url

if DATABASE_URL.startswith("sqlite"):
    if not DATABASE_URL.startswith("sqlite+aiosqlite"):
        DATABASE_URL = DATABASE_URL.replace("sqlite://", "sqlite+aiosqlite://", 1)
    engine_kwargs = {
        "echo": False,
        "future": True,
    }
else:
    # Parse the URL to extract query parameters
    parsed = urlparse(DATABASE_URL)
    query_params = parse_qs(parsed.query)

    # Remove sslmode and other asyncpg-incompatible parameters from query string
    sslmode = None
    if 'sslmode' in query_params:
        sslmode = query_params.pop('sslmode')[0]

    # Remove any other parameters that might cause issues with asyncpg
    incompatible_params = ['channel_binding', 'sslcert', 'sslkey', 'sslrootcert']
    for param in incompatible_params:
        if param in query_params:
            query_params.pop(param)

    # Rebuild query string without incompatible parameters
    if query_params:
        new_query = urlencode(query_params, doseq=True)
        parsed = parsed._replace(query=new_query)
    else:
        parsed = parsed._replace(query='')

    # Convert postgres:// to postgresql+asyncpg://
    if parsed.scheme in ["postgres", "postgresql"]:
        parsed = parsed._replace(scheme="postgresql+asyncpg")

    DATABASE_URL = urlunparse(parsed)

    connect_args = {
        "timeout": 30,
        "command_timeout": 30
    }
    if sslmode == 'disable':
        connect_args['ssl'] = False
    else:
        connect_args['ssl'] = True

    engine_kwargs = {
        "echo": False,
        "future": True,
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 3600,
        "connect_args": connect_args,
    }

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

# Dependency for routes
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
