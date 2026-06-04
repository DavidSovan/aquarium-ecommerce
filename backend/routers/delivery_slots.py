from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from models.delivery_slot import DeliverySlot
from models.user import User
from schemas.delivery_slot import (
    DeliverySlotCreate,
    DeliverySlotUpdate,
    DeliverySlotResponse,
    DeliverySlotToggleActive,
)
from dependencies.auth import require_role
from typing import List
from datetime import time

router = APIRouter(prefix="/admin/delivery-slots", tags=["admin-delivery-slots"])


def parse_time(value: str) -> time:
    try:
        parts = value.split(":")
        return time(int(parts[0]), int(parts[1]))
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail=f"Invalid time format: {value}. Use HH:MM")


@router.get("", response_model=List[DeliverySlotResponse])
def list_delivery_slots(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    slots = db.query(DeliverySlot).order_by(DeliverySlot.start_time).all()
    return slots


@router.get("/{slot_id}", response_model=DeliverySlotResponse)
def get_delivery_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    slot = db.query(DeliverySlot).filter(DeliverySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Delivery slot not found")
    return slot


@router.post("", response_model=DeliverySlotResponse, status_code=201)
def create_delivery_slot(
    data: DeliverySlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    slot = DeliverySlot(
        name=data.name,
        start_time=parse_time(data.start_time),
        end_time=parse_time(data.end_time),
        max_capacity=data.max_capacity,
        is_active=data.is_active,
    )
    db.add(slot)
    db.commit()
    db.refresh(slot)
    return slot


@router.put("/{slot_id}", response_model=DeliverySlotResponse)
def update_delivery_slot(
    slot_id: int,
    data: DeliverySlotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    slot = db.query(DeliverySlot).filter(DeliverySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Delivery slot not found")

    if data.name is not None:
        slot.name = data.name
    if data.start_time is not None:
        slot.start_time = parse_time(data.start_time)
    if data.end_time is not None:
        slot.end_time = parse_time(data.end_time)
    if data.max_capacity is not None:
        slot.max_capacity = data.max_capacity
    if data.is_active is not None:
        slot.is_active = data.is_active

    db.commit()
    db.refresh(slot)
    return slot


@router.delete("/{slot_id}")
def delete_delivery_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    slot = db.query(DeliverySlot).filter(DeliverySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Delivery slot not found")

    db.delete(slot)
    db.commit()
    return {"message": "Delivery slot deleted successfully"}


@router.patch("/{slot_id}/toggle-active", response_model=DeliverySlotResponse)
def toggle_delivery_slot_active(
    slot_id: int,
    data: DeliverySlotToggleActive,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    slot = db.query(DeliverySlot).filter(DeliverySlot.id == slot_id).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Delivery slot not found")

    slot.is_active = data.is_active
    db.commit()
    db.refresh(slot)
    return slot
