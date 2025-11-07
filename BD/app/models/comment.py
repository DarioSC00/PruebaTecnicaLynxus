from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Comment(Base):
    __tablename__ = "comments"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True)
    body = Column(Text, nullable=False)  # Contenido del comentario
    
    # Foreign Keys
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    task = relationship("Task", back_populates="comments")
    author = relationship("User", back_populates="comments")
    
    def __repr__(self):
        return f"<Comment(id={self.id}, task_id={self.task_id}, author_id={self.author_id})>"