import logging
import asyncio
from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.db.models import User, UserSettings, Conversation, Message, Memory
from backend.app.schemas.chat import ChatRequest, ChatResponse, MessageResponse
from backend.app.schemas.safety import SafetyLevel, SafetyAnalysisResult
from backend.app.services.safety_service import SafetyService
from backend.app.services.memory_service import MemoryService
from backend.app.services.ai import get_ai_provider

logger = logging.getLogger(__name__)

class ChatService:
    @staticmethod
    async def process_chat(
        db: Session,
        user: User,
        chat_request: ChatRequest
    ) -> ChatResponse:
        user_text = chat_request.message.strip()

        # Step 1: Run Safety and Risk Detection Layer
        safety_result: SafetyAnalysisResult = SafetyService.analyze_message(user_text)

        # Step 2: Retrieve or initialize conversation
        conversation: Optional[Conversation] = None
        is_new_conversation = False

        if chat_request.conversation_id:
            conversation = (
                db.query(Conversation)
                .filter(Conversation.id == chat_request.conversation_id, Conversation.user_id == user.id)
                .first()
            )

        if not conversation:
            is_new_conversation = True
            # Generate a nice initial title from first few words
            words = user_text.split()
            title = " ".join(words[:5]) + ("..." if len(words) > 5 else "")
            if len(title) > 40:
                title = title[:37] + "..."
            conversation = Conversation(
                user_id=user.id,
                title=title or "Reflective Dialogue"
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        # Step 3: Record User Message
        user_message_record = Message(
            conversation_id=conversation.id,
            sender="user",
            content=user_text,
            safety_flag=safety_result.level.value,
            escalation_triggered=safety_result.requires_escalation
        )
        db.add(user_message_record)
        db.commit()
        db.refresh(user_message_record)

        # Step 4: Handle response generation based on Safety Classification
        ai_provider = get_ai_provider()
        extracted_memory: Optional[str] = None
        assistant_text = ""

        # Fetch user preferences
        user_settings = (
            db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
        )
        tone = user_settings.preferred_tone if user_settings else "warm_gentle"
        response_length = user_settings.response_length if user_settings else "balanced"

        if safety_result.level == SafetyLevel.URGENT_SAFETY_CONCERN:
            # Urgent crisis: provide supportive, grounded escalation guidance
            assistant_text = (
                f"{safety_result.calm_guidance}\n\n"
                "**Immediate Support Resources Available Right Now:**\n"
                "- **988 Suicide & Crisis Lifeline**: Call or text `988` (24/7, free, confidential)\n"
                "- **Crisis Text Line**: Text `HOME` to `741741`\n"
                "- **Emergency Services**: Please call `911` (US) or your local emergency number\n"
                "- **International**: Visit [befrienders.org](https://www.befrienders.org) to find your local crisis center.\n\n"
                "Please reach out to one of these free resources or a trusted person right away. You matter, and there is support for you."
            )
        elif safety_result.level == SafetyLevel.POTENTIALLY_HIGH_RISK:
            # High distress: respond with deep calm and gentle encouragement of human support
            assistant_text = (
                f"{safety_result.calm_guidance}\n\n"
                "If it feels possible, reaching out to someone you trust or a counselor can be a deeply comforting step. "
                "The 988 Lifeline is also free to call or text anytime at `988`.\n\n"
                "I am here to sit with you through this. What feels most present for you in this moment?"
            )
        else:
            # Step 5: Normal or Emotional Distress
            # Retrieve active user memories
            memories = MemoryService.get_user_memories(db, user.id, active_only=True)
            memory_strings = [m.content for m in memories]

            # Fetch recent conversation history (last 10 messages)
            recent_messages = (
                db.query(Message)
                .filter(Message.conversation_id == conversation.id)
                .order_by(Message.created_at.asc())
                .all()
            )
            # Format message sequence
            msg_history = []
            for m in recent_messages[-10:]:
                msg_history.append({"sender": m.sender, "content": m.content})

            # Additional safety/empathy system instructions
            system_guidance = ""
            if safety_result.level == SafetyLevel.EMOTIONAL_DISTRESS:
                system_guidance = (
                    "The user is experiencing emotional distress or sadness. "
                    "Respond with gentle warmth and deep listening. Do NOT minimize their feelings, "
                    "do NOT jump into fixing mode or preach toxic positivity. "
                    "Acknowledge the weight they are carrying."
                )

            # Run response generation and memory extraction concurrently for fast response latency
            gen_task = ai_provider.generate_response(
                messages=msg_history,
                system_prompt=system_guidance,
                memories=memory_strings,
                tone=tone,
                response_length=response_length
            )
            mem_task = ai_provider.extract_key_memory(user_text)

            results = await asyncio.gather(gen_task, mem_task, return_exceptions=True)

            # Process generation result
            if isinstance(results[0], Exception):
                logger.error(f"Error in generate_response: {results[0]}")
                assistant_text = "I'm listening and right here with you. Could you tell me a little more about what you're experiencing?"
            else:
                assistant_text = results[0]

            # Process memory extraction result
            if not isinstance(results[1], Exception) and results[1]:
                candidate_memory = results[1]
                if candidate_memory.lower() not in [m.content.lower() for m in memories]:
                    extracted_memory = candidate_memory

        # Step 6: Record Assistant Message
        assistant_message_record = Message(
            conversation_id=conversation.id,
            sender="assistant",
            content=assistant_text,
            safety_flag=safety_result.level.value,
            escalation_triggered=safety_result.requires_escalation
        )
        db.add(assistant_message_record)
        
        # Update conversation timestamp
        conversation.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(assistant_message_record)

        return ChatResponse(
            conversation_id=conversation.id,
            user_message=MessageResponse.model_validate(user_message_record),
            assistant_message=MessageResponse.model_validate(assistant_message_record),
            safety_analysis=safety_result if safety_result.requires_escalation else None,
            extracted_memory=extracted_memory
        )
