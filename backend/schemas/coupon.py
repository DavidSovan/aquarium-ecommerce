from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class CouponCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_order_amount: Optional[float] = 0
    max_uses: Optional[int] = 0
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_uses: Optional[int] = None
    is_active: Optional[bool] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None


class CouponResponse(BaseModel):
    id: int
    code: str
    description: Optional[str] = None
    discount_type: str
    discount_value: float
    min_order_amount: float
    max_uses: int
    used_count: int
    is_active: bool
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ValidateCouponRequest(BaseModel):
    code: str
    order_amount: float


class ValidateCouponResponse(BaseModel):
    valid: bool
    coupon: Optional[CouponResponse] = None
    discount_amount: float = 0
    message: Optional[str] = None
