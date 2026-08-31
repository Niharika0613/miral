# server-fastapi/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from config import settings

# Convert postgres:// to postgresql+asyncpg:// and handle sslmode
DATABASE_URL = settings.database_url

# Parse the URL to extract query parameters
parsed = urlparse(DATABASE_URL)
query_params = parse_qs(parsed.query)

# Remove sslmode and other asyncpg-incompatible parameters from query string
# asyncpg doesn't support these as URL parameters and will cause errors
sslmode = None
if 'sslmode' in query_params:
    sslmode = query_params.pop('sslmode')[0]

# Remove any other parameters that might cause issues with asyncpg
# (channel_binding, sslcert, sslkey, etc. are handled differently in asyncpg)
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
if parsed.scheme == "postgres":
    parsed = parsed._replace(scheme="postgresql+asyncpg")
elif parsed.scheme == "postgresql":
    parsed = parsed._replace(scheme="postgresql+asyncpg")

DATABASE_URL = urlunparse(parsed)

# Configure connect_args for SSL
# Neon database requires SSL, but asyncpg handles it automatically
# We should NOT pass ssl parameter directly to avoid "channel_binding" errors
# asyncpg will negotiate SSL automatically if the server requires it
connect_args = {}
# Only explicitly disable SSL if requested
if sslmode == 'disable':
    connect_args['ssl'] = False
# For all other cases (including Neon), let asyncpg handle SSL automatically
# Don't set ssl=True as it can cause "channel_binding" parameter errors

# Create async engine with increased timeout for Neon serverless
# For Neon: asyncpg will automatically use SSL when the server requires it
# We only pass connect_args if we need to explicitly disable SSL
connect_args["timeout"] = 30  # Increase connection timeout to 30 seconds
connect_args["command_timeout"] = 30  # Increase command timeout

engine_kwargs = {
    "echo": False,  # Set to True for SQL query logging
    "future": True,
    "pool_pre_ping": True,
    "pool_size": 5,
    "max_overflow": 10,
    "pool_timeout": 30,
    "pool_recycle": 3600,  # Recycle connections after 1 hour
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
