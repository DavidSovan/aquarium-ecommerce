from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta, timezone
from typing import Optional
from config.database import get_db
from models.order import Order
from models.product import Product
from models.user import User
from models.order import OrderItem
from schemas.report import (
    SalesSummary,
    DailySales,
    TopProduct,
    CustomerSummary,
)
from dependencies.auth import require_role

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/sales", response_model=SalesSummary)
def sales_report(
    days: Optional[int] = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    orders = db.query(Order).filter(
        Order.created_at >= since,
        Order.order_status != "cancelled",
    ).all()

    total_orders = len(orders)
    total_revenue = sum(o.total for o in orders) if orders else 0
    total_discount = sum(o.discount for o in orders) if orders else 0

    return SalesSummary(
        total_orders=total_orders,
        total_revenue=round(total_revenue, 2),
        average_order_value=round(total_revenue / total_orders, 2) if total_orders else 0,
        total_discount=round(total_discount, 2),
    )


@router.get("/sales/daily", response_model=list[DailySales])
def daily_sales(
    days: Optional[int] = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    results = db.query(
        func.date(Order.created_at).label("date"),
        func.count(Order.id).label("orders"),
        func.sum(Order.total).label("revenue"),
    ).filter(
        Order.created_at >= since,
        Order.order_status != "cancelled",
    ).group_by(
        func.date(Order.created_at)
    ).order_by(
        func.date(Order.created_at)
    ).all()

    return [
        DailySales(
            date=str(r.date),
            orders=r.orders,
            revenue=round(float(r.revenue), 2) if r.revenue else 0,
        )
        for r in results
    ]


@router.get("/products/top", response_model=list[TopProduct])
def top_products(
    days: Optional[int] = Query(30, ge=1, le=365),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    results = db.query(
        OrderItem.product_id,
        OrderItem.product_name,
        func.sum(OrderItem.quantity).label("total_quantity"),
        func.sum(OrderItem.total_price).label("total_revenue"),
    ).join(Order).filter(
        Order.created_at >= since,
        Order.order_status != "cancelled",
    ).group_by(
        OrderItem.product_id, OrderItem.product_name
    ).order_by(
        func.sum(OrderItem.quantity).desc()
    ).limit(limit).all()

    return [
        TopProduct(
            product_id=r.product_id,
            product_name=r.product_name,
            total_quantity=int(r.total_quantity),
            total_revenue=round(float(r.total_revenue), 2) if r.total_revenue else 0,
        )
        for r in results
    ]


@router.get("/customers", response_model=CustomerSummary)
def customer_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    total_customers = db.query(User).filter(User.role == "customer").count()

    since_30d = datetime.now(timezone.utc) - timedelta(days=30)
    new_customers = db.query(User).filter(
        User.role == "customer",
        User.created_at >= since_30d,
    ).count()

    total_orders = db.query(Order).filter(
        Order.order_status != "cancelled"
    ).count()

    return CustomerSummary(
        total_customers=total_customers,
        new_customers_30d=new_customers,
        total_orders=total_orders,
    )
