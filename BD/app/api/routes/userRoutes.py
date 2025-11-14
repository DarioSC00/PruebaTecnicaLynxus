from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Path, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from datetime import timedelta
from pydantic import BaseModel, EmailStr

from app.api.dependencies import get_db
from app.crud.userController import user_crud
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.core.config import settings

router = APIRouter()

# Schema for login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# POST /users/login - Authentication route
@router.post("/login", status_code=status.HTTP_200_OK)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        print(f"❌ User not found: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    print(f"✅ User found: {user.email}")
    print(f"🔑 Password entered: {credentials.password}")
    print(f"🔑 Password in DB: {user.password_hash}")
    
    # Verify if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    # Verify password (use password_hash instead of hashed_password)
    if not verify_password(credentials.password, user.password_hash):
        print("❌ Passwords do NOT match")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    print("✅ Login successful")
    
    # Token expira en 60 minutos
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=60)
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
        }
    }

# GET /users?page=1&page_size=10&q=
@router.get("/", status_code=status.HTTP_200_OK)
def read_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=200),
    q: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if q:
        q_like = f"%{q.strip().lower()}%"
        query = query.filter(
            func.lower(User.name).like(q_like) | func.lower(User.email).like(q_like)
        )

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [
            {
                "id": u.id,
                "name": getattr(u, "name", None),
                "email": u.email,
                "created_at": getattr(u, "created_at", None),
            }
            for u in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }

@router.get("/{user_id}", status_code=status.HTTP_200_OK)
def read_user(user_id: int = Path(..., gt=0), db: Session = Depends(get_db)):
    user = user_crud.get(db, id=user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {
        "id": user.id,
        "name": getattr(user, "name", None),
        "email": user.email,
        "created_at": getattr(user, "created_at", None),
    }