from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from config.database import get_db
from models.product import Product
from models.product_image import ProductImage
from models.user import User
from schemas.product_image import (
    ProductImageCreate,
    ProductImageResponse,
    ReorderRequest,
)
from dependencies.auth import require_role

router = APIRouter(prefix="/products", tags=["product-images"])


@router.post("/{product_id}/images", response_model=ProductImageResponse, status_code=201)
def upload_image(
    product_id: int,
    data: ProductImageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    max_order = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).count()

    image = ProductImage(
        product_id=product_id,
        image_url=data.image_url,
        sort_order=data.sort_order if data.sort_order is not None else max_order,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


@router.get("/{product_id}/images", response_model=List[ProductImageResponse])
def get_product_images(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    images = db.query(ProductImage).filter(
        ProductImage.product_id == product_id
    ).order_by(ProductImage.sort_order).all()
    return images


@router.put("/images/reorder")
def reorder_images(
    data: ReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    for item in data.items:
        image = db.query(ProductImage).filter(ProductImage.id == item.id).first()
        if not image:
            raise HTTPException(status_code=404, detail=f"Image with id {item.id} not found")
        image.sort_order = item.sort_order
    db.commit()
    return {"message": "Images reordered successfully"}


@router.delete("/images/{image_id}")
def delete_image(
    image_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    image = db.query(ProductImage).filter(ProductImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    db.delete(image)
    db.commit()
    return {"message": "Image deleted successfully"}
