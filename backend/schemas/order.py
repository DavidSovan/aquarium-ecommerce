from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Any
from datetime import datetime, date


PAYMENT_METHODS = {"COD", "ONLINE_PAYMENT"}

class CheckoutRequest(BaseModel):
    cart_id: str = Field(..., min_length=1, max_length=36)
    shipping_address_id: int
    billing_address_id: Optional[int] = None
    notes: Optional[str] = None
    coupon_code: Optional[str] = None
    payment_method: str = Field(default="COD", pattern="^(COD|ONLINE_PAYMENT)$")
    preferred_delivery_date: Optional[str] = Field(None, description="Delivery date in YYYY-MM-DD format")
    delivery_slot_id: Optional[int] = Field(None, description="ID of the delivery slot")


class UpdateOrderStatusRequest(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float
    customizations: Optional[Any] = None


class AssignDriverRequest(BaseModel):
    driver_id: str


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: str
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    order_status: str
    payment_method: str = "COD"
    payment_status: str
    subtotal: float
    shipping: float
    discount: float
    coupon_code: Optional[str] = None
    coupon_discount: float = 0
    total: float
    items: List[OrderItemResponse]
    shipping_address_id: Optional[int] = None
    billing_address_id: Optional[int] = None
    shipping_address_snapshot: Optional[Any] = None
    is_new: bool = True
    notes: Optional[str] = None
    preferred_delivery_date: Optional[date] = None
    delivery_slot_id: Optional[int] = None
    delivery_slot_name: Optional[str] = None
    driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    payment_reference: Optional[str] = None
    bakong_account_id: Optional[str] = None
    khqr_md5: Optional[str] = None
    payment_qr: Optional[str] = None
    payment_expires_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    payment_failure_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderListResponse(BaseModel):
    total: int
    items: List[OrderResponse]


class CancelOrderResponse(BaseModel):
    message: str
    order_id: int
    refunded_stock: dict

