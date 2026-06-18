from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from config.database import get_db
from models.address import Address
from models.user import User
from schemas.address import (
    AddressCreate,
    AddressUpdate,
    AddressResponse,
    AddressListResponse,
)
from dependencies.auth import get_current_user, require_role

router = APIRouter(prefix="/addresses", tags=["addresses"])


def unset_other_defaults(db: Session, user_id: str, exclude_id: Optional[int] = None):
    query = db.query(Address).filter(
        Address.user_id == user_id,
        Address.is_default == True,
    )
    if exclude_id:
        query = query.filter(Address.id != exclude_id)
    for addr in query.all():
        addr.is_default = False


@router.get("", response_model=AddressListResponse)
def list_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer", "staff", "admin")),
):
    addresses = db.query(Address).filter(
        Address.user_id == current_user.id
    ).order_by(
        Address.is_default.desc(),
        Address.created_at.desc(),
    ).all()
    return AddressListResponse(items=addresses, total=len(addresses))


@router.get("/{address_id}", response_model=AddressResponse)
def get_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer", "staff", "admin")),
):
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if address.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized to view this address")
    return address


@router.post("", response_model=AddressResponse, status_code=201)
def create_address(
    data: AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer", "staff", "admin")),
):
    if data.is_default:
        unset_other_defaults(db, current_user.id)

    address = Address(**data.model_dump(), user_id=current_user.id)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address


@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    data: AddressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer", "staff", "admin")),
):
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if address.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized to update this address")

    update_data = data.model_dump(exclude_unset=True)

    if update_data.get("is_default"):
        unset_other_defaults(db, address.user_id, exclude_id=address_id)

    for key, value in update_data.items():
        setattr(address, key, value)

    db.commit()
    db.refresh(address)
    return address


@router.delete("/{address_id}")
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer", "staff", "admin")),
):
    address = db.query(Address).filter(Address.id == address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    if address.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this address")

    # Set foreign keys in Order table to None to prevent IntegrityError
    from models.order import Order
    db.query(Order).filter(Order.shipping_address_id == address_id).update({Order.shipping_address_id: None})
    db.query(Order).filter(Order.billing_address_id == address_id).update({Order.billing_address_id: None})

    db.delete(address)
    db.commit()
    return {"message": "Address deleted successfully"}
