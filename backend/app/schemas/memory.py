from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class MemoryCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    category: str = Field("personal_context", max_length=50)
    importance: int = Field(3, ge=1, le=5)

class MemoryUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1, max_length=1000)
    category: Optional[str] = Field(None, max_length=50)
    importance: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[bool] = None

class MemoryResponse(BaseModel):
    id: str
    user_id: str
    content: str
    category: str
    importance: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
