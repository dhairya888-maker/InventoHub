# Deployment

## Render Backend

1. Push the repository to GitHub.
2. In Render, create a Blueprint from `render.yaml`.
3. Let Render provision the PostgreSQL database and backend service.
4. Set `CORS_ORIGINS` to the deployed frontend URL, for example:

```env
CORS_ORIGINS=https://inventohub.vercel.app
```

The backend health check is:

```text
https://your-render-service.onrender.com/api/v1/health
```

## Vercel Frontend

1. Import the repository in Vercel.
2. Set the project root to `frontend`.
3. Set:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

4. Deploy with the default Vite build command, `npm run build`.

## Docker

Docker is not installed on the current local machine, but the project is Docker-ready:

```powershell
docker compose up --build
```

The frontend container serves on `http://localhost:8080`, and the backend serves on `http://localhost:8000`.

Production-style compose:

```powershell
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## GitHub Actions

The workflow in `.github/workflows/ci-cd.yml` runs:

- Backend dependency install, tests, and Alembic migration validation
- Frontend dependency install, lint, and production build
- Backend and frontend Docker image builds

Deployment hooks can be added later with Render and Vercel secrets once account tokens are available.
