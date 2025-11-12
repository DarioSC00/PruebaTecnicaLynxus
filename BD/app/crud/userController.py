from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.userSchema import UserCreate, UserUpdate, UserInDB
from app.core.security import hash_password, verify_password

class CRUDUser:
    def get(self, db: Session, id: int) -> Optional[User]:
        return db.query(User).filter(User.id == id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def _password_field_name(self) -> str:
        # detectar nombre del campo de password en el modelo
        cols = set(User.__table__.columns.keys())
        for candidate in ("password_hash", "hashed_password", "password"):
            if candidate in cols:
                return candidate
        # fallback razonable
        return "password_hash"

    def create(self, db: Session, obj_in: UserCreate) -> User:
        data: Dict[str, Any] = obj_in.dict()
        # extraer contraseña en claro si viene
        plain = data.pop("password", None)
        if plain is not None:
            target = self._password_field_name()
            hashed = hash_password(plain)
            data[target] = hashed

        db_obj = User(**data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: User, obj_in: UserUpdate) -> User:
        update_data: Dict[str, Any] = obj_in.dict(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            target = self._password_field_name()
            update_data[target] = hash_password(update_data.pop("password"))
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        # obtener el campo real donde está el hash
        pwd_field = self._password_field_name()
        hashed = getattr(user, pwd_field, None)
        if not hashed:
            return None
        if not verify_password(password, hashed):
            return None
        return user

# instancia exportada para importar como user_crud
user_crud = CRUDUser()