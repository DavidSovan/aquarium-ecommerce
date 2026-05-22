from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class CustomerResponse(BaseModel):
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerListResponse(BaseModel):
    total: int
    items: List[CustomerResponse]


class CustomerDetailResponse(CustomerResponse):
    total_orders: int = 0
    total_spent: float = 0
