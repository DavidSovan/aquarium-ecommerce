from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import time, date, datetime


class DeliverySlotCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    start_time: str = Field(..., description="HH:MM format")
    end_time: str = Field(..., description="HH:MM format")
    max_capacity: int = Field(default=10, ge=1)
    is_active: bool = True


class DeliverySlotUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    start_time: Optional[str] = Field(None, description="HH:MM format")
    end_time: Optional[str] = Field(None, description="HH:MM format")
    max_capacity: Optional[int] = Field(None, ge=1)
    is_active: Optional[bool] = None


class DeliverySlotResponse(BaseModel):
    id: int
    name: str
    start_time: time
    end_time: time
    max_capacity: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AvailableSlotResponse(BaseModel):
    id: int
    name: str
    start_time: str
    end_time: str
    max_capacity: int
    remaining_capacity: int


class DeliverySlotToggleActive(BaseModel):
    is_active: bool
