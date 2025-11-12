# app/core/security.py

from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Dict
import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

# 🔑 Configuración del hash de contraseñas
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔑 OAuth2 para FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ------------------------
# FUNCIONES DE CONTRASEÑA
# ------------------------
def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

# ------------------------
# FUNCIONES DE JWT
# ------------------------
def create_access_token(data: Dict, expires_in: int = None) -> str:
    expires = datetime.utcnow() + timedelta(seconds=expires_in or settings.JWT_EXPIRES_IN)
    to_encode = data.copy()
    to_encode.update({"exp": expires})
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
