from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    archived: Optional[bool] = None

class ProjectRead(BaseModel):
    id: int
    owner_id: int
    name: str
    description: Optional[str] = None
    archived: bool
    created_at: datetime

    class Config:
        orm_mode = True

class ProjectsPage(BaseModel):
    items: List[ProjectRead]
    total: int
    page: int
    page_size: int