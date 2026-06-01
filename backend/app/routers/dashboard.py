"""Dashboard API routes for analytics and insights."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.dashboard import (
    DashboardStats,
    RevenueData,
    OrderTrend,
    LowStockProduct,
    RecentOrder,
)
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardStats,
    summary="Get dashboard statistics",
    description="Get total products, customers, orders, revenue, and low stock count.",
)
def get_stats(db: Session = Depends(get_db)):
    """Get overall dashboard statistics."""
    return dashboard_service.get_dashboard_stats(db)


@router.get(
    "/revenue-chart",
    response_model=list[RevenueData],
    summary="Get revenue chart data",
    description="Get monthly revenue data for the last N months.",
)
def get_revenue_chart(
    months: int = Query(12, ge=1, le=24, description="Number of months"),
    db: Session = Depends(get_db),
):
    """Get monthly revenue chart data."""
    return dashboard_service.get_revenue_chart(db, months)


@router.get(
    "/order-trends",
    response_model=list[OrderTrend],
    summary="Get order trends",
    description="Get order count trends by month.",
)
def get_order_trends(
    months: int = Query(12, ge=1, le=24, description="Number of months"),
    db: Session = Depends(get_db),
):
    """Get order trends by month."""
    return dashboard_service.get_order_trends(db, months)


@router.get(
    "/low-stock",
    response_model=list[LowStockProduct],
    summary="Get low stock products",
    description="Get products with stock below threshold for alerts.",
)
def get_low_stock(db: Session = Depends(get_db)):
    """Get low stock product alerts."""
    return dashboard_service.get_low_stock_products(db)


@router.get(
    "/recent-orders",
    response_model=list[RecentOrder],
    summary="Get recent orders",
    description="Get the most recent orders.",
)
def get_recent_orders(
    limit: int = Query(10, ge=1, le=50, description="Number of recent orders"),
    db: Session = Depends(get_db),
):
    """Get recent orders."""
    return dashboard_service.get_recent_orders(db, limit)
