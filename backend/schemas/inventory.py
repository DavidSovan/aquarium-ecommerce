from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class StockAdjustmentRequest(BaseModel):
    product_id: int
    adjustment_type: str = Field(..., pattern="^(increase|decrease|correction|initial)$")
    quantity_change: int = Field(..., gt=0)
    reason: Optional[str] = None
    adjusted_by: Optional[str] = None


class InventoryLogResponse(BaseModel):
    id: int
    product_id: int
    adjustment_type: str
    quantity_change: int
    quantity_before: int
    quantity_after: int
    reason: Optional[str] = None
    adjusted_by: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryLogsListResponse(BaseModel):
    total: int
    items: List[InventoryLogResponse]


class StockAdjustmentResponse(BaseModel):
    message: str
    product_id: int
    product_name: str
    quantity_before: int
    quantity_after: int
    adjustment_type: str
    log_id: int


class LowStockAlertResponse(BaseModel):
    product_id: int
    product_name: str
    current_stock: int
    threshold: int
    is_low_stock: bool
