from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.user import User
from app.schemas.userSchema import UserCreate, UserUpdate, UserInDB
from app.core.security import hash_password, verify_password  # Para hashear contraseñas
from typing import List, Optional

class UserCRUD:

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """Create a new user"""
        # Hashear la contraseña antes de guardar
        hashed_password = hash_password(obj_in.password)
        
        user = User(
            email=obj_in.email,
            name=obj_in.name,
            password_hash=hashed_password,  # 🔧 password_hash, no description
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """Get user by email (for login)"""
        return db.query(User).filter(User.email == email).first()

    def get_by_id(self, db: Session, *, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    def get_all(self, db: Session, *, skip: int = 0, limit: int = 100, search: str = None) -> List[User]:
        """Get all active users (admin function)"""
        query = db.query(User).filter(User.is_active == True)
        
        # Búsqueda por nombre o email
        if search:
            query = query.filter(
                or_(
                    User.name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )
        
        return query.offset(skip).limit(limit).all()

    def update(self, db: Session, *, user_id: int, obj_in: UserUpdate) -> Optional[User]:
        """Update user"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if user:
            update_data = obj_in.dict(exclude_unset=True)
            
            # Si se actualiza la contraseña, hashearla
            if "password" in update_data:
                update_data["password_hash"] = hash_password(update_data.pop("password"))
            
            for field, value in update_data.items():
                setattr(user, field, value)
            
            db.commit()
            db.refresh(user)
            return user
        return None

    def deactivate(self, db: Session, *, user_id: int) -> bool:
        """Deactivate user (soft delete)"""
        user = db.query(User).filter(User.id == user_id).first()
        
        if user:
            user.is_active = False  # 🔧 is_active, no archived
            db.commit()
            return True
        return False

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        """Authenticate user (for login)"""
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def is_active(self, user: User) -> bool:
        """Check if user is active"""
        return user.is_active

    def count_total(self, db: Session, *, search: str = None) -> int:
        """Count total users for pagination"""
        query = db.query(User).filter(User.is_active == True)
        
        if search:
            query = query.filter(
                or_(
                    User.name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%")
                )
            )
        
        return query.count()

# Instancia global para usar en las rutas
user_crud = UserCRUD()