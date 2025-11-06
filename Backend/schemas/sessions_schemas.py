from pydantic import BaseModel
from typing import List, Optional

class SessionBase(BaseModel):
    user_id: int

class SessionCreate(SessionBase):
    pass

class SessionCreateResponse(BaseModel):
    message: str
    session_token: str

class SessionValidate(SessionBase):
    pass

class SessionValidateResponse(BaseModel):
    is_valid: bool
    message: str

class SessionFetch(BaseModel):
    user_id: int

class SessionData(BaseModel):
    session_short_name: Optional[str] = None  # Make it optional
    session_token: str
    
    class Config:
        from_attributes = True

class SessionFetchResponse(BaseModel):
    sessions: Optional[List[SessionData]] = None
    message: str

class SessionNameRequest(BaseModel):
    topic: str

class SessionNameResponse(BaseModel):
    message: str
    session_name: str

class SessionNameUpdate(BaseModel):
    session_short_name: str