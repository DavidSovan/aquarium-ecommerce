from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class AddressBase(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=1, max_length=50)
    country: str = Field(..., min_length=1, max_length=100)
    city: str = Field(..., min_length=1, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    address_line: str = Field(..., min_length=1, max_length=500)
    postal_code: Optional[str] = Field(None, max_length=20)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, min_length=1, max_length=50)
    country: Optional[str] = Field(None, min_length=1, max_length=100)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    address_line: Optional[str] = Field(None, min_length=1, max_length=500)
    postal_code: Optional[str] = Field(None, max_length=20)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    id: int
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AddressListResponse(BaseModel):
    items: List[AddressResponse]
    total: int
