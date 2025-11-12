from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

# Tipos literales para estado y prioridad
StatusType = Literal["todo", "doing", "done"]
PriorityType = Literal["low", "med", "high"]

# Modelo para crear una tarea
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    status: Optional[StatusType] = "todo"
    priority: Optional[PriorityType] = "low"
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

# Modelo para actualizar una tarea
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    status: Optional[StatusType] = None
    priority: Optional[PriorityType] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

# Modelo para leer una tarea (retornar al cliente)
class TaskRead(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str] = None
    status: StatusType
    priority: PriorityType
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        # Pydantic v2: permite instanciar desde ORM u objetos con atributos
        from_attributes = True

# Modelo para paginación de tareas
class TasksPage(BaseModel):
    items: List[TaskRead]
    total: int
    page: int
    page_size: int
