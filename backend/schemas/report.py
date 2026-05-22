from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SalesSummary(BaseModel):
    total_orders: int
    total_revenue: float
    average_order_value: float
    total_discount: float


class DailySales(BaseModel):
    date: str
    orders: int
    revenue: float


class TopProduct(BaseModel):
    product_id: int
    product_name: str
    total_quantity: int
    total_revenue: float


class CustomerSummary(BaseModel):
    total_customers: int
    new_customers_30d: int
    total_orders: int
