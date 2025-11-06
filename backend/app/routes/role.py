from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database.session import get_session
from app.core.security import require_admin
from app.schemas.role import RoleCreate, RoleOut
from app import crud

router = APIRouter(prefix="/api/roles", tags=["Roles"])

@router.post("", response_model=RoleOut)
async def create_role(payload: RoleCreate, x_api_key: Optional[str] = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    role = await crud.role.create_role(session, payload.model_dump())
    return role

@router.get("/{event_id}", response_model=list[RoleOut])
async def list_roles(event_id: str, session: AsyncSession = Depends(get_session)):
    roles = await crud.role.list_roles(session, event_id)
    return roles

@router.delete("/{role_id}", response_model=dict)
async def delete_role(role_id: str, x_api_key: Optional[str] = Depends(require_admin), session: AsyncSession = Depends(get_session)):
    role = await crud.role.delete_role(session, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return {"success": True, "deleted_id": role_id}