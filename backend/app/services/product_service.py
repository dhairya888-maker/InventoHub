"""Product service with business logic for CRUD, search, and pagination."""

import math
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, data: ProductCreate) -> Product:
    """Create a new product. Raises 409 if SKU already exists."""
    existing = db.query(Product).filter(Product.sku == data.sku).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{data.sku}' already exists.",
        )

    product = Product(
        name=data.name,
        sku=data.sku,
        description=data.description,
        price=data.price,
        stock_quantity=data.stock_quantity,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_product(db: Session, product_id: str) -> Product:
    """Get a single product by ID. Raises 404 if not found."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found.",
        )
    return product


def update_product(db: Session, product_id: str, data: ProductUpdate) -> Product:
    """Update an existing product. Raises 404/409 as needed."""
    product = get_product(db, product_id)

    update_data = data.model_dump(exclude_unset=True)

    if "sku" in update_data and update_data["sku"] != product.sku:
        existing = db.query(Product).filter(
            Product.sku == update_data["sku"],
            Product.id != product_id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{update_data['sku']}' already exists.",
            )

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: str) -> dict:
    """Delete a product. Raises 404 if not found."""
    product = get_product(db, product_id)
    db.delete(product)
    db.commit()
    return {"message": f"Product '{product.name}' deleted successfully."}


def list_products(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> dict:
    """List products with pagination, search, and sorting."""
    query = db.query(Product)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )

    sort_column_map = {
        "name": Product.name,
        "sku": Product.sku,
        "price": Product.price,
        "stock_quantity": Product.stock_quantity,
        "created_at": Product.created_at,
        "updated_at": Product.updated_at,
    }
    sort_column = sort_column_map.get(sort_by, Product.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def get_low_stock_products(db: Session, threshold: int = 10) -> list[Product]:
    """Get products with stock below the threshold."""
    return (
        db.query(Product)
        .filter(Product.stock_quantity <= threshold)
        .order_by(Product.stock_quantity.asc())
        .all()
    )
