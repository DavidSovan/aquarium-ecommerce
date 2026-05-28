from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class ProductOptionValueCreate(BaseModel):
    value: str = Field(..., min_length=1, max_length=255)
    price_modifier: float = Field(0)
    image_url: Optional[str] = None
    sort_order: int = 0


class ProductOptionValueUpdate(BaseModel):
    value: Optional[str] = Field(None, min_length=1, max_length=255)
    price_modifier: Optional[float] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None


class ProductOptionValueResponse(BaseModel):
    id: int
    option_id: int
    value: str
    price_modifier: float
    image_url: Optional[str] = None
    sort_order: int
    model_config = ConfigDict(from_attributes=True)


class ProductOptionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(default="dropdown", pattern="^(dropdown|color|text|dimensions)$")
    is_required: bool = False
    sort_order: int = 0
    values: List[ProductOptionValueCreate] = []


class ProductOptionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = Field(None, pattern="^(dropdown|color|text|dimensions)$")
    is_required: Optional[bool] = None
    sort_order: Optional[int] = None


class ProductOptionResponse(BaseModel):
    id: int
    product_id: int
    name: str
    type: str
    is_required: bool
    sort_order: int
    values: List[ProductOptionValueResponse] = []
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CustomizationSelection(BaseModel):
    option_id: int
    value_id: Optional[int] = None
    value_text: Optional[str] = None


class PriceCalculationRequest(BaseModel):
    product_id: int
    customizations: List[CustomizationSelection]


class PriceCalculationResponse(BaseModel):
    base_price: float
    modifiers_total: float
    final_price: float
    breakdown: dict
