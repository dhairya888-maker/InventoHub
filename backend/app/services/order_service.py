"""Order service with transactional inventory management."""

import math
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate


def create_order(db: Session, data: OrderCreate) -> Order:
    """
    Create an order with full transactional integrity.
    
    Steps:
    1. Validate customer exists
    2. For each item: validate product exists, validate stock available
    3. Deduct stock from products
    4. Create order + order items
    5. Calculate total_amount
    6. Commit or rollback entire transaction on failure
    """
    # Step 1: Validate customer
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{data.customer_id}' not found.",
        )

    # Step 2 & 3: Validate products and check stock
    order_items = []
    total_amount = 0.0

    for item_data in data.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID '{item_data.product_id}' not found.",
            )

        if product.stock_quantity < item_data.quantity:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for product '{product.name}'. "
                    f"Available: {product.stock_quantity}, Requested: {item_data.quantity}."
                ),
            )

        # Deduct stock
        product.stock_quantity -= item_data.quantity

        subtotal = float(product.price) * item_data.quantity
        total_amount += subtotal

        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item_data.quantity,
                unit_price=float(product.price),
                subtotal=subtotal,
            )
        )

    # Step 4 & 5: Create order
    try:
        order = Order(
            customer_id=data.customer_id,
            status="pending",
            total_amount=round(total_amount, 2),
        )
        db.add(order)
        db.flush()  # Get order ID without committing

        for item in order_items:
            item.order_id = order.id
            db.add(item)

        db.commit()
        db.refresh(order)

        # Eagerly load relationships for the response
        order = (
            db.query(Order)
            .options(
                joinedload(Order.items).joinedload(OrderItem.product),
                joinedload(Order.customer),
            )
            .filter(Order.id == order.id)
            .first()
        )

        return order

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}",
        )


def get_order(db: Session, order_id: str) -> Order:
    """Get a single order with items and product details."""
    order = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.customer),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID '{order_id}' not found.",
        )
    return order


def list_orders(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    status_filter: str | None = None,
    sort_order: str = "desc",
) -> dict:
    """List orders with pagination and optional status filter."""
    query = db.query(Order)

    if status_filter:
        query = query.filter(Order.status == status_filter)

    if sort_order == "asc":
        query = query.order_by(Order.created_at.asc())
    else:
        query = query.order_by(Order.created_at.desc())

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    orders = (
        query.options(
            joinedload(Order.items).joinedload(OrderItem.product),
            joinedload(Order.customer),
        )
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Deduplicate due to joinedload
    seen = set()
    unique_orders = []
    for order in orders:
        if order.id not in seen:
            seen.add(order.id)
            unique_orders.append(order)

    return {
        "items": unique_orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def format_order_response(order: Order) -> dict:
    """Format an order ORM object into a response dict."""
    return {
        "id": order.id,
        "customer_id": order.customer_id,
        "customer_name": order.customer.name if order.customer else None,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "created_at": order.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else None,
                "product_sku": item.product.sku if item.product else None,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "subtotal": float(item.subtotal),
            }
            for item in order.items
        ],
    }
