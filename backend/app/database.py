import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# REMOVED: SQLite fallback logic
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set. PostgreSQL is required.")

# Ensure the driver is specified for SQLAlchemy
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine_args = {
    "future": True,
    "pool_pre_ping": True, # Ensures connections are alive
    "pool_size": 20,       # Optimization for concurrent users
    "max_overflow": 10,
}

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
