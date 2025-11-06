from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.role import Role

async def create_role(session: AsyncSession, role_data: dict):
    role = Role(**role_data)
    session.add(role)
    await session.commit()
    await session.refresh(role)
    return role

async def list_roles(session: AsyncSession, event_id: str):
    result = await session.execute(select(Role).where(Role.event_id == event_id))
    return result.scalars().all()

async def delete_role(session: AsyncSession, role_id: str):
    result = await session.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        return None
    await session.delete(role)
    await session.commit()
    return role