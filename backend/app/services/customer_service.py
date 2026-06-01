"""Customer service with business logic for CRUD, search, and pagination."""

import math
from sqlalchemy import or_
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


def create_customer(db: Session, data: CustomerCreate) -> Customer:
    """Create a new customer. Raises 409 if email already exists."""
    existing = db.query(Customer).filter(Customer.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Customer with email '{data.email}' already exists.",
        )

    customer = Customer(
        name=data.name,
        email=data.email,
        phone=data.phone,
        address=data.address,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_customer(db: Session, customer_id: str) -> Customer:
    """Get a single customer by ID. Raises 404 if not found."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID '{customer_id}' not found.",
        )
    return customer


def update_customer(db: Session, customer_id: str, data: CustomerUpdate) -> Customer:
    """Update an existing customer. Raises 404/409 as needed."""
    customer = get_customer(db, customer_id)
    update_data = data.model_dump(exclude_unset=True)

    if "email" in update_data and update_data["email"] != customer.email:
        existing = db.query(Customer).filter(
            Customer.email == update_data["email"],
            Customer.id != customer_id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Customer with email '{update_data['email']}' already exists.",
            )

    for key, value in update_data.items():
        setattr(customer, key, value)

    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: str) -> dict:
    """Delete a customer. Raises 404 if not found."""
    customer = get_customer(db, customer_id)
    db.delete(customer)
    db.commit()
    return {"message": f"Customer '{customer.name}' deleted successfully."}


def list_customers(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> dict:
    """List customers with pagination, search, and sorting."""
    query = db.query(Customer)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Customer.name.ilike(search_term),
                Customer.email.ilike(search_term),
                Customer.phone.ilike(search_term),
            )
        )

    sort_column_map = {
        "name": Customer.name,
        "email": Customer.email,
        "created_at": Customer.created_at,
        "updated_at": Customer.updated_at,
    }
    sort_column = sort_column_map.get(sort_by, Customer.created_at)
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
