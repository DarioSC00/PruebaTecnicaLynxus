from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CommentCreate(BaseModel):
    body: str = Field(..., min_length=1)

class CommentUpdate(BaseModel):
    body: Optional[str] = Field(None, min_length=1)

class CommentRead(BaseModel):
    id: int
    task_id: int
    author_id: int
    body: str
    created_at: datetime

    class Config:
        orm_mode = True

class CommentsPage(BaseModel):
    items: List[CommentRead]
    total: int
    page: int
    page_size: int
