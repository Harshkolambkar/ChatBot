from sqlalchemy.orm import Session
import models
from typing import List
from schemas.chat_schemas import ChatMessage
from fastapi import HTTPException

def delete_session(db: Session, session_id: str):
    db_session = db.query(models.ChatModel).filter(models.ChatModel.session_id == session_id).first()
    if db_session:
        db.delete(db_session)
        db.commit()
        return True
    return False

def get_chat_messages(db: Session, session_id: str) -> List[ChatMessage]:
    try:
        # Query messages for the session
        db_chat = db.query(models.ChatModel).filter(
            models.ChatModel.session_id == session_id
        ).order_by(models.ChatModel.id.asc()).all()
        
        print(f"Found {len(db_chat)} messages for session {session_id}")
        
        formatted_messages = []
        for chat in db_chat:
            if chat.messages and chat.sender:  # Only check for required fields
                formatted_messages.append(ChatMessage(
                    sender=chat.sender,
                    messages=chat.messages
                ))
            else:
                print(f"Skipping incomplete chat message: {chat}")
                
        return formatted_messages
        
    except Exception as e:
        print(f"Error fetching chat messages: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching chat messages: {str(e)}"
        )