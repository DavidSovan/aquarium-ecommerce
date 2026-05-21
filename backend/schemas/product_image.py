from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List


class ProductImageCreate(BaseModel):
    image_url: str = Field(..., max_length=500)
    sort_order: Optional[int] = Field(None, ge=0)


class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    image_url: str
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class ReorderItem(BaseModel):
    id: int
    sort_order: int


class ReorderRequest(BaseModel):
    items: List[ReorderItem]
