from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class CheckoutRequest(BaseModel):
    cart_id: str = Field(..., min_length=1, max_length=36)
    shipping_address_id: int
    billing_address_id: Optional[int] = None
    notes: Optional[str] = None


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


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: str
    order_status: str
    payment_status: str
    subtotal: float
    shipping: float
    discount: float
    total: float
    items: List[OrderItemResponse]
    shipping_address_id: Optional[int] = None
    billing_address_id: Optional[int] = None
    notes: Optional[str] = None
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

