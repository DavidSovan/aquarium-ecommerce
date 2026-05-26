from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    title: Optional[str] = None
    content: Optional[str] = None


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = None
    content: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: str
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    is_approved: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReviewListResponse(BaseModel):
    total: int
    items: List[ReviewResponse]
    average_rating: float


class ProductBrief(BaseModel):
    id: int
    name: str
    slug: str
    thumbnail: Optional[str] = None
    price: float
    model_config = ConfigDict(from_attributes=True)


class MyReviewResponse(BaseModel):
    id: int
    product_id: int
    rating: int
    title: Optional[str] = None
    content: Optional[str] = None
    is_approved: bool
    created_at: datetime
    updated_at: datetime
    product: ProductBrief

    model_config = ConfigDict(from_attributes=True)


class MyReviewListResponse(BaseModel):
    total: int
    items: List[MyReviewResponse]
