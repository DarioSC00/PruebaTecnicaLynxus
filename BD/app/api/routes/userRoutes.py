from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.crud import userController as user_crud
from app.schemas.userSchema import UserCreate, LoginRequest, LoginResponse, UserRead, UserUpdate
from app.core.security import hash_password, create_access_token, verify_password
from app.models.user import User
from app.api.dependencies import get_current_active_user  # si existe este helper

router = APIRouter()


router = APIRouter()

@router.post("/register", response_model=UserRead)
def register_user(
    payload: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    user = user_crud.get_by_email(db, email=payload.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return user_crud.create(db=db, obj_in=payload)

@router.post("/login", response_model=LoginResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login user - returns JWT token"""
    user = user_crud.get_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token({"sub": user.id})
    return {
        "access_token": access_token,
        "user": user
    }

@router.get("/me", response_model=UserRead)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Obtain current user information"""
    return current_user

@router.put("/me", response_model=UserRead)
def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user information"""
    updated_user = user_crud.update(
        db=db, 
        user_id=current_user.id, 
        obj_in=user_update
    )
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_current_user(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deactivate current user account (soft delete)"""
    success = user_crud.deactivate(db=db, user_id=current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User account deactivated successfully"}

# === RUTAS ADMINISTRATIVAS (OPCIONAL) ===

@router.get("/", response_model=List[UserRead])
def get_users(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)  # Solo usuarios autenticados
):
    """Obtain list of users (for admin or user search functionality)"""
    users = user_crud.get_all(
        db=db, 
        skip=skip, 
        limit=limit, 
        search=search
    )
    return users

@router.get("/{user_id}", response_model=UserRead)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtain user by ID"""
    user = user_crud.get_by_id(db=db, user_id=user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user