# HRMS Lite - Lightweight Human Resource Management System

A professional, full-stack HR management tool built for the **Full-Stack Coding Assignment**. This application allows administrators to manage employee records and track daily attendance with a clean, production-ready interface.

## 🚀 Live Demo & Repository
- **Live Frontend:** https://ethar-ai-project.vercel.app
- **Backend API:** https://ethar-ai-project.onrender.com
- **GitHub Repository:** https://github.com/Umakshi12/ethar_ai_project

---
---

## 📸 Project Overview

<p align="center">
  <img src="screenshots/dashboard.png" width="800" alt="Dashboard Overview">
  <br>
  <em>Main Dashboard showing real-time statistics and summaries.</em>
</p>

---
<p align="center">
  <img src="screenshots/employees.png" width="800" alt="Dashboard Overview">
  <br>
  <em>Employee Management showing real-time statistics and summaries.</em>
</p>

---
<p align="center">
  <img src="screenshots/attendance.png" width="800" alt="Dashboard Overview">
  <br>
  <em>Attendance Management showing real-time statistics and summaries.</em>
</p>

---
<p align="center">
  <img src="screenshots/add_employee.png" width="800" alt="Dashboard Overview">
  <br>
  <em>Add Employee Page.</em>
</p>

<p align="center">
  <img src="screenshots/add_attendance.png" width="800" alt="Dashboard Overview">
  <br>
  <em>Add Attendance Page.</em>
</p>

## ✨ Features

### Core Requirements
- **Employee Management:** Add, view, and delete employee records with unique IDs and email validation.
- **Attendance Tracking:** Mark daily attendance (Present/Absent) and view history for each employee.
- **Data Persistence:** Fully persistent storage using **PostgreSQL**.
- **Input Validation:** Strict server-side validation using Pydantic and SQLAlchemy constraints.

### Bonus Features Implemented
- **📊 Real-time Dashboard:** Quick summary cards showing total employees, present/absent counts for today, and department distribution.
- **📅 Attendance History:** View and filter attendance logs.
- **📈 Aggregate Stats:** Automatically calculates "Total Present Days" per employee in the directory.
- **📱 Responsive UI:** Fully mobile-responsive design built with Tailwind CSS.
- **⚡ Loading States:** Implemented Skeleton screens and smooth transitions for a premium feel.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (TypeScript)
- **Vite** (Build tool)
- **TanStack React Query** (Server state management)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **Axios** (HTTP client)

### Backend
- **FastAPI** (Python)
- **SQLAlchemy 2.0** (ORM)
- **Pydantic v2** (Data validation)
- **Uvicorn** (ASGI server)

### Database & Deployment
- **PostgreSQL** (Production Database)
- **Vercel** (Frontend Hosting)
- **Render** (Backend Hosting)

---

## 🏃 Local Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL instance (or use the provided connection string)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/scripts/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/db_name [postgresql://postgres:uMa23ksh34i@db.tafktywintxnitabqdqw.supabase.co:5432/postgres]
ALLOWED_ORIGINS=http://localhost:5173
```
Run the server:
```bash
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000
```
Run the development server:
```bash
npm run dev
```

---

## 📝 Assumptions & Limitations
- **Single Admin:** As per requirements, no authentication system is implemented. Any user can access the admin dashboard.
- **Soft Deletion:** Not implemented; deleting an employee permanently removes their data and attendance history (Cascade Delete).
- **Timezone:** System uses server-side dates for tracking "Today" statistics.






## 🤝 Contact
Developed by **Umakshi Sharma** as part of a Full-Stack Coding Assignment.
