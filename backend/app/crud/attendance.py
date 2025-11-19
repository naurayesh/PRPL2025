from sqlalchemy.ext.asyncio import AsyncSession
from app.models.attendance import Attendance
from sqlalchemy import select, func
from datetime import datetime, date, timezone

async def create_attendance(session: AsyncSession, event_id: str, participant_id: str, attended_at: datetime | None = None, notes: str | None = None):
    # default attended_at -> now (UTC)
    if attended_at is None:
        attended_at = datetime.now(timezone.utc)

    # create row
    a = Attendance(
        event_id=event_id,
        participant_id=participant_id,
        attended_at=attended_at,
        notes=notes,
    )
    session.add(a)
    try:
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    await session.refresh(a)
    return a

async def get_attendance(session: AsyncSession, attendance_id: str):
    return await session.get(Attendance, attendance_id)

async def delete_attendance(session: AsyncSession, attendance_id: str):
    a = await session.get(Attendance, attendance_id)
    if not a:
        return False
    await session.delete(a)
    await session.commit()
    return True

async def list_attendances_for_event(session: AsyncSession, event_id: str):
    q = await session.execute(select(Attendance).where(Attendance.event_id == event_id).order_by(Attendance.attended_at.desc()))
    return q.scalars().all()

# report: count by participant within date interval
async def attendance_report(session: AsyncSession, event_id: str | None = None, start_date: date | None = None, end_date: date | None = None):
    stmt = select(
        Attendance.participant_id,
        func.count(Attendance.id).label("attended_count")
    )
    if event_id:
        stmt = stmt.where(Attendance.event_id == event_id)
    if start_date:
        stmt = stmt.where(Attendance.attendance_day >= start_date)
    if end_date:
        stmt = stmt.where(Attendance.attendance_day <= end_date)
    stmt = stmt.group_by(Attendance.participant_id).order_by(func.count(Attendance.id).desc())

    res = await session.execute(stmt)
    return [{"participant_id": r[0], "attended_count": r[1]} for r in res.all()]