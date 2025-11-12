from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# --- Crear Proyecto ---
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None


# --- Actualizar Proyecto ---
class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None


# --- Respuesta del Proyecto ---
class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    archived: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True  # ✅ reemplaza orm_mode en Pydantic v2
