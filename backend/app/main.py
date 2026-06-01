"""InventoHub FastAPI application entry point."""

from fastapi import FastAPI

from app.config import get_settings
from app.middleware.rate_limiter import setup_rate_limiter
from app.middleware.security import setup_security
from app.routers import customers, dashboard, orders, products

# Import models so SQLAlchemy metadata is registered for Alembic and tooling.
from app.models import Customer, Order, OrderItem, Product  # noqa: F401

settings = get_settings()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "InventoHub - A production-grade Inventory & Order Management System. "
        "Manage products, customers, orders, and track inventory with real-time analytics."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Setup middleware
setup_security(app)
setup_rate_limiter(app)

# Register routers under /api/v1
API_PREFIX = "/api/v1"
app.include_router(products.router, prefix=API_PREFIX)
app.include_router(customers.router, prefix=API_PREFIX)
app.include_router(orders.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)


@app.get("/", tags=["Root"])
def root():
    """Root endpoint returning application info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/api/v1/health",
    }


@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """Health check endpoint for deployment monitoring."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
    }
