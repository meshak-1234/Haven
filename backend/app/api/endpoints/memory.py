from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.db.models import User
from backend.app.schemas.memory import MemoryCreate, MemoryUpdate, MemoryResponse
from backend.app.services.memory_service import MemoryService
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/memory", tags=["User Memory"])

@router.get("", response_model=List[MemoryResponse])
def get_memories(
    active_only: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all memories stored for the current user.
    """
    memories = MemoryService.get_user_memories(db, current_user.id, active_only=active_only)
    return [MemoryResponse.model_validate(m) for m in memories]

@router.post("", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
def add_memory(
    memory_in: MemoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Store a new user-controlled memory item.
    """
    memory = MemoryService.create_memory(db, current_user.id, memory_in)
    return MemoryResponse.model_validate(memory)

@router.put("/{memory_id}", response_model=MemoryResponse)
def update_memory(
    memory_id: str,
    memory_in: MemoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update or toggle status of a specific memory item.
    """
    memory = MemoryService.update_memory(db, current_user.id, memory_id, memory_in)
    if not memory:
        raise HTTPException(status_code=404, detail="Memory item not found.")
    return MemoryResponse.model_validate(memory)

@router.delete("/{memory_id}", status_code=status.HTTP_200_OK)
def delete_memory(
    memory_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific memory item.
    """
    success = MemoryService.delete_memory(db, current_user.id, memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory item not found.")
    return {"status": "success", "message": "Memory deleted successfully."}

@router.delete("", status_code=status.HTTP_200_OK)
def clear_all_memories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Purge all memories associated with the user's account.
    """
    deleted_count = MemoryService.clear_all_memories(db, current_user.id)
    return {"status": "success", "cleared_memories": deleted_count}
