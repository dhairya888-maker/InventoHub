"""Product model with full constraints and indexing."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, Numeric, Integer, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    """Product entity representing an inventory item."""

    __tablename__ = "products"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(
        Numeric(12, 2), nullable=False
    )
    stock_quantity: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0
    )
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        CheckConstraint("price > 0", name="ck_products_price_positive"),
        CheckConstraint("stock_quantity >= 0", name="ck_products_stock_non_negative"),
        Index("ix_products_name", "name"),
    )

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, name={self.name}, sku={self.sku})>"
