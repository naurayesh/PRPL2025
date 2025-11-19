from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database.session import get_session
from app.core.deps import require_admin_user, require_user
from app import crud
from app.schemas.attendance import AttendanceCreate, AttendanceOut, AttendanceReportRow
from datetime import date

router = APIRouter()

@router.post("", response_model=AttendanceOut)
async def mark_attendance(payload: AttendanceCreate, current_user=Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    """
    Admin endpoint to mark attendance for a participant.
    attendance_day uniqueness is enforced by DB (unique constraint).
    """
    try:
        a = await crud.attendance.create_attendance(
            session,
            event_id=payload.event_id,
            participant_id=payload.participant_id,
            attended_at=payload.attended_at,
            notes=payload.notes
        )
        return a
    except Exception as e:
        # duplicate -> return 400 with hint
        if "uq_attendance_unique_daily" in str(e) or "unique" in str(e).lower():
            raise HTTPException(400, "Attendance already recorded for this participant today")
        raise HTTPException(400, str(e))

@router.delete("/{attendance_id}", response_model=dict)
async def delete_attendance(attendance_id: str, current_user=Depends(require_admin_user), session: AsyncSession = Depends(get_session)):
    ok = await crud.attendance.delete_attendance(session, attendance_id)
    if not ok:
        raise HTTPException(404, "Attendance not found")
    return {"success": True}

@router.get("", response_model=list[AttendanceOut])
async def list_event_attendance(event_id: Optional[str] = Query(None), session: AsyncSession = Depends(get_session), current_user = Depends(require_admin_user)):
    # admin-only listing filtered by event
    if not event_id:
        raise HTTPException(400, "event_id required")
    rows = await crud.attendance.list_attendances_for_event(session, event_id)
    return rows

@router.get("/report", response_model=list[AttendanceReportRow])
async def attendance_report(
    event_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    session: AsyncSession = Depends(get_session),
    current_user = Depends(require_admin_user)
):
    """
    Returns aggregated attendance counts per participant for the interval.
    If start_date/end_date omitted, returns all-time.
    """
    rows = await crud.attendance.attendance_report(session, event_id, start_date, end_date)
    return rows