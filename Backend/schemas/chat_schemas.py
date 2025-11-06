from pydantic import BaseModel
from typing import List

class ChatMessage(BaseModel):
    sender: str
    messages: str

    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    messages: List[ChatMessage]