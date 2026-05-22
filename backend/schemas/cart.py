from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ProductRef(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    discount_price: Optional[float] = None
    thumbnail: Optional[str] = None
    stock_quantity: int

    model_config = ConfigDict(from_attributes=True)


class AddItemRequest(BaseModel):
    cart_id: Optional[str] = None
    product_id: int
    quantity: int = Field(1, ge=1)


class UpdateItemRequest(BaseModel):
    cart_id: str
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    product: Optional[ProductRef] = None
    quantity: int
    unit_price: float
    total_price: float


class MergeCartRequest(BaseModel):
    guest_cart_id: str


class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse]
    subtotal: float
    total_items: int
