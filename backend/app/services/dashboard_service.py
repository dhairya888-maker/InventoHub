"""Dashboard service with analytics queries."""

from datetime import datetime, timezone, timedelta
from sqlalchemy import func, extract
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem
from app.config import get_settings


settings = get_settings()


def get_dashboard_stats(db: Session) -> dict:
    """Get overall dashboard statistics."""
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar()
    low_stock_count = (
        db.query(func.count(Product.id))
        .filter(Product.stock_quantity <= settings.LOW_STOCK_THRESHOLD)
        .scalar()
        or 0
    )

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
        "low_stock_count": low_stock_count,
    }


def get_revenue_chart(db: Session, months: int = 12) -> list[dict]:
    """Get monthly revenue data for the last N months."""
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=months * 30)

    # Query orders grouped by month
    orders = (
        db.query(Order)
        .filter(Order.created_at >= start_date)
        .all()
    )

    # Group by month manually (works with both SQLite and PostgreSQL)
    monthly_data: dict[str, dict] = {}
    for i in range(months):
        date = now - timedelta(days=i * 30)
        month_key = date.strftime("%Y-%m")
        monthly_data[month_key] = {"month": month_key, "revenue": 0.0, "order_count": 0}

    for order in orders:
        month_key = order.created_at.strftime("%Y-%m")
        if month_key in monthly_data:
            monthly_data[month_key]["revenue"] += float(order.total_amount)
            monthly_data[month_key]["order_count"] += 1

    result = sorted(monthly_data.values(), key=lambda x: x["month"])
    return result


def get_order_trends(db: Session, months: int = 12) -> list[dict]:
    """Get order count trends by month."""
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=months * 30)

    orders = (
        db.query(Order)
        .filter(Order.created_at >= start_date)
        .all()
    )

    monthly_counts: dict[str, int] = {}
    for i in range(months):
        date = now - timedelta(days=i * 30)
        month_key = date.strftime("%Y-%m")
        monthly_counts[month_key] = 0

    for order in orders:
        month_key = order.created_at.strftime("%Y-%m")
        if month_key in monthly_counts:
            monthly_counts[month_key] += 1

    result = [
        {"month": month, "count": count}
        for month, count in sorted(monthly_counts.items())
    ]
    return result


def get_low_stock_products(db: Session) -> list[dict]:
    """Get products with stock below threshold."""
    products = (
        db.query(Product)
        .filter(Product.stock_quantity <= settings.LOW_STOCK_THRESHOLD)
        .order_by(Product.stock_quantity.asc())
        .all()
    )

    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "stock_quantity": p.stock_quantity,
            "price": float(p.price),
        }
        for p in products
    ]


def get_recent_orders(db: Session, limit: int = 10) -> list[dict]:
    """Get the most recent orders."""
    from sqlalchemy.orm import joinedload

    orders = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items))
        .order_by(Order.created_at.desc())
        .limit(limit)
        .all()
    )

    # Deduplicate
    seen = set()
    unique_orders = []
    for order in orders:
        if order.id not in seen:
            seen.add(order.id)
            unique_orders.append(order)

    return [
        {
            "id": o.id,
            "customer_name": o.customer.name if o.customer else "Unknown",
            "total_amount": float(o.total_amount),
            "status": o.status,
            "created_at": o.created_at.isoformat(),
            "item_count": len(o.items),
        }
        for o in unique_orders
    ]
