from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from config.database import get_db
from models.delivery_slot import DeliverySlot, DeliverySlotBooking
from models.setting import Setting
from schemas.delivery_slot import AvailableSlotResponse
from typing import List
from datetime import date, datetime, timezone

router = APIRouter(prefix="/delivery", tags=["delivery"])


def is_delivery_scheduling_enabled(db: Session) -> bool:
    setting = db.query(Setting).filter(Setting.key == "enable_delivery_scheduling").first()
    return setting is not None and setting.value == "true"


@router.get("/slots", response_model=List[AvailableSlotResponse])
def get_available_slots(
    delivery_date: str = Query(..., description="Delivery date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    if not is_delivery_scheduling_enabled(db):
        raise HTTPException(status_code=400, detail="Delivery scheduling is not enabled")

    try:
        parsed_date = date.fromisoformat(delivery_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if parsed_date <= date.today():
        raise HTTPException(status_code=400, detail="Delivery date must be in the future")

    active_slots = db.query(DeliverySlot).filter(DeliverySlot.is_active == True).order_by(DeliverySlot.start_time).all()

    result = []
    for slot in active_slots:
        booking_count = db.query(DeliverySlotBooking).filter(
            DeliverySlotBooking.slot_id == slot.id,
            DeliverySlotBooking.delivery_date == parsed_date,
        ).count()

        remaining = max(0, slot.max_capacity - booking_count)

        result.append(AvailableSlotResponse(
            id=slot.id,
            name=slot.name,
            start_time=slot.start_time.strftime("%H:%M"),
            end_time=slot.end_time.strftime("%H:%M"),
            max_capacity=slot.max_capacity,
            remaining_capacity=remaining,
        ))

    return result


@router.get("/settings")
def get_delivery_settings(
    db: Session = Depends(get_db),
):
    enabled = is_delivery_scheduling_enabled(db)
    return {"enable_delivery_scheduling": enabled}
