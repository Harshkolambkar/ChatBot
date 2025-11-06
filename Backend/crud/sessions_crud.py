from sqlalchemy.orm import Session
import models
import schemas.sessions_schemas as session_schemas

def create_session(db: Session, session: session_schemas.SessionCreate):
    import uuid
    session_token = str(uuid.uuid4())
    db_session = models.SessionModel(user_id=session.user_id, session_token=session_token)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return session_token

def fetch_session(db: Session, user_id: int):
    db_sessions = db.query(models.SessionModel.session_token, models.SessionModel.session_short_name).filter(models.SessionModel.user_id == user_id).all()
    sessions_list = []
    for session in db_sessions:
        sessions_list.append({
            "session_token": session.session_token,
            "session_short_name": session.session_short_name
        })
    return sessions_list

def delete_session(db: Session, session_token: str):
    db_session = db.query(models.SessionModel).filter(models.SessionModel.session_token == session_token).first()
    if db_session:
        db.delete(db_session)
        db.commit()
        return True
    return False

def update_session_name(db: Session, session_token: str, session_short_name: str) -> bool:
    """
    Update the session name for an existing session
    
    Args:
        db (Session): SQLAlchemy database session
        session_token (str): Unique token identifying the session
        session_short_name (str): New name for the session
        
    Returns:
        bool: True if update was successful, False if session not found
        
    Raises:
        Exception: If there's an error during the database operation
    """
    try:
        # Find the session by token
        db_session = db.query(models.SessionModel).filter(
            models.SessionModel.session_token == session_token
        ).first()
        
        if db_session:
            # Update the session name
            db_session.session_short_name = session_short_name
            db.commit()
            return True
        return False
        
    except Exception as e:
        db.rollback()
        raise Exception(f"Error updating session name: {str(e)}")
        
def store_session_name(db: Session, session_token: str, session_short_name: str) -> bool:
    """
    Store the session short name in the database for an existing session
    
    Args:
        db (Session): SQLAlchemy database session
        session_token (str): Unique token for the session
        session_short_name (str): Generated name for the session
        
    Returns:
        bool: True if storage was successful, False if session not found
    """
    try:
        # Input validation
        if not all([session_token, session_short_name]):
            raise ValueError("Both session_token and session_short_name are required")
            
        # Find the session by token
        db_session = db.query(models.SessionModel).filter(
            models.SessionModel.session_token == session_token
        ).first()
        
        if db_session:
            # Update the session name
            db_session.session_short_name = session_short_name
            db.commit()
            return True
            
        return False
        
    except Exception as e:
        db.rollback()
        raise ValueError(f"Error storing session name: {str(e)}")