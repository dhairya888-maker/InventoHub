"""Customer Pydantic schemas for request/response validation."""

from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, ConfigDict


class CustomerBase(BaseModel):
    """Shared customer fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Customer name")
    email: EmailStr = Field(..., description="Unique email address")
    phone: str | None = Field(None, max_length=50, description="Phone number")
    address: str | None = Field(None, max_length=1000, description="Mailing address")


class CustomerCreate(CustomerBase):
    """Schema for creating a customer."""
    pass


class CustomerUpdate(BaseModel):
    """Schema for updating a customer. All fields optional."""

    name: str | None = Field(None, min_length=1, max_length=255)
    email: EmailStr | None = Field(None)
    phone: str | None = Field(None, max_length=50)
    address: str | None = Field(None, max_length=1000)


class CustomerResponse(BaseModel):
    """Schema for customer response."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: str
    phone: str | None
    address: str | None
    created_at: datetime
    updated_at: datetime


class CustomerListResponse(BaseModel):
    """Paginated customer list response."""

    items: list[CustomerResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
