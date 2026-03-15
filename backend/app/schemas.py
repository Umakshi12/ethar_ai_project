from __future__ import annotations

from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


# -----------------
# Employee Schemas
# -----------------


class EmployeeBase(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str


class EmployeeCreate(EmployeeBase):
    @field_validator("employee_id", "full_name", "department", mode="before")
    @classmethod
    def strip_and_validate_not_empty(cls, v: str) -> str:
        if isinstance(v, str):
            value = v.strip()
        else:
            raise ValueError("Value must be a string")
        if not value:
            raise ValueError("Field must not be empty")
        return value


class EmployeeResponse(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    total_present_days: int = 0


# -------------------
# Attendance Schemas
# -------------------


class AttendanceBase(BaseModel):
    employee_id: str
    date: date
    status: Literal["Present", "Absent"]


class AttendanceCreate(AttendanceBase):
    @field_validator("date")
    @classmethod
    def validate_not_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Date cannot be in the future")
        return v

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ("Present", "Absent"):
            raise ValueError('Status must be either "Present" or "Absent"')
        return v


class AttendanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    employee_id: str
    date: date
    status: Literal["Present", "Absent"]
    employee_name: Optional[str] = None


class AttendanceSummary(BaseModel):
    employee_id: str
    employee_name: str
    total_present: int
    total_absent: int
    total_days_recorded: int


# -------------------
# Dashboard Schemas
# -------------------


class DashboardSummary(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    departments: int

