# InventoHub

InventoHub is a production-grade inventory and order management platform built for modern business operations. It combines inventory tracking, customer management, order processing, stock intelligence, and dashboard analytics in a polished full-stack SaaS experience.

The application is designed as a deployable business product, with a FastAPI backend, React frontend, database migrations, CI/CD, Docker readiness, and cloud deployment configuration.

## Live Links

| Resource | URL |
| --- | --- |
| Live Demo | [https://invento-hub-delta.vercel.app](https://invento-hub-delta.vercel.app) |
| Backend API | [https://inventohub-aynu.onrender.com](https://inventohub-aynu.onrender.com) |
| API Documentation | [https://inventohub-aynu.onrender.com/docs](https://inventohub-aynu.onrender.com/docs) |
| GitHub Repository | [https://github.com/dhairya888-maker/InventoHub](https://github.com/dhairya888-maker/InventoHub) |
| Docker Image | [https://hub.docker.com/r/dhairya888/inventohub-backend](https://hub.docker.com/r/dhairya888/inventohub-backend) |

## Demo Credentials

```text
Email: admin@inventohub.com
Password: Admin@123
```

## Screenshots

### Authentication

![InventoHub login screen](screenshots/login.png)

### Dashboard

![InventoHub dashboard analytics](screenshots/dashboard.png)

### Inventory Management

![InventoHub inventory management](screenshots/inventory.png)

### Customer Management

![InventoHub customer management](screenshots/customer.png)

### Order Management

![InventoHub order management](screenshots/orders.png)

## Core Features

- Premium SaaS dashboard with KPI cards, revenue trends, inventory health, low-stock alerts, and recent activity
- Product inventory management with search, sorting, filtering, pagination, stock indicators, and drawer-based create/edit flows
- Customer management with customer analytics, profile drawers, contact details, search, and pagination
- Order processing with multi-step order creation, inventory deduction, order details, and fulfillment status tracking
- JWT-style frontend authentication, protected routes, remember-me support, password visibility toggle, and demo access
- Global command palette with keyboard shortcut support
- Light, dark, and system theme modes with persisted preference
- Responsive layout for desktop, tablet, and mobile
- React Query caching, optimistic invalidation, lazy-loaded routes, skeleton states, error boundaries, and toast notifications
- Production-ready backend API with validation, CORS, security headers, rate limiting, migrations, and tests
- Docker, Render, Vercel, and GitHub Actions configuration included

## Tech Stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- React Router
- TanStack React Query
- React Hook Form
- Recharts
- Axios

### Backend

- FastAPI
- SQLAlchemy ORM
- Alembic migrations
- Pydantic and Pydantic Settings
- PostgreSQL production target
- SQLite local development fallback
- Pytest

### Infrastructure

- Vercel frontend deployment
- Render backend deployment
- Render PostgreSQL support
- Docker and Docker Compose
- GitHub Actions CI/CD

## Architecture

```text
Frontend: React + Vite + Tailwind
        |
        | REST API over HTTPS
        v
Backend: FastAPI + SQLAlchemy + Alembic
        |
        | ORM connection
        v
Database: PostgreSQL in production / SQLite for local development
```

The backend owns business rules such as order creation, customer validation, product validation, stock availability checks, inventory deduction, and dashboard aggregation. The frontend focuses on a premium operational experience with efficient client-side state management and polished interactions.

## Project Structure

```text
InventoHub/
|-- backend/
|   |-- app/
|   |   |-- main.py
|   |   |-- config.py
|   |   |-- database.py
|   |   |-- models/
|   |   |-- schemas/
|   |   |-- routers/
|   |   |-- services/
|   |   `-- middleware/
|   |-- alembic/
|   |-- tests/
|   |-- Dockerfile
|   |-- pytest.ini
|   `-- requirements.txt
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- hooks/
|   |   `-- pages/
|   |-- Dockerfile
|   |-- vercel.json
|   `-- package.json
|-- docs/
|-- .github/workflows/
|-- docker-compose.yml
|-- docker-compose.prod.yml
|-- render.yaml
`-- README.md
```

## API Overview

Base path:

```text
/api/v1
```

Main endpoints:

| Area | Endpoints |
| --- | --- |
| Health | `GET /health` |
| Products | `POST /products`, `GET /products`, `GET /products/{id}`, `PUT /products/{id}`, `DELETE /products/{id}`, `GET /products/low-stock` |
| Customers | `POST /customers`, `GET /customers`, `GET /customers/{id}`, `PUT /customers/{id}`, `DELETE /customers/{id}` |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/{id}`, `GET /orders/history` |
| Dashboard | `GET /dashboard/stats`, `GET /dashboard/revenue-chart`, `GET /dashboard/order-trends`, `GET /dashboard/low-stock`, `GET /dashboard/recent-orders` |

Interactive API documentation is available at:

[https://inventohub-aynu.onrender.com/docs](https://inventohub-aynu.onrender.com/docs)

## Local Development

### Prerequisites

- Git
- Python 3.13+
- Node.js 22+
- npm
- PostgreSQL optional for local production parity
- Docker optional

### Clone

```bash
git clone https://github.com/dhairya888-maker/InventoHub.git
cd InventoHub
```

### Backend Setup

```bash
cd backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m alembic upgrade head
python -m uvicorn app.main:app --reload
```

Backend local URL:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend local URL:

```text
http://localhost:5173
```

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
DATABASE_URL=sqlite:///./inventohub.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
RATE_LIMIT=100/minute
APP_ENV=development
SECRET_KEY=change-this-in-production
```

For PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventohub
```

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:8000
```

For production:

```env
VITE_API_URL=https://inventohub-aynu.onrender.com
```

## Testing and Verification

### Backend Tests

```bash
cd backend
python -m pytest tests -v
```

### Frontend Lint and Build

```bash
cd frontend
npm run lint
npm run build
```

### Migration Check

```bash
cd backend
python -m alembic upgrade head
```

## Docker

The project includes Dockerfiles for both services and Docker Compose configuration for local orchestration.

### Backend Image

Docker Hub:

[https://hub.docker.com/r/dhairya888/inventohub-backend](https://hub.docker.com/r/dhairya888/inventohub-backend)

Pull image:

```bash
docker pull dhairya888/inventohub-backend
```

### Docker Compose

```bash
docker compose up --build
```

Services:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:8080` |
| Backend | `http://localhost:8000` |
| PostgreSQL | `localhost:5432` |

Production-style compose:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## CI/CD

GitHub Actions workflow:

```text
.github/workflows/ci-cd.yml
```

Pipeline stages:

1. Backend dependency installation
2. Backend tests with `python -m pytest tests -v`
3. Alembic migration validation
4. Frontend dependency installation
5. Frontend lint
6. Frontend production build
7. Backend Docker image build
8. Frontend Docker image build

The workflow is configured with `working-directory: backend` and `PYTHONPATH=.` for stable backend package imports in CI.

## Deployment

### Frontend

Platform: Vercel

Production URL:

[https://invento-hub-delta.vercel.app](https://invento-hub-delta.vercel.app)

Required environment variable:

```env
VITE_API_URL=https://inventohub-aynu.onrender.com
```

### Backend

Platform: Render

Production URL:

[https://inventohub-aynu.onrender.com](https://inventohub-aynu.onrender.com)

Health check:

```text
https://inventohub-aynu.onrender.com/api/v1/health
```

Required production environment variables:

```env
APP_ENV=production
DEBUG=false
DATABASE_URL=<render-postgres-connection-string>
CORS_ORIGINS=https://invento-hub-delta.vercel.app
SECRET_KEY=<secure-random-secret>
```

## Security and Reliability

- Request validation with Pydantic schemas
- SQLAlchemy ORM queries to avoid raw SQL injection risks
- CORS origin allow-list
- Secure response headers
- Rate limiting middleware
- Environment-based configuration
- Alembic-managed schema changes
- Test suite for products, customers, orders, dashboard, and health checks
- CI validation before deployment

## Production Notes

- Use PostgreSQL for production deployments.
- Keep `SECRET_KEY` private and rotate it for real deployments.
- Configure Render and Vercel environment variables before deploying.
- Do not commit `.env`, SQLite databases, build outputs, or local cache files.
- Use Alembic migrations for schema changes instead of application startup table creation.

## License

This project is available for portfolio, assessment, and educational use. Add a formal license file before commercial redistribution.
