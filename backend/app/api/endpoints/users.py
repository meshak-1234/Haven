from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.db.models import User, UserSettings
from backend.app.schemas.user import (
    UserDetailResponse,
    UserProfileUpdate,
    UserSettingsResponse,
    UserSettingsUpdate
)
from backend.app.schemas.safety import EscalationResource
from backend.app.services.safety_service import SafetyService
from backend.app.core.security import get_password_hash
from backend.app.api.deps import get_current_user

router = APIRouter(tags=["User & Safety"])

@router.get("/users/me", response_model=UserDetailResponse)
def get_user_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user profile and emotional companion preferences.
    """
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    return UserDetailResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        settings=UserSettingsResponse.model_validate(settings) if settings else None
    )

@router.put("/users/me", response_model=UserDetailResponse)
def update_user_me(
    update_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update profile details such as name or password.
    """
    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name.strip()
    if update_in.email is not None and update_in.email.lower() != current_user.email:
        # Check if email is taken
        exists = db.query(User).filter(User.email == update_in.email.lower()).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email is already in use.")
        current_user.email = update_in.email.lower()
    if update_in.new_password is not None:
        current_user.hashed_password = get_password_hash(update_in.new_password)

    db.commit()
    db.refresh(current_user)

    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    return UserDetailResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        settings=UserSettingsResponse.model_validate(settings) if settings else None
    )

@router.get("/users/me/settings", response_model=UserSettingsResponse)
def get_user_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve user companion settings (tone, response length, theme).
    """
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return UserSettingsResponse.model_validate(settings)

@router.put("/users/me/settings", response_model=UserSettingsResponse)
def update_user_settings(
    settings_in: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update companion tone and experience preferences.
    """
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)

    if settings_in.preferred_tone is not None:
        settings.preferred_tone = settings_in.preferred_tone
    if settings_in.response_length is not None:
        settings.response_length = settings_in.response_length
    if settings_in.crisis_resources_enabled is not None:
        settings.crisis_resources_enabled = settings_in.crisis_resources_enabled
    if settings_in.theme is not None:
        settings.theme = settings_in.theme

    db.commit()
    db.refresh(settings)
    return UserSettingsResponse.model_validate(settings)

@router.delete("/users/me", status_code=status.HTTP_200_OK)
def delete_user_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete account, all conversations, messages, and memories.
    """
    db.delete(current_user)
    db.commit()
    return {"status": "success", "message": "Account and all associated personal data have been completely deleted."}

@router.get("/safety/resources", response_model=List[EscalationResource])
def get_crisis_resources():
    """
    Publicly accessible verified crisis escalation resources and helplines.
    """
    return SafetyService.get_escalation_resources()
