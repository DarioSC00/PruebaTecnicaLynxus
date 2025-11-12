from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.dependencies import get_db
from app.schemas.userSchema import UserCreate, UserInDB
from app.crud.userController import user_crud

router = APIRouter()

BCRYPT_MAX_BYTES = 72

@router.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # validar longitud en bytes antes de cualquier hash
    if len(payload.password.encode("utf-8")) > BCRYPT_MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password too long: max {BCRYPT_MAX_BYTES} bytes"
        )

    if user_crud.get_by_email(db, email=payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    
    try:
        user = user_crud.create(db, obj_in=payload)
        return user
    except Exception:
        import logging
        logging.exception("Error creating user")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error")

# Nota: he comentado/quitado temporalmente el resto de endpoints (login/me/PUT/DELETE/ADMIN)
# porque referencian tipos y dependencias que actualmente no están importados/definidos
# (LoginRequest, LoginResponse, get_current_active_user, UserRead, etc).
# Reintroduciremos esas rutas una vez revisemos y alineemos los schemas y las dependencias.