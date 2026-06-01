"""Pydantic schemas package."""

from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
)
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse,
)
from app.schemas.order import (
    OrderCreate,
    OrderItemCreate,
    OrderResponse,
    OrderItemResponse,
    OrderListResponse,
)
from app.schemas.dashboard import DashboardStats, RevenueData, OrderTrend

__all__ = [
    "ProductCreate", "ProductUpdate", "ProductResponse", "ProductListResponse",
    "CustomerCreate", "CustomerUpdate", "CustomerResponse", "CustomerListResponse",
    "OrderCreate", "OrderItemCreate", "OrderResponse", "OrderItemResponse", "OrderListResponse",
    "DashboardStats", "RevenueData", "OrderTrend",
]
