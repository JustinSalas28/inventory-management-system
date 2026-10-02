# Inventory Management System

A full-stack inventory management and analytics application built with React, TypeScript, FastAPI, PostgreSQL, and JWT authentication.

## Prerequisites

Make sure the following are installed:

- Node.js and npm
- Python
- PostgreSQL
- Git

## Project Structure

```text
inventory-management-system/
├── frontend/
└── backend/
```

## 1. Start PostgreSQL

Make sure the PostgreSQL service is running.

The project currently uses a PostgreSQL database named:

```text
inventory_management
```

## 2. Start the Backend

Open a terminal and navigate to the backend folder:

```powershell
cd backend
```

Activate the Python virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the Python dependencies if needed:

```powershell
python -m pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder if one does not already exist.

Example:

```env
DATABASE_URL=postgresql+psycopg://inventory_app:YOUR_PASSWORD@localhost:5432/inventory_management
JWT_SECRET=YOUR_SECRET_KEY
```

Replace the placeholder values with your own PostgreSQL password and JWT secret.

Start the FastAPI development server:

```powershell
uvicorn main:app --reload
```

The backend should run at:

```text
http://127.0.0.1:8000
```

FastAPI API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

## 3. Start the Frontend

Open a second terminal and navigate to the frontend folder:

```powershell
cd frontend
```

Install the npm dependencies if needed:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

The frontend should normally run at:

```text
http://localhost:5173
```

If `localhost` does not work, try:

```text
http://127.0.0.1:5173
```

## 4. Running the Application

While developing, keep both servers running:

```text
Frontend
npm run dev
→ http://127.0.0.1:5173

Backend
uvicorn main:app --reload
→ http://127.0.0.1:8000
```

The frontend communicates with the FastAPI backend, which connects to the PostgreSQL database.

## Current Functionality

The application currently supports:

- User registration
- Secure password hashing
- Duplicate email validation
- User sign-in
- JWT access tokens
- Authenticated user verification
- Protected dashboard access
- User logout

## Important

Do not commit the following files or directories to GitHub:

```text
.env
venv/
node_modules/
__pycache__/
dist/
```

The `.env` file contains private database and authentication credentials and should remain local.