"""Customer API routes with full CRUD, search, and pagination."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.customer import (
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse,
)
from app.services import customer_service

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=201,
    summary="Create a new customer",
    description="Create a new customer with a unique email address.",
)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer."""
    return customer_service.create_customer(db, data)


@router.get(
    "",
    response_model=CustomerListResponse,
    summary="List customers",
    description="Get a paginated list of customers with optional search.",
)
def list_customers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str | None = Query(None, description="Search in name, email, phone"),
    sort_by: str = Query("created_at", description="Sort field: name, email, created_at"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
):
    """List customers with pagination."""
    return customer_service.list_customers(db, page, page_size, search, sort_by, sort_order)


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get a customer",
    description="Get a single customer by their ID.",
)
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    """Get a single customer."""
    return customer_service.get_customer(db, customer_id)


@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update a customer",
    description="Update customer fields. Only provided fields are updated.",
)
def update_customer(
    customer_id: str,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
):
    """Update a customer."""
    return customer_service.update_customer(db, customer_id, data)


@router.delete(
    "/{customer_id}",
    summary="Delete a customer",
    description="Delete a customer by their ID.",
)
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    """Delete a customer."""
    return customer_service.delete_customer(db, customer_id)
