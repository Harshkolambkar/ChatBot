from pydantic import BaseModel

class UserBase(BaseModel):
    name: str
    email: str
    password: str

class UserCreate(UserBase):
    pass

class UserCreateResponse(BaseModel):
    message: str
    id: int
    name: str
    email: str

class UserValidate(BaseModel):
    email: str
    password: str

class UserValidateResponse(BaseModel):
    is_valid: bool
    message: str
    id: int
    name: str
    email: str

class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str

class UserPasswordUpdateResponse(BaseModel):
    message: str