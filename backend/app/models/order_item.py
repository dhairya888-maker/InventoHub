"""OrderItem model linking orders to products."""

import uuid
from sqlalchemy import String, Integer, Numeric, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OrderItem(Base):
    """Line item within an order."""

    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    order_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    order: Mapped["Order"] = relationship(  # noqa: F821
        back_populates="items",
    )
    product: Mapped["Product"] = relationship()  # noqa: F821

    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_order_items_quantity_positive"),
        CheckConstraint("unit_price > 0", name="ck_order_items_price_positive"),
        CheckConstraint("subtotal > 0", name="ck_order_items_subtotal_positive"),
        Index("ix_order_items_product_id", "product_id"),
    )

    def __repr__(self) -> str:
        return f"<OrderItem(id={self.id}, product_id={self.product_id}, qty={self.quantity})>"
