from sqlalchemy.orm import Session
import models
import schemas.user_schemas as user_schemas

def get_user(db: Session):
    return db.query(models.User).all()

def get_user_by_id(db: Session, id: int):
    return db.query(models.User).filter(models.User.id == id).first()

def create_user(db: Session, user: user_schemas.UserCreate):
    db_user = models.User(name = user.name, email=user.email, password=user.password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def validate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email, models.User.password == password).first()
    if user:
        return user
    return None

def check_user_exists(db: Session, email: str):
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        return True
    return False

def check_user_exists_with_id(db: Session, id: int):
    existing_user = db.query(models.User).filter(models.User.id == id).first()
    if existing_user:
        print('User exists:', existing_user)
        return True
    return False

def update_user_password(db: Session, user_id: int, old_password: str, new_password: str):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    
    # Verify old password
    if user.password != old_password:
        return False
    
    # Update to new password
    user.password = new_password
    db.commit()
    db.refresh(user)
    return True