from typing import List, Optional
from sqlalchemy.orm import Session
from backend.app.db.models import Memory
from backend.app.schemas.memory import MemoryCreate, MemoryUpdate

class MemoryService:
    @staticmethod
    def get_user_memories(db: Session, user_id: str, active_only: bool = True) -> List[Memory]:
        query = db.query(Memory).filter(Memory.user_id == user_id)
        if active_only:
            query = query.filter(Memory.is_active == True)
        return query.order_by(Memory.importance.desc(), Memory.created_at.desc()).all()

    @staticmethod
    def create_memory(db: Session, user_id: str, memory_in: MemoryCreate) -> Memory:
        db_memory = Memory(
            user_id=user_id,
            content=memory_in.content.strip(),
            category=memory_in.category,
            importance=memory_in.importance,
            is_active=True
        )
        db.add(db_memory)
        db.commit()
        db.refresh(db_memory)
        return db_memory

    @staticmethod
    def update_memory(db: Session, user_id: str, memory_id: str, memory_in: MemoryUpdate) -> Optional[Memory]:
        memory = db.query(Memory).filter(Memory.id == memory_id, Memory.user_id == user_id).first()
        if not memory:
            return None
        
        if memory_in.content is not None:
            memory.content = memory_in.content.strip()
        if memory_in.category is not None:
            memory.category = memory_in.category
        if memory_in.importance is not None:
            memory.importance = memory_in.importance
        if memory_in.is_active is not None:
            memory.is_active = memory_in.is_active
            
        db.commit()
        db.refresh(memory)
        return memory

    @staticmethod
    def delete_memory(db: Session, user_id: str, memory_id: str) -> bool:
        memory = db.query(Memory).filter(Memory.id == memory_id, Memory.user_id == user_id).first()
        if not memory:
            return False
        db.delete(memory)
        db.commit()
        return True

    @staticmethod
    def clear_all_memories(db: Session, user_id: str) -> int:
        deleted = db.query(Memory).filter(Memory.user_id == user_id).delete()
        db.commit()
        return deleted
