from __future__ import annotations

import os
from datetime import date

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import distinct, func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.models import Attendance, AttendanceStatus, Employee
from app.routers import attendance as attendance_router
from app.routers import employees as employees_router
from app.schemas import DashboardSummary

import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables exist on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight Human Resource Management System backend for employee and attendance management.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "A database error occurred. Please try again later."},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please contact support."},
    )


app.include_router(employees_router.router)
app.include_router(attendance_router.router)


@app.get("/dashboard", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)) -> DashboardSummary:
    today = date.today()

    total_employees = db.execute(
        select(func.count(Employee.employee_id))
    ).scalar_one()

    present_today = db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status == AttendanceStatus.present,
        )
    ).scalar_one()

    absent_today = db.execute(
        select(func.count(Attendance.id)).where(
            Attendance.date == today,
            Attendance.status == AttendanceStatus.absent,
        )
    ).scalar_one()

    departments = db.execute(
        select(func.count(distinct(Employee.department)))
    ).scalar_one()

    return DashboardSummary(
        total_employees=total_employees or 0,
        present_today=present_today or 0,
        absent_today=absent_today or 0,
        departments=departments or 0,
    )


@app.get("/health")
def health_check():
    return {"status": "ok"}

