from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

StatusType = Literal["todo", "doing", "done"]
PriorityType = Literal["low", "med", "high"]

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = None
    status: Optional[StatusType] = "todo"
    priority: Optional[PriorityType] = "low"
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    status: Optional[StatusType] = None
    priority: Optional[PriorityType] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

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
        orm_mode = True

class TasksPage(BaseModel):
    items: List[TaskRead]
    total: int
    page: int
    page_size: int