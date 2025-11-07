from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)  # 🔧 Cambiar Full_name → name
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones - Activar cuando tengas los otros modelos
    projects = relationship("Project", back_populates="owner")
    assigned_tasks = relationship("Task", back_populates="assignee")  
    comments = relationship("Comment", back_populates="author")
    
    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name})>"  # 🔧 Corregir aquí también