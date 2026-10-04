from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class AIProvider(ABC):
    """
    Abstract Base Class for AI Companion Providers.
    Allows seamlessly swapping Gemini for Llama, Claude, Mistral, etc.
    """

    @abstractmethod
    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        memories: Optional[List[str]] = None,
        tone: str = "warm_gentle",
        response_length: str = "balanced"
    ) -> str:
        """
        Generate an empathetic response given message history and context.
        """
        pass

    @abstractmethod
    async def extract_key_memory(self, user_message: str) -> Optional[str]:
        """
        Analyze if the user shared an important personal context or goal
        worth remembering for future continuity (user retains full control).
        """
        pass
