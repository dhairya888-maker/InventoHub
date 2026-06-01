"""Dashboard Pydantic schemas for analytics responses."""

from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Overall dashboard statistics."""

    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    low_stock_count: int


class RevenueData(BaseModel):
    """Monthly revenue data point."""

    month: str
    revenue: float
    order_count: int


class OrderTrend(BaseModel):
    """Order trend data point."""

    month: str
    count: int


class LowStockProduct(BaseModel):
    """Low stock product alert."""

    id: str
    name: str
    sku: str
    stock_quantity: int
    price: float


class RecentOrder(BaseModel):
    """Recent order summary."""

    id: str
    customer_name: str
    total_amount: float
    status: str
    created_at: str
    item_count: int
