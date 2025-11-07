from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.crud.user import user_crud
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserLogin
from app.core.security import create_access_token, get_current_user, get_current_active_user
from app.models.user import User

router = APIRouter()

# --------->Aqui irian las rutas de login <---------
@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # verificacion del correo si hay duplicidad
    existing_user = user_crud.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = user_crud.create(db=db, obj_in=user_in)
    return user

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login user - returns JWT token"""
    user = user_crud.authenticate(
        db, 
        email=form_data.username,  
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user_crud.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Crear token JWT
    access_token = create_access_token(subject=str(user.id))
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }

@router.post("/login/email")  
def login_with_email(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """alternative login with email and password"""
    user = user_crud.authenticate(
        db, 
        email=credentials.email, 
        password=credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user_crud.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = create_access_token(subject=str(user.id))
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user)
    }

# --------->Aqui irian las rutas de usuarios <---------

@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Obtain current user information"""
    return current_user

@router.put("/me", response_model=UserResponse)
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

@router.get("/", response_model=List[UserResponse])
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

@router.get("/{user_id}", response_model=UserResponse)
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