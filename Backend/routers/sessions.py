from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import schemas.sessions_schemas as session_schemas
import crud.sessions_crud as sessions_crud
import crud.users_crud as users_crud
import crud.chat_crud as chat_crud
import database
from Agent.session_name_generator import session_name_generator

router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"],
    responses={404: {"description": "Not found"}},
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=session_schemas.SessionCreateResponse)
def create_session(session: session_schemas.SessionCreate, db: Session = Depends(get_db)):
    if users_crud.check_user_exists_with_id(db, id=session.user_id):
        db_session = sessions_crud.create_session(db, session=session)
        if db_session:
            return {
                "message": "Session created successfully",
                "session_token": db_session
            }
        else:
            raise HTTPException(status_code=400, detail="Session creation failed")
    else:
        return {
            "message": "User does not exist"
        }

@router.get("/{user_id}")
def fetch_sessions(user_id: int, db: Session = Depends(get_db)):
    if users_crud.check_user_exists_with_id(db, id=user_id):
        db_sessions = sessions_crud.fetch_session(db, user_id=user_id)
        if db_sessions:
            return {
                "sessions": db_sessions,
                "message": "Sessions fetched successfully"
            }
        else:
            return {
                "sessions": [],
                "message": "No sessions found for this user"
            }
    else:
        return {
            "message": "User does not exist"
        }
    
@router.delete("/{session_token}")
def delete_session(session_token: str, db: Session = Depends(get_db)):
    db_session = sessions_crud.delete_session(db, session_token=session_token)
    chat_crud.delete_session(db, session_id=session_token)
    if db_session:
        return {
            "message": "Session deleted successfully"
        }
    else:
        raise HTTPException(status_code=404, detail="Session not found")

@router.post("/{session_token}/name", response_model=session_schemas.SessionNameResponse)
def generate_session_name(
    session_token: str,
    request: session_schemas.SessionNameRequest,
    db: Session = Depends(get_db)
):
    """
    Generate and store a session name for an existing session
    
    Args:
        session_token: The unique token of the session
        topic: The topic or first message to base the session name on
        db: Database session
    """
    try:
        # Generate the session name
        session_name = session_name_generator(request.topic)
        
        # Store the generated name
        success = sessions_crud.store_session_name(
            db=db,
            session_token=session_token,
            session_short_name=session_name
        )
        
        if success:
            return {
                "message": "Session name generated and stored successfully",
                "session_name": session_name
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
            
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating session name: {str(e)}"
        )

@router.patch("/{session_token}/name")
def update_session_name(
    session_token: str,
    request: session_schemas.SessionNameUpdate,
    db: Session = Depends(get_db)
):
    """
    Update the short name of an existing session
    
    Args:
        session_token: The unique token of the session
        request: The new session name
        db: Database session
    """
    try:
        success = sessions_crud.update_session_name(
            db=db,
            session_token=session_token,
            session_short_name=request.session_short_name
        )
        
        if success:
            return {
                "message": "Session name updated successfully",
                "session_name": request.session_short_name
            }
        else:
            raise HTTPException(
                status_code=404,
                detail="Session not found"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error updating session name: {str(e)}"
        )