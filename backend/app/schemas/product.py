"""Product Pydantic schemas for request/response validation."""

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ProductBase(BaseModel):
    """Shared product fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=1, max_length=100, description="Unique SKU code")
    description: str | None = Field(None, max_length=2000, description="Product description")
    price: float = Field(..., gt=0, description="Product price (must be > 0)")
    stock_quantity: int = Field(0, ge=0, description="Stock quantity (must be >= 0)")


class ProductCreate(ProductBase):
    """Schema for creating a product."""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product. All fields optional."""

    name: str | None = Field(None, min_length=1, max_length=255)
    sku: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=2000)
    price: float | None = Field(None, gt=0)
    stock_quantity: int | None = Field(None, ge=0)


class ProductResponse(BaseModel):
    """Schema for product response."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    sku: str
    description: str | None
    price: float
    stock_quantity: int
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    """Paginated product list response."""

    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
