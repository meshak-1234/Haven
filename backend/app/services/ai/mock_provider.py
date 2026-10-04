from typing import List, Dict, Optional
from backend.app.services.ai.base import AIProvider

class MockEmpatheticProvider(AIProvider):
    """
    Offline/Local empathetic provider for development, testing, and zero-key setup.
    Guarantees that Haven works immediately in any environment.
    """

    async def generate_response(
        self,
        messages: List[Dict[str, str]],
        system_prompt: str,
        memories: Optional[List[str]] = None,
        tone: str = "warm_gentle",
        response_length: str = "balanced"
    ) -> str:
        last_message = messages[-1].get("content", "").strip().lower() if messages else ""

        # Analyze multi-turn history to maintain conversational context
        prev_user_msgs = [m.get("content", "") for m in messages[:-1] if m.get("sender") == "user" or m.get("role") == "user"]
        all_text_history = " ".join(prev_user_msgs).lower()

        # Multi-turn context: Detect references to people or prior topics
        # E.g. Previous mentioned "Arun", current says "saw him"
        has_friend_context = any(w in all_text_history for w in ["friend", "arun", "roommate", "colleague", "partner", "brother", "sister"])
        
        if ("saw him" in last_message or "saw her" in last_message or "talked to him" in last_message or "talked to her" in last_message or "spoke with him" in last_message) and has_friend_context:
            person = "your friend"
            for p in ["arun", "roommate", "colleague", "partner"]:
                if p in all_text_history:
                    person = p.capitalize() if p != "arun" else "Arun"
                    break
            return (
                f"Seeing {person} again after what happened must have brought up some mixed feelings. "
                "How did that interaction go — did it feel tense, or did either of you acknowledge what happened?"
            )

        # Grounding & breathing exercises (Test 5: Long, complete response)
        if any(w in last_message for w in ["grounding", "ground", "breathe", "breathing", "exercise", "calm down", "relax"]):
            return (
                "I would be glad to guide you through a gentle 5-4-3-2-1 grounding exercise. "
                "Find a comfortable posture where your body feels supported, uncross your legs if they are crossed, and allow your shoulders to drop softly.\n\n"
                "Take a slow breath in through your nose... pause... and let out a long, gentle exhale.\n\n"
                "Now, look around your space and gently notice each of the following without rushing:\n\n"
                "• **5 things you can see**: Look for subtle details—the grain of a table, the color of a book spine, or how light lands on a wall.\n"
                "• **4 things you can physically feel**: The pressure of your feet on the floor, the texture of your sleeves, or the coolness of the air on your hands.\n"
                "• **3 things you can hear**: Listen for quiet sounds—a distant car, the hum of a computer, or your own calm breathing.\n"
                "• **2 things you can smell**: Perhaps coffee, fresh air from a window, or simply two scents you find soothing.\n"
                "• **1 thing you appreciate about yourself**: Even just giving yourself this moment to pause and reset today.\n\n"
                "Take one more slow, deep breath in and release it fully. How are you feeling in your body right now?"
            )

        # Greetings (Test 1: Short & natural)
        if last_message in ["hi", "hello", "hey", "good morning", "good evening", "good afternoon", "hi haven", "hello haven"]:
            greeting_name = ""
            if memories:
                for m in memories:
                    if "called" in m.lower():
                        greeting_name = f", {m.split()[-1]}"
                        break
            return f"Hello{greeting_name}! It's nice to connect with you today. How is your day going so far?"

        # Normal pleasant conversation (Test 2: "How was your day?")
        if "how was your day" in last_message or "how are you" in last_message or "how are you doing" in last_message:
            return (
                "I'm doing well, thank you for asking! I'm right here and glad to be present with you. "
                "How has your own day been unfolding so far?"
            )

        # Emotional distress / Venting (Test 3: "Today was really bad. Nobody talked to me.")
        if ("nobody talked to me" in last_message or "no one talked to me" in last_message or "ignored me" in last_message or "bad day" in last_message or "terrible" in last_message or "rough day" in last_message):
            return (
                "That kind of silence can feel especially heavy when you're hoping for connection. "
                "Going through an entire day feeling unseen takes a real emotional toll. "
                "Has it felt like this for a while, or was today particularly isolating?"
            )

        # Anxiety & Worry
        if any(w in last_message for w in ["anxious", "anxiety", "worry", "worried", "panic", "scared", "nervous"]):
            return (
                "Anxiety has a way of making everything feel urgent and overwhelming all at once. "
                "Let's slow things down just for this moment. "
                "What is one specific thought that feels loudest or heaviest right now?"
            )

        # Loneliness & Sadness
        if any(w in last_message for w in ["sad", "lonely", "alone", "crying", "depressed", "unhappy", "empty"]):
            return (
                "Feeling that way can be deeply exhausting, and it is completely understandable that it hurts right now. "
                "You don't have to pretend everything is fine here. "
                "Would it help to talk through what feels like the root of this feeling today?"
            )

        # Work & Study Pressure
        if any(w in last_message for w in ["work", "job", "burnout", "deadline", "boss", "career", "study", "exam"]):
            return (
                "Carrying that much pressure can quietly drain your energy until even routine tasks feel heavy. "
                "Remember that your worth isn't measured solely by what you produce or accomplish. "
                "What feels like the biggest source of stress on your plate right now?"
            )

        # Sleep & Rest
        if any(w in last_message for w in ["sleep", "insomnia", "tired", "exhausted", "can't sleep", "rest"]):
            return (
                "When you're running on empty, even small challenges feel much harder to navigate. "
                "Give yourself permission to pause—nothing needs to be solved in this exact hour. "
                "Are racing thoughts keeping you up, or is your body simply struggling to unwind?"
            )

        # Gratitude & Positive moments
        if any(w in last_message for w in ["happy", "grateful", "good day", "excited", "proud", "hopeful"]):
            return (
                "That's really lovely to hear. Pausing to recognize those brighter moments is a great way to anchor yourself. "
                "What was the highlight or spark behind that good feeling?"
            )

        # Interpersonal Conflict / Fights / Arguments
        if any(w in last_message for w in ["fight", "argued", "argument", "conflict", "shouting", "mad at me", "angry", "upset with me", "clash", "disagree"]):
            return (
                "Fights with someone in your life can leave such a heavy, unsettled feeling in your chest. "
                "It's really exhausting when conflict happens with someone you care about. "
                "What happened between you two — did something specific set it off, or has tension been building up over time?"
            )

        # Advice request
        if "what should i do" in last_message or "what do you suggest" in last_message or "advice" in last_message:
            return (
                "When a situation feels tangled, it can help to break it down into smaller steps. "
                "First, take a moment to identify what is directly within your control versus what isn't. "
                "Second, ask yourself what the simplest, most gentle next step would be. "
                "Which part of this feels most urgent to address first?"
            )

        # Varied thoughtful responses (natural, non-repetitive, zero quotes of user)
        fallbacks = [
            "That sounds like it has been weighing on you. When things feel tangled, taking a moment to put them into words can bring some relief. What feels like the hardest part of it right now?",
            "I'm here with you. It takes honesty to look at what you're experiencing, and you don't have to rush through it. Would you like to tell me more about what's been happening?",
            "Sounds like there is quite a bit on your mind today. No pressure to have everything figured out right now. What feels most present for you in this moment?",
            "Thank you for sharing that. Sometimes just giving voice to what you're dealing with is an important first step. How has this been affecting how you feel lately?",
        ]
        idx = (len(last_message) + len(messages)) % len(fallbacks)
        return fallbacks[idx]

    async def extract_key_memory(self, user_message: str) -> Optional[str]:
        lower = user_message.lower()
        if "my name is " in lower:
            name = user_message.split("my name is ")[-1].split(".")[0].strip()
            return f"User prefers to be called {name}"
        if "i work as a " in lower or "i am a " in lower:
            return user_message.strip()
        return None
