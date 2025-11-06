from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
load_dotenv()

database_user = os.getenv("database_user")
database_password = os.getenv("database_password")
database_host = os.getenv("database_host")
database_port = os.getenv("database_port")
database_name = os.getenv("database_name")

Database_url = f"postgresql://{database_user}:{database_password}@{database_host}:{database_port}/{database_name}"
engine = create_engine(Database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()