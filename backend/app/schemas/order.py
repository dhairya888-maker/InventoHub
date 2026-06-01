"""Order Pydantic schemas for request/response validation."""

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class OrderItemCreate(BaseModel):
    """Schema for an item within a new order."""

    product_id: str = Field(..., description="Product UUID")
    quantity: int = Field(..., gt=0, description="Quantity to order (must be > 0)")


class OrderCreate(BaseModel):
    """Schema for creating an order."""

    customer_id: str = Field(..., description="Customer UUID")
    items: list[OrderItemCreate] = Field(
        ..., min_length=1, description="At least one item required"
    )


class OrderItemResponse(BaseModel):
    """Schema for an order item in a response."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    product_name: str | None = None
    product_sku: str | None = None
    quantity: int
    unit_price: float
    subtotal: float


class OrderResponse(BaseModel):
    """Schema for order response."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_id: str
    customer_name: str | None = None
    status: str
    total_amount: float
    created_at: datetime
    items: list[OrderItemResponse] = []


class OrderListResponse(BaseModel):
    """Paginated order list response."""

    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
