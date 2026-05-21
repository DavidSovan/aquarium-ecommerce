from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from config.database import get_db
from models.product import Product
from models.inventory import InventoryLog
from schemas.inventory import (
    StockAdjustmentRequest,
    StockAdjustmentResponse,
    InventoryLogResponse,
    InventoryLogsListResponse,
    LowStockAlertResponse,
)

router = APIRouter(prefix="/inventory", tags=["inventory"])

LOW_STOCK_THRESHOLD = 5


@router.post("/adjustments", response_model=StockAdjustmentResponse)
def adjust_stock(
    data: StockAdjustmentRequest,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    quantity_before = product.stock_quantity
    quantity_change = data.quantity_change

    if data.adjustment_type == "decrease":
        if quantity_before < quantity_change:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot decrease stock. Current stock: {quantity_before}, requested decrease: {quantity_change}"
            )
        product.stock_quantity -= quantity_change
    elif data.adjustment_type in ("increase", "correction", "initial"):
        product.stock_quantity += quantity_change
    else:
        raise HTTPException(status_code=400, detail="Invalid adjustment type")

    db.flush()
    quantity_after = product.stock_quantity

    log = InventoryLog(
        product_id=data.product_id,
        adjustment_type=data.adjustment_type,
        quantity_change=quantity_change,
        quantity_before=quantity_before,
        quantity_after=quantity_after,
        reason=data.reason,
        adjusted_by=data.adjusted_by,
    )
    db.add(log)
    db.commit()
    db.refresh(product)

    return StockAdjustmentResponse(
        message="Stock adjusted successfully",
        product_id=product.id,
        product_name=product.name,
        quantity_before=quantity_before,
        quantity_after=quantity_after,
        adjustment_type=data.adjustment_type,
        log_id=log.id,
    )


@router.get("/logs", response_model=InventoryLogsListResponse)
def get_inventory_logs(
    product_id: Optional[int] = Query(None),
    adjustment_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    query = db.query(InventoryLog)

    if product_id:
        query = query.filter(InventoryLog.product_id == product_id)

    if adjustment_type:
        query = query.filter(InventoryLog.adjustment_type == adjustment_type)

    total = query.count()
    logs = query.order_by(InventoryLog.created_at.desc()).offset(skip).limit(limit).all()

    return InventoryLogsListResponse(
        total=total,
        items=[InventoryLogResponse.model_validate(log) for log in logs]
    )


@router.get("/low-stock", response_model=list[LowStockAlertResponse])
def get_low_stock_alerts(
    threshold: int = Query(LOW_STOCK_THRESHOLD, ge=1),
    db: Session = Depends(get_db)
):
    low_stock_products = db.query(Product).filter(
        Product.stock_quantity <= threshold
    ).all()

    return [
        LowStockAlertResponse(
            product_id=p.id,
            product_name=p.name,
            current_stock=p.stock_quantity,
            threshold=threshold,
            is_low_stock=True,
        )
        for p in low_stock_products
    ]

