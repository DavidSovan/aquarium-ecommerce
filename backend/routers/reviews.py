from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from config.database import get_db
from models.review import Review
from models.product import Product
from models.user import User
from schemas.review import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    ReviewListResponse,
    MyReviewResponse,
    MyReviewListResponse,
)
from dependencies.auth import get_current_user, get_optional_user, require_role

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/product/{product_id}", response_model=ReviewListResponse)
def list_product_reviews(
    product_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    query = db.query(Review).filter(
        Review.product_id == product_id,
        Review.is_approved == True,
    )

    total = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()

    avg = db.query(func.avg(Review.rating)).filter(
        Review.product_id == product_id,
        Review.is_approved == True,
    ).scalar() or 0

    return ReviewListResponse(
        total=total,
        items=[ReviewResponse.model_validate(r) for r in reviews],
        average_rating=round(float(avg), 1),
    )


@router.get("/my-reviews", response_model=MyReviewListResponse)
def list_my_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Review).filter(Review.user_id == current_user.id)
    total = query.count()
    reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    return MyReviewListResponse(
        total=total,
        items=[MyReviewResponse.model_validate(r) for r in reviews],
    )


@router.post("/product/{product_id}", response_model=ReviewResponse, status_code=201)
def create_review(
    product_id: int,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("customer", "staff", "admin")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    review = Review(
        product_id=product_id,
        user_id=current_user.id,
        rating=data.rating,
        title=data.title,
        content=data.content,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized to update this review")

    if data.rating is not None:
        review.rating = data.rating
    if data.title is not None:
        review.title = data.title
    if data.content is not None:
        review.content = data.content

    db.commit()
    db.refresh(review)
    return review


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and current_user.role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Not authorized to delete this review")

    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}


@router.put("/{review_id}/approve", response_model=ReviewResponse)
def approve_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    review.is_approved = not review.is_approved
    db.commit()
    db.refresh(review)
    return review
