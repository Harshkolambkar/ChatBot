from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import schemas.user_schemas as user_schemas, crud.users_crud as users_crud, database

router = APIRouter(
    prefix="/users",
    tags=["Users"],
    responses={404: {"description": "Not found"}},
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[user_schemas.UserBase])
def read_users(db: Session = Depends(get_db)):
    users = users_crud.get_user(db)
    return users

@router.get("/{user_id}", response_model=user_schemas.UserBase)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = users_crud.get_user_by_id(db, id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post('/', response_model=user_schemas.UserCreateResponse)
def create_user(user: user_schemas.UserCreate, db: Session = Depends(get_db)):
    if users_crud.check_user_exists(db, email=user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    else: 
        db_user = users_crud.create_user(db, user=user)
    if db_user:
        return {
            "message": "User created successfully",
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email
        }
    else:
        raise HTTPException(status_code=400, detail="User creation failed")

@router.post('/validate', response_model=user_schemas.UserValidateResponse)
def validate_user(user: user_schemas.UserValidate, db: Session = Depends(get_db)):
    validated_user = users_crud.validate_user(db, email=user.email, password=user.password)
    if not validated_user:
        return {
            "is_valid": False,
            "message": "Invalid email or password",
            "id": 0,
            "name": "",
            "email": ""
        }
    return {
        "is_valid": True,
        "message": "User validated successfully",
        "id": validated_user.id,
        "name": validated_user.name,
        "email": validated_user.email
    }

@router.patch('/{user_id}/password', response_model=user_schemas.UserPasswordUpdateResponse)
def update_password(user_id: int, password_data: user_schemas.UserPasswordUpdate, db: Session = Depends(get_db)):
    result = users_crud.update_user_password(
        db, 
        user_id=user_id, 
        old_password=password_data.old_password, 
        new_password=password_data.new_password
    )
    
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    elif result is False:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    return {
        "message": "Password updated successfully"
    }