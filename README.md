# InventoHub

Production-grade inventory and order management system with a FastAPI backend, React frontend, SQLAlchemy models, Alembic migrations, dashboard analytics, and deployment-ready Docker, Render, and Vercel configuration.

## Stack

- Backend: FastAPI, SQLAlchemy, Alembic, Pydantic, pytest
- Frontend: React 19, Vite, Tailwind CSS, React Query, React Hook Form, Recharts
- Database: PostgreSQL in production, SQLite fallback for local development
- Deployment: Render backend and PostgreSQL, Vercel frontend

## Local Development

Backend:

```powershell
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to `http://localhost:8000`.

## Environment

Copy the example files and adjust values as needed:

```powershell
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

For local SQLite development, set:

```env
DATABASE_URL=sqlite:///./inventohub.db
```

For PostgreSQL, use:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventohub
```

## Verification

```powershell
cd backend
py -m pytest tests -v
```

```powershell
cd frontend
npm run lint
npm run build
```

Docker configs are included, but this machine does not have Docker installed locally.

## Deployment

- Backend: create a Render Blueprint from `render.yaml`, then set `CORS_ORIGINS` to your deployed Vercel URL.
- Frontend: import `frontend/` into Vercel and set `VITE_API_URL` to the Render backend URL.
- CI: GitHub Actions runs backend tests, Alembic migration validation, frontend lint/build, and Docker image builds.

More detail is in `docs/deployment.md`.
