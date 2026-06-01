"""Order API routes with transactional creation and history."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "",
    response_model=OrderResponse,
    status_code=201,
    summary="Create a new order",
    description=(
        "Create a new order for a customer. Validates customer exists, "
        "products exist, and sufficient stock is available. "
        "Automatically deducts inventory on success."
    ),
)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    """Create a new order with inventory deduction."""
    order = order_service.create_order(db, data)
    return order_service.format_order_response(order)


@router.get(
    "",
    response_model=OrderListResponse,
    summary="List orders",
    description="Get a paginated list of orders with optional status filter.",
)
def list_orders(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    status: str | None = Query(None, description="Filter by status"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db),
):
    """List orders with pagination."""
    result = order_service.list_orders(db, page, page_size, status, sort_order)
    result["items"] = [order_service.format_order_response(o) for o in result["items"]]
    return result


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
    summary="Get an order",
    description="Get a single order with all items and product details.",
)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """Get a single order with details."""
    order = order_service.get_order(db, order_id)
    return order_service.format_order_response(order)
