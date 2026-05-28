from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from .customization import ProductOptionResponse

class CategoryRef(BaseModel):
    id: int
    name: str
    slug: str
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    category_id: Optional[int] = None
    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    discount_price: Optional[float] = Field(None, ge=0)
    stock_quantity: int = Field(0, ge=0)
    thumbnail: Optional[str] = None
    brand: Optional[str] = Field(None, max_length=255)
    weight: Optional[float] = Field(None, ge=0)
    length: Optional[float] = Field(None, ge=0)
    width: Optional[float] = Field(None, ge=0)
    height: Optional[float] = Field(None, ge=0)
    is_featured: bool = False
    is_active: bool = True
    is_customizable: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    sku: Optional[str] = Field(None, max_length=100)
    short_description: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    discount_price: Optional[float] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    thumbnail: Optional[str] = None
    brand: Optional[str] = Field(None, max_length=255)
    weight: Optional[float] = Field(None, ge=0)
    length: Optional[float] = Field(None, ge=0)
    width: Optional[float] = Field(None, ge=0)
    height: Optional[float] = Field(None, ge=0)
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None
    is_customizable: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ProductImageRef(BaseModel):
    id: int
    image_url: str
    sort_order: int
    model_config = ConfigDict(from_attributes=True)

class ProductDetail(ProductResponse):
    category: Optional[CategoryRef] = None
    images: List[ProductImageRef] = []
    options: List[ProductOptionResponse] = []

ProductDetail.model_rebuild()

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    skip: int
    limit: int
