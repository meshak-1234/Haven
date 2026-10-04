import logging
from typing import List, Dict, Any, Optional
import httpx
from backend.app.core.config import settings
from backend.app.services.ai.base import AIProvider

logger = logging.getLogger(__name__)

SYSTEM_PROMPT_TEMPLATE = """You are Haven, a thoughtful, warm, and natural AI Companion.

CORE CONVERSATIONAL PRINCIPLES:
1. COMPLETE RESPONSES (MANDATORY): Always finish your thoughts completely and naturally. Never cut off mid-sentence, mid-paragraph, or mid-thought.
2. NATURAL DIALOGUE: Speak like a genuine, emotionally intelligent companion. Do NOT sound robotic, scripted, or overly clinical.
3. DO NOT PARROT THE USER: Never repeat or echo back the user's message verbatim. (e.g., if the user says "I feel lonely because nobody talks to me", DO NOT say "You feel lonely because nobody talks to you." Instead, speak directly to the emotional reality of that experience).
4. NO GENERIC REPETITIVE CLOSINGS: Do NOT automatically append generic platitudes such as "I'm here for you", "I'm here to help", "Let me know if you need anything", or "Everything will be okay". End naturally based on the flow of the conversation.
5. FOLLOW-UP QUESTIONS: When appropriate, ask at most ONE thoughtful, open follow-up question that helps the user reflect or share. Never bombard the user with multiple questions in one reply.
6. LISTEN FIRST (DO NOT FORCE ADVICE): When the user is venting or expressing pain, listen, acknowledge, and give them room to breathe. Do NOT jump into giving lists of tips, meditation steps, or unsolicited fixes unless the user explicitly asks for advice or ideas (e.g. "what should I do?").
7. MULTI-TURN CONTEXT AWARENESS: Pay close attention to previous messages in this conversation. Track who or what the user was talking about (e.g. names, situations, pronouns like "him", "her", "that project") so the user never has to re-explain context they just gave you.
8. ADAPTIVE LENGTH:
   - For greetings or simple messages ("hi", "how are you"): reply warmly and naturally in 1–2 sentences.
   - For regular conversations: give approximately 3–5 meaningful, well-paced sentences.
   - For deeper emotional reflections or requested exercises: provide a rich, complete, and unhurried response.
   - NEVER terminate or shorten a response arbitrarily. Always conclude the thought gracefully.
9. SAFETY & BOUNDARIES: You are an AI companion, not a doctor or therapist. You support emotional self-reflection and connection with real-world people and professionals.

TONE & STYLE:
- Tone profile: {tone_instruction}
- Depth guidance: {length_instruction}

USER SAVED CONTEXT & PREFERENCES:
{memory_context}

Respond to the user's latest message with natural empathy, presence, and complete thoughts."""

TONE_MAPPINGS = {
    "warm_gentle": "Warm, compassionate, gentle, validating, and grounding.",
    "thoughtful_inquiring": "Reflective, perceptive, helping the user explore underlying thoughts with open-ended insight.",
    "grounded_practical": "Calm, steady, offering practical clarity and structured groundedness."
}

LENGTH_MAPPINGS = {
    "concise": "Conversational and focused while still fully completing your thought.",
    "balanced": "Balanced depth offering empathy, reflection, and natural dialogue.",
    "reflective": "Contemplative and thorough with space for nuance and depth."
}

# Reusable persistent HTTP client for low latency
_client: Optional[httpx.AsyncClient] = None

def get_gemini_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=httpx.Timeout(connect=5.0, read=25.0, write=5.0, pool=5.0),
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50)
        )
    return _client


class GeminiProvider(AIProvider):
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model or settings.GEMINI_MODEL
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def _build_system_prompt(self, memories: Optional[List[str]], tone: str, response_length: str) -> str:
        tone_instruction = TONE_MAPPINGS.get(tone, TONE_MAPPINGS["warm_gentle"])
        length_instruction = LENGTH_MAPPINGS.get(response_length, LENGTH_MAPPINGS["balanced"])
        
        if memories and len(memories) > 0:
            memory_context = "\n".join([f"- {m}" for m in memories])
        else:
            memory_context = "No specific saved memory items."

        return SYSTEM_PROMPT_TEMPLATE.format(
            tone_instruction=tone_instruction,
            length_instruction=length_instruction,
            memory_context=memory_context
        )

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        memories: Optional[List[str]] = None,
        tone: str = "warm_gentle",
        response_length: str = "balanced"
    ) -> str:
        if not self.api_key:
            return await self._fallback_empathetic_response(messages, tone)

        full_system_prompt = self._build_system_prompt(memories, tone, response_length)
        if system_prompt:
            full_system_prompt = f"{full_system_prompt}\n\nAdditional Guidance:\n{system_prompt}"

        # Convert messages to Gemini API contents format
        raw_contents = []
        for m in messages:
            content_text = m.get("content", "").strip()
            if not content_text:
                continue
            role = "user" if m.get("sender") == "user" or m.get("role") == "user" else "model"
            if raw_contents and raw_contents[-1]["role"] == role:
                raw_contents[-1]["parts"][0]["text"] += "\n\n" + content_text
            else:
                raw_contents.append({
                    "role": role,
                    "parts": [{"text": content_text}]
                })

        # Gemini API strictly requires that the contents list must end with a user turn
        while raw_contents and raw_contents[-1]["role"] != "user":
            raw_contents.pop()

        if not raw_contents:
            return await self._fallback_empathetic_response(messages, tone)

        payload = {
            "system_instruction": {
                "parts": [{"text": full_system_prompt}]
            },
            "contents": raw_contents,
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.9,
                # Generous output token limit (2048) ensures thoughts are NEVER cut off
                "maxOutputTokens": 2048
            }
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{self.base_url}?key={self.api_key}",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            text = parts[0].get("text", "").strip()
                            if text:
                                return text
                    return "I'm listening and right here with you. What feels most present for you in this moment?"
                else:
                    logger.warning(f"Gemini API returned status {response.status_code}: {response.text[:200]}")
                    return await self._fallback_empathetic_response(messages, tone)
        except Exception as e:
            logger.warning(f"Exception calling Gemini API: {e}")
            return await self._fallback_empathetic_response(messages, tone)

    async def extract_key_memory(self, user_message: str) -> Optional[str]:
        """
        Check if the user is explicitly stating a personal fact or life context.
        """
        if not self.api_key:
            return None

        prompt = (
            "Analyze the following user message. If the user mentions an important personal fact, "
            "life situation, preferred boundary, or personal goal that would be valuable for long-term empathetic continuity "
            "(e.g. 'I started a new job as a teacher', 'My dog Max passed away', 'I struggle with sleep'), "
            "extract it as a single concise fact (under 15 words). If there is no durable personal context, respond ONLY with 'NONE'.\n\n"
            f"User message: \"{user_message}\""
        )

        try:
            client = get_gemini_client()
            response = await client.post(
                f"{self.base_url}?key={self.api_key}",
                json={"contents": [{"parts": [{"text": prompt}]}]},
                headers={"Content-Type": "application/json"}
            )
            if response.status_code == 200:
                text = response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                if text and text != "NONE" and "NONE" not in text and len(text) < 120:
                    return text
        except Exception:
            pass
        return None

    async def _fallback_empathetic_response(self, messages: List[Dict[str, str]], tone: str) -> str:
        from backend.app.services.ai.mock_provider import MockEmpatheticProvider
        mock = MockEmpatheticProvider()
        return await mock.generate_response(messages=messages, system_prompt="", tone=tone)
