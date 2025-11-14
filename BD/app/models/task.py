from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

# Definir los estados como Enum
class TaskStatus(str, enum.Enum):
    TODO = "todo"
    DOING = "doing" 
    DONE = "done"

# Definir las prioridades como Enum  
class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Task(Base):
    __tablename__ = "tasks"
    
    # Campos principales
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)  # Para búsqueda
    description = Column(Text, nullable=True)  # Text para descripciones largas
    
    # Estados y prioridad con Enum
    status = Column(Enum(TaskStatus, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=TaskStatus.TODO, index=True)
    priority = Column(Enum(TaskPriority, values_callable=lambda obj: [e.value for e in obj]), nullable=False, default=TaskPriority.MEDIUM, index=True)
    
    # Fecha límite
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)  # Index para filtrar vencidas
    
    # Foreign Keys
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks")
    comments = relationship("Comment", back_populates="task", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status={self.status.value})>"