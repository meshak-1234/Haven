from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class SafetyLevel(str, Enum):
    NORMAL = "normal"
    EMOTIONAL_DISTRESS = "emotional_distress"
    POTENTIALLY_HIGH_RISK = "potentially_high_risk"
    URGENT_SAFETY_CONCERN = "urgent_safety_concern"

class EscalationResource(BaseModel):
    name: str
    contact: str
    description: str
    availability: str
    website: Optional[str] = None

class SafetyAnalysisResult(BaseModel):
    level: SafetyLevel
    requires_escalation: bool = False
    calm_guidance: Optional[str] = None
    resources: List[EscalationResource] = Field(default_factory=list)
    flagged_reasons: List[str] = Field(default_factory=list)
