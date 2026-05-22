from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from config.database import get_db
from models.user import User
from models.order import Order
from schemas.customer import (
    CustomerResponse,
    CustomerListResponse,
    CustomerDetailResponse,
)
from dependencies.auth import require_role

router = APIRouter(prefix="/customers", tags=["customers"])


@router.get("", response_model=CustomerListResponse)
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    query = db.query(User).filter(User.role == "customer")

    if search:
        term = f"%{search}%"
        query = query.filter(
            User.email.ilike(term) |
            User.first_name.ilike(term) |
            User.last_name.ilike(term)
        )

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    return CustomerListResponse(
        total=total,
        items=[CustomerResponse.model_validate(u) for u in users],
    )


@router.get("/{user_id}", response_model=CustomerDetailResponse)
def get_customer(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_orders = db.query(Order).filter(
        Order.user_id == user_id,
        Order.order_status != "cancelled",
    ).count()

    total_spent = db.query(func.sum(Order.total)).filter(
        Order.user_id == user_id,
        Order.order_status != "cancelled",
    ).scalar() or 0

    response = CustomerDetailResponse.model_validate(user)
    response.total_orders = total_orders
    response.total_spent = round(float(total_spent), 2)
    return response
