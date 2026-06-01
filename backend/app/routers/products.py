"""Product API routes with full CRUD, search, pagination, and sorting."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
)
from app.services import product_service

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=ProductResponse,
    status_code=201,
    summary="Create a new product",
    description="Create a new product with a unique SKU. Price must be > 0 and stock >= 0.",
)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product."""
    return product_service.create_product(db, data)


@router.get(
    "",
    response_model=ProductListResponse,
    summary="List products",
    description="Get a paginated list of products with optional search and sorting.",
)
def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: str | None = Query(None, description="Search in name, SKU, description"),
    sort_by: str = Query("created_at", description="Sort field: name, sku, price, stock_quantity, created_at"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
):
    """List products with pagination."""
    return product_service.list_products(db, page, page_size, search, sort_by, sort_order)


@router.get(
    "/low-stock",
    response_model=list[ProductResponse],
    summary="Get low stock products",
    description="Get products with stock quantity below threshold.",
)
def get_low_stock(
    threshold: int = Query(10, ge=0, description="Stock threshold"),
    db: Session = Depends(get_db),
):
    """Get low stock products."""
    return product_service.get_low_stock_products(db, threshold)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get a product",
    description="Get a single product by its ID.",
)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get a single product."""
    return product_service.get_product(db, product_id)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update a product",
    description="Update product fields. Only provided fields are updated.",
)
def update_product(
    product_id: str,
    data: ProductUpdate,
    db: Session = Depends(get_db),
):
    """Update a product."""
    return product_service.update_product(db, product_id, data)


@router.delete(
    "/{product_id}",
    summary="Delete a product",
    description="Delete a product by its ID.",
)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    """Delete a product."""
    return product_service.delete_product(db, product_id)
