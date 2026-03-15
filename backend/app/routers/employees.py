from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Attendance, AttendanceStatus, Employee
from app.schemas import EmployeeCreate, EmployeeResponse

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee_in: EmployeeCreate, db: Session = Depends(get_db)) -> EmployeeResponse:
    # Check duplicate employee_id
    existing_by_id = db.execute(
        select(Employee).where(Employee.employee_id == employee_in.employee_id)
    ).scalar_one_or_none()
    if existing_by_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee with this employee_id already exists",
        )

    # Check duplicate email
    existing_by_email = db.execute(
        select(Employee).where(Employee.email == employee_in.email)
    ).scalar_one_or_none()
    if existing_by_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee with this email already exists",
        )

    employee = Employee(
        employee_id=employee_in.employee_id.strip(),
        full_name=employee_in.full_name.strip(),
        email=employee_in.email,
        department=employee_in.department.strip(),
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)

    return EmployeeResponse.model_validate(
        {
            "employee_id": employee.employee_id,
            "full_name": employee.full_name,
            "email": employee.email,
            "department": employee.department,
            "total_present_days": 0,
        }
    )


@router.get("/", response_model=List[EmployeeResponse])
def list_employees(db: Session = Depends(get_db)) -> List[EmployeeResponse]:
    # Subquery to count present days per employee
    present_counts_subq = (
        select(
            Attendance.employee_id,
            func.count(Attendance.id).label("total_present_days"),
        )
        .where(Attendance.status == AttendanceStatus.present)
        .group_by(Attendance.employee_id)
        .subquery()
    )

    stmt = (
        select(
            Employee.employee_id,
            Employee.full_name,
            Employee.email,
            Employee.department,
            func.coalesce(present_counts_subq.c.total_present_days, 0).label(
                "total_present_days"
            ),
        )
        .select_from(Employee)
        .join(
            present_counts_subq,
            Employee.employee_id == present_counts_subq.c.employee_id,
            isouter=True,
        )
        .order_by(Employee.full_name.asc())
    )

    rows = db.execute(stmt).all()

    return [
        EmployeeResponse.model_validate(
            {
                "employee_id": row.employee_id,
                "full_name": row.full_name,
                "email": row.email,
                "department": row.department,
                "total_present_days": row.total_present_days,
            }
        )
        for row in rows
    ]


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str, db: Session = Depends(get_db)) -> EmployeeResponse:
    employee = db.execute(
        select(Employee).where(Employee.employee_id == employee_id)
    ).scalar_one_or_none()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    total_present_days = db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.employee_id == employee_id,
            Attendance.status == AttendanceStatus.present,
        )
    ).scalar_one()

    return EmployeeResponse.model_validate(
        {
            "employee_id": employee.employee_id,
            "full_name": employee.full_name,
            "email": employee.email,
            "department": employee.department,
            "total_present_days": total_present_days or 0,
        }
    )


@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def delete_employee(employee_id: str, db: Session = Depends(get_db)) -> Response:
    employee = db.execute(
        select(Employee).where(Employee.employee_id == employee_id)
    ).scalar_one_or_none()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    db.delete(employee)
    db.commit()

    # 204 No Content – explicit empty response
    return Response(status_code=status.HTTP_204_NO_CONTENT)


