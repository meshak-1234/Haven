from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.app.core.config import settings

_database_url = settings.get_database_url()

# SQLite requires check_same_thread=False for multi-threaded FastAPI usage.
# For all other engines, use production-grade connection pool settings.
if _database_url.startswith("sqlite"):
    engine = create_engine(
        _database_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )
else:
    engine = create_engine(
        _database_url,
        pool_pre_ping=True,       # test connections before handing from pool
        pool_recycle=3600,        # recycle connections after 1 hour (prevents stale connections)
        pool_size=10,             # maintain up to 10 persistent connections
        max_overflow=20,          # allow up to 20 additional overflow connections under heavy load
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a database session and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
