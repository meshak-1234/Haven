from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.safety import SafetyAnalysisResult

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    safety_flag: str
    escalation_triggered: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationCreate(BaseModel):
    title: Optional[str] = Field("New Reflection", max_length=255)

class ConversationUpdate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)

class ConversationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None
    message_count: int = 0

    class Config:
        from_attributes = True

class ConversationDetailResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message content")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID or null to create new")

class ChatResponse(BaseModel):
    conversation_id: str
    user_message: MessageResponse
    assistant_message: MessageResponse
    safety_analysis: Optional[SafetyAnalysisResult] = None
    extracted_memory: Optional[str] = None
