from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    name: Optional[str] = None
    is_active: Optional[bool] = None


class UserInDB(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True  # ✅ reemplaza 'orm_mode = True' en Pydantic v2


class UserRead(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True  # ✅ evita el warning de 'orm_mode'


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
