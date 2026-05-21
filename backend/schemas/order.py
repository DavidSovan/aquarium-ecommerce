from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class CheckoutRequest(BaseModel):
    cart_id: str = Field(..., min_length=1, max_length=36)
    user_id: str = Field(..., min_length=1, max_length=36)
    shipping_address_id: int
    billing_address_id: Optional[int] = None
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float


class OrderResponse(BaseModel):
    order_id: int
    subtotal: float
    shipping: float
    discount: float
    total: float
    items: List[OrderItemResponse]
    status: str

    model_config = ConfigDict(from_attributes=True)
