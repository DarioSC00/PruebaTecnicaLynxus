# app/core/security.py

from typing import Dict, Tuple
from passlib.context import CryptContext
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

# Preferir bcrypt pero tener fallback a pbkdf2_sha256 si hay problemas con el backend bcrypt
pwd_ctx = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")

BCRYPT_MAX_BYTES = 72

def _truncate_for_bcrypt(password: str) -> str:
    """
    Trunca la contraseña a 72 bytes en UTF-8 para compatibilidad con bcrypt.
    Devuelve una cadena UTF-8 válida (puede eliminar algunos bytes parciales).
    """
    b = password.encode("utf-8")
    if len(b) <= BCRYPT_MAX_BYTES:
        return password
    truncated = b[:BCRYPT_MAX_BYTES]
    # asegurar cadena UTF-8 válida (descartar bytes parciales al final)
    return truncated.decode("utf-8", errors="ignore")

# 🔑 OAuth2 para FastAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ------------------------
# FUNCIONES DE CONTRASEÑA
# ------------------------
def hash_password(password: str) -> str:
    """
    Hash de contraseña. Se trunca para bcrypt si es necesario y se usa
    el backend disponible de passlib (bcrypt o pbkdf2_sha256).
    """
    try:
        pwd_for_hash = _truncate_for_bcrypt(password)
        return pwd_ctx.hash(pwd_for_hash)
    except Exception as exc:
        log.exception("Hashing failed with bcrypt; trying fallback. Error: %s", exc)
        # Intentar fallback explícito a pbkdf2_sha256 si sucede algo raro
        try:
            fallback_ctx = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
            return fallback_ctx.hash(password)
        except Exception:
            log.exception("Fallback hash also failed")
            raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica la contraseña aplicando la misma regla de truncado para bcrypt.
    """
    try:
        # truncar de la misma forma (si el hash fue generado con bcrypt)
        pwd_to_check = _truncate_for_bcrypt(plain_password)
        return pwd_ctx.verify(pwd_to_check, hashed_password)
    except Exception:
        log.exception("Password verification failed")
        return False

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
