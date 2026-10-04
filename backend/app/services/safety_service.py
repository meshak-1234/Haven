import re
from typing import List, Tuple
from backend.app.schemas.safety import SafetyLevel, SafetyAnalysisResult, EscalationResource

STANDARD_RESOURCES = [
    EscalationResource(
        name="988 Suicide & Crisis Lifeline",
        contact="Call or text 988",
        description="Free, confidential support available 24/7 for anyone experiencing a mental health crisis or emotional distress.",
        availability="24/7, Free, Confidential",
        website="https://988lifeline.org"
    ),
    EscalationResource(
        name="Crisis Text Line",
        contact="Text HOME to 741741",
        description="Connect with a crisis counselor over text messaging at any time of day or night.",
        availability="24/7, Free",
        website="https://www.crisistextline.org"
    ),
    EscalationResource(
        name="The Trevor Project",
        contact="Call 1-866-488-7386 or text START to 678-678",
        description="Confidential support for LGBTQ young people available 24/7.",
        availability="24/7, Free, Confidential",
        website="https://www.thetrevorproject.org"
    ),
    EscalationResource(
        name="Befrienders Worldwide",
        contact="Find a local hotline at befrienders.org",
        description="Global network of crisis helplines and emotional support across over 30 countries.",
        availability="International Directory",
        website="https://www.befrienders.org"
    ),
]

URGENT_PATTERNS = [
    r"\b(?:i want to|going to|wanna)\s+(?:kill|end|hang|shoot|poison|cut)\s+myself\b",
    r"\b(?:suicide|suicidal)\s+(?:attempt|plan|note|method)\b",
    r"\b(?:i\s+don'?t\s+want\s+to\s+live\s+anymore|better\s+off\s+dead)\b",
    r"\b(?:end\s+my\s+life|ending\s+it\s+all|goodbye\s+cruel\s+world)\b",
    r"\bhow\s+to\s+commit\s+suicide\b",
    r"\bhow\s+can\s+i\s+end\s+my\s+pain\s+forever\b",
]

POTENTIALLY_HIGH_RISK_PATTERNS = [
    r"\bi\s+(?:can'?t|cannot)\s+take\s+this\s+anymore\b",
    r"\bno\s+point\s+in\s+(?:living|anything|going\s+on)\b",
    r"\beveryone\s+would\s+be\s+better\s+without\s+me\b",
    r"\bi\s+feel\s+completely\s+hopeless\b",
    r"\bthinking\s+about\s+(?:suicide|death|dying|disappearing)\b",
    r"\bwant\s+to\s+(?:disappear|fall\s+asleep\s+and\s+never\s+wake\s+up)\b",
]

DISTRESS_PATTERNS = [
    r"\b(?:i\s+feel|i'm\s+feeling|feeling)\s+(?:sad|lonely|overwhelmed|depressed|anxious|lost|empty|broken|miserable|heartbroken)\b",
    r"\b(?:panic\s+attack|crying\s+all\s+day|can'?t\s+stop\s+crying|exhausted\s+emotionally)\b",
    r"\b(?:burned\s+out|grief|grieving|lost\s+my\s+job|breakup|divorce)\b",
]

class SafetyService:
    """
    Dedicated multi-tier safety analysis service.
    Evaluates incoming user text before generating AI responses.
    Distinguishes everyday sadness from severe crisis without overreacting.
    """

    @classmethod
    def analyze_message(cls, text: str) -> SafetyAnalysisResult:
        normalized = text.lower().strip()
        
        # 1. Check Urgent Safety Concern (Level 4)
        for pattern in URGENT_PATTERNS:
            if re.search(pattern, normalized):
                return SafetyAnalysisResult(
                    level=SafetyLevel.URGENT_SAFETY_CONCERN,
                    requires_escalation=True,
                    calm_guidance=(
                        "I hear how deeply overwhelmed you feel right now, and I care about your safety. "
                        "Because I am an AI companion and cannot provide emergency help or medical care, "
                        "please connect immediately with someone who can support you safely. "
                        "You don't have to carry this completely alone."
                    ),
                    resources=STANDARD_RESOURCES,
                    flagged_reasons=["Explicit crisis or self-harm ideation detected"]
                )

        # 2. Check Potentially High Risk (Level 3)
        for pattern in POTENTIALLY_HIGH_RISK_PATTERNS:
            if re.search(pattern, normalized):
                return SafetyAnalysisResult(
                    level=SafetyLevel.POTENTIALLY_HIGH_RISK,
                    requires_escalation=True,
                    calm_guidance=(
                        "It sounds like you are carrying a tremendous amount of weight right now. "
                        "I am here to listen and help you reflect, but when feelings get this intense, "
                        "speaking with a compassionate human or a counselor can provide the real care you deserve."
                    ),
                    resources=STANDARD_RESOURCES[:2],
                    flagged_reasons=["High distress with potential risk cues detected"]
                )

        # 3. Check Emotional Distress (Level 2 - DO NOT OVERREACT, supportive natural response)
        for pattern in DISTRESS_PATTERNS:
            if re.search(pattern, normalized):
                return SafetyAnalysisResult(
                    level=SafetyLevel.EMOTIONAL_DISTRESS,
                    requires_escalation=False,
                    calm_guidance=None,
                    resources=[],
                    flagged_reasons=["Emotional distress / situational vulnerability"]
                )

        # 4. Normal Conversation (Level 1)
        return SafetyAnalysisResult(
            level=SafetyLevel.NORMAL,
            requires_escalation=False,
            calm_guidance=None,
            resources=[],
            flagged_reasons=[]
        )

    @classmethod
    def get_escalation_resources(cls) -> List[EscalationResource]:
        return STANDARD_RESOURCES
