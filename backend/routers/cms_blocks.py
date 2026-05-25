from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from config.database import get_db
from models.cms_block import CMSBlock
from models.user import User
from schemas.cms import CMSBlockCreate, CMSBlockUpdate, CMSBlockResponse, CMSBlockReorder
from dependencies.auth import require_role
from typing import List

router = APIRouter(prefix="/cms-blocks", tags=["cms-blocks"])
public_router = APIRouter(tags=["cms-blocks"])


@public_router.get("/cms-blocks/active", response_model=List[CMSBlockResponse])
def get_active_blocks(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    return (
        db.query(CMSBlock)
        .filter(
            CMSBlock.is_active == True,
            (CMSBlock.publish_at == None) | (CMSBlock.publish_at <= now),
            (CMSBlock.unpublish_at == None) | (CMSBlock.unpublish_at > now),
        )
        .order_by(CMSBlock.sort_order)
        .all()
    )


@router.get("", response_model=List[CMSBlockResponse])
def list_cms_blocks(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    return db.query(CMSBlock).order_by(CMSBlock.sort_order).all()


@router.get("/{block_id}", response_model=CMSBlockResponse)
def get_cms_block(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    block = db.query(CMSBlock).filter(CMSBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="CMS Block not found")
    return block


@router.post("", response_model=CMSBlockResponse, status_code=201)
def create_cms_block(
    data: CMSBlockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    existing = db.query(CMSBlock).filter(CMSBlock.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Block slug already exists")
    block = CMSBlock(**data.model_dump())
    db.add(block)
    db.commit()
    db.refresh(block)
    return block


@router.put("/{block_id}", response_model=CMSBlockResponse)
def update_cms_block(
    block_id: int,
    data: CMSBlockUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    block = db.query(CMSBlock).filter(CMSBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="CMS Block not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(block, key, value)

    db.commit()
    db.refresh(block)
    return block


@router.delete("/{block_id}")
def delete_cms_block(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    block = db.query(CMSBlock).filter(CMSBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="CMS Block not found")
    db.delete(block)
    db.commit()
    return {"message": "CMS Block deleted successfully"}


@router.put("/reorder/all", response_model=List[CMSBlockResponse])
def reorder_cms_blocks(
    data: List[CMSBlockReorder],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    ids = [item.id for item in data]
    blocks = db.query(CMSBlock).filter(CMSBlock.id.in_(ids)).all()
    block_map = {b.id: b for b in blocks}

    for item in data:
        if item.id in block_map:
            block_map[item.id].sort_order = item.sort_order

    db.commit()
    for b in blocks:
        db.refresh(b)
    return sorted(blocks, key=lambda b: b.sort_order)
