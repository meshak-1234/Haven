from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    new_password: Optional[str] = Field(None, min_length=6, max_length=100)

class UserSettingsResponse(BaseModel):
    id: str
    user_id: str
    preferred_tone: str
    response_length: str
    crisis_resources_enabled: bool
    theme: str
    updated_at: datetime

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    preferred_tone: Optional[str] = None
    response_length: Optional[str] = None
    crisis_resources_enabled: Optional[bool] = None
    theme: Optional[str] = None

class UserDetailResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    created_at: datetime
    settings: Optional[UserSettingsResponse] = None

    class Config:
        from_attributes = True
