# app/core/security.py

from typing import Dict
from datetime import datetime, timedelta
import logging
import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

log = logging.getLogger(__name__)

# 🔑 OAuth2 para FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ------------------------
# FUNCIONES DE CONTRASEÑA (SIN HASH - SOLO DESARROLLO)
# ------------------------
def verify_password(plain_password: str, stored_password: str) -> bool:
    """Comparación directa sin hash (solo desarrollo)"""
    return plain_password == stored_password

def get_password_hash(password: str) -> str:
    """Retorna la contraseña sin cambios (solo desarrollo)"""
    return password

# ------------------------
# FUNCIONES DE JWT
# ------------------------
def create_access_token(data: Dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> Dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido")

# ------------------------
# FUNCIONES DE USUARIO ACTIVO
# ------------------------
def get_current_active_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    payload = decode_token(token)
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario inactivo"
        )

    return user

