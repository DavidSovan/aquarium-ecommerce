from pydantic import BaseModel, ConfigDict
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


class AddWishlistItemRequest(BaseModel):
    wishlist_id: Optional[str] = None
    product_id: int


class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    product: Optional[ProductRef] = None
    added_at: datetime


class WishlistResponse(BaseModel):
    id: str
    items: List[WishlistItemResponse]
