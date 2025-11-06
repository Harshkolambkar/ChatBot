import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Check if DATABASE_URL is provided (production)
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Production: Use DATABASE_URL from Render
    # Render provides postgres:// but SQLAlchemy needs postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
else:
    # Development: Use individual parameters
    database_user = os.getenv("database_user", "postgres")
    database_password = os.getenv("database_password", "12345")
    database_host = os.getenv("database_host", "localhost")
    database_port = os.getenv("database_port", "5432")
    database_name = os.getenv("database_name", "chatbot")
    
    SQLALCHEMY_DATABASE_URL = f"postgresql://{database_user}:{database_password}@{database_host}:{database_port}/{database_name}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()