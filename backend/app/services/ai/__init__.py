from backend.app.core.config import settings
from backend.app.services.ai.base import AIProvider
from backend.app.services.ai.gemini_provider import GeminiProvider
from backend.app.services.ai.mock_provider import MockEmpatheticProvider

def get_ai_provider() -> AIProvider:
    """
    Factory function returning the configured AI provider.
    Easily swappable with Llama, Anthropic, or OpenAI without changing app logic.
    """
    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider(api_key=settings.GEMINI_API_KEY, model=settings.GEMINI_MODEL)
    elif settings.AI_PROVIDER == "gemini" and not settings.GEMINI_API_KEY:
        # Graceful fallback to mock provider so app runs without crashing if user hasn't set GEMINI_API_KEY yet
        return MockEmpatheticProvider()
    elif settings.AI_PROVIDER == "mock":
        return MockEmpatheticProvider()
    else:
        return MockEmpatheticProvider()
