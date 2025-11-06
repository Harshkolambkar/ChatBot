from sqlalchemy import Column, Integer, String, VARCHAR, Sequence, Text
from database import Base

class User(Base):
    __tablename__ = "User"

    id = Column(Integer, Sequence('user_id_seq'), primary_key=True, index=True, nullable=False)
    name = Column(String(100), index=True)
    password = Column(VARCHAR(255))
    email = Column(VARCHAR(255), unique=True, index=True)

class SessionModel(Base):
    __tablename__ = "Session"

    id = Column(Integer, Sequence('session_id_seq'), primary_key=True, index=True, nullable=False)
    user_id = Column(Integer, index=True, nullable=False)
    session_token = Column(VARCHAR(255), unique=True, index=True, nullable=False)
    session_short_name = Column(String(100), index=True, nullable=True)

class ChatModel(Base):
    __tablename__ = "chats_2"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)  # Changed from VARCHAR
    session_id = Column(String(255), index=True, nullable=False)  # Changed nullable to False
    messages = Column(Text, nullable=False)  # Changed to Text and nullable False
    sender = Column(String(10), nullable=False)  # Added length and nullable False