from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.database.session import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.announcement import AnnouncementCreate, AnnouncementOut
from app import crud
from app.core.deps import require_admin_user

router = APIRouter()

@router.post('', response_model=dict)
async def create_announcement(payload: AnnouncementCreate, current_user = Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    a = await crud.announcement.create_announcement(session, payload.title, payload.body)
    return {'success': True, 'data': AnnouncementOut.from_orm(a).dict()}

@router.get('', response_model=dict)
async def list_announcements(session: AsyncSession = Depends(get_session)):
    rows = await crud.announcement.list_announcements(session)
    return {'success': True, 'data': [AnnouncementOut.from_orm(r).dict() for r in rows]}
