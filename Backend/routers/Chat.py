from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import sys
import os
from typing import List
import crud.chat_crud as chat_crud
import schemas.chat_schemas as chat_schemas

# Add the Agent directory to Python path
agent_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'Agent'))
sys.path.insert(0, agent_path)

from Agent.Chat import chat_with_agent

import schemas.sessions_schemas as session_schemas
import crud.sessions_crud as sessions_crud
import database
import models

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
    responses={404: {"description": "Not found"}},
)

class ChatRequest(BaseModel):
    session_token: str
    message: str

class ChatResponse(BaseModel):
    response: str
    session_token: str

from schemas.chat_schemas import ChatMessage, ChatResponse as ChatMessageResponse

class ChatHistoryResponse(BaseModel):
    messages: List[ChatMessage]
    session_token: str

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ChatResponse)
def chat(chat_request: ChatRequest, db: Session = Depends(get_db)):
    # Verify session exists
    session_exists = db.query(models.SessionModel).filter(
        models.SessionModel.session_token == chat_request.session_token
    ).first()
    
    if not session_exists:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        # Use session_token as session_id for the chat agent
        ai_response = chat_with_agent(chat_request.session_token, chat_request.message)
        
        return ChatResponse(
            response=ai_response,
            session_token=chat_request.session_token
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@router.get("/{session_token}", response_model=chat_schemas.ChatResponse)
def get_chat(session_token: str, db: Session = Depends(get_db)):
    # Verify session exists
    session_exists = db.query(models.SessionModel).filter(
        models.SessionModel.session_token == session_token
    ).first()

    if not session_exists:
        raise HTTPException(status_code=404, detail="Session not found")

    try:
        messages = chat_crud.get_chat_messages(db, session_token)
        return chat_schemas.ChatResponse(messages=messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat fetching failed: {str(e)}")