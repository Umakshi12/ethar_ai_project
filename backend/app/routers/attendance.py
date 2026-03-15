from __future__ import annotations

from datetime import date
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Attendance, AttendanceStatus, Employee
from app.schemas import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceSummary,
)

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(
    attendance_in: AttendanceCreate, db: Session = Depends(get_db)
) -> AttendanceResponse:
    employee = db.execute(
        select(Employee).where(Employee.employee_id == attendance_in.employee_id)
    ).scalar_one_or_none()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    # Check for duplicate attendance on the same date
    existing = db.execute(
        select(Attendance).where(
            and_(
                Attendance.employee_id == attendance_in.employee_id,
                Attendance.date == attendance_in.date,
            )
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance for this employee on this date already exists",
        )

    attendance = Attendance(
        id=str(uuid4()),
        employee_id=attendance_in.employee_id,
        date=attendance_in.date,
        status=AttendanceStatus(attendance_in.status),
    )

    db.add(attendance)
    db.commit()
    db.refresh(attendance)

    return AttendanceResponse.model_validate(
        {
            "id": attendance.id,
            "employee_id": attendance.employee_id,
            "date": attendance.date,
            "status": attendance.status.value,
            "employee_name": employee.full_name,
        }
    )


@router.get("/", response_model=List[AttendanceResponse])
def list_attendance(
    employee_id: Optional[str] = Query(default=None),
    date_param: Optional[date] = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
) -> List[AttendanceResponse]:
    stmt = (
        select(
            Attendance.id,
            Attendance.employee_id,
            Attendance.date,
            Attendance.status,
            Employee.full_name.label("employee_name"),
        )
        .join(Employee, Employee.employee_id == Attendance.employee_id)
    )

    conditions = []
    if employee_id is not None:
        conditions.append(Attendance.employee_id == employee_id)
    if date_param is not None:
        conditions.append(Attendance.date == date_param)

    if conditions:
        stmt = stmt.where(and_(*conditions))

    stmt = stmt.order_by(Attendance.date.desc())

    rows = db.execute(stmt).all()

    return [
        AttendanceResponse.model_validate(
            {
                "id": row.id,
                "employee_id": row.employee_id,
                "date": row.date,
                "status": row.status.value
                if isinstance(row.status, AttendanceStatus)
                else str(row.status),
                "employee_name": row.employee_name,
            }
        )
        for row in rows
    ]


@router.get("/summary/{employee_id}", response_model=AttendanceSummary)
def get_attendance_summary(
    employee_id: str, db: Session = Depends(get_db)
) -> AttendanceSummary:
    employee = db.execute(
        select(Employee).where(Employee.employee_id == employee_id)
    ).scalar_one_or_none()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    total_present = db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.employee_id == employee_id,
            Attendance.status == AttendanceStatus.present,
        )
    ).scalar_one()

    total_absent = db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.employee_id == employee_id,
            Attendance.status == AttendanceStatus.absent,
        )
    ).scalar_one()

    total_days_recorded = db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.employee_id == employee_id,
        )
    ).scalar_one()

    return AttendanceSummary(
        employee_id=employee.employee_id,
        employee_name=employee.full_name,
        total_present=total_present or 0,
        total_absent=total_absent or 0,
        total_days_recorded=total_days_recorded or 0,
    )

