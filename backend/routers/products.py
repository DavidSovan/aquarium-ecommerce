from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import re
from typing import Optional
from config.database import get_db
from models.product import Product
from models.category import Category
from models.user import User
from schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductDetail,
    ProductListResponse,
)
from dependencies.auth import require_role
from typing import Annotated

router = APIRouter(prefix="/products", tags=["products"])

ALLOWED_SORT_FIELDS = {"name", "price", "created_at", "updated_at", "stock_quantity"}


def generate_slug(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')


def validate_category(db: Session, category_id: int):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("", response_model=ProductListResponse)
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    brand: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    in_stock: Optional[bool] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
):
    if sort_by not in ALLOWED_SORT_FIELDS:
        raise HTTPException(status_code=400, detail=f"Invalid sort field. Allowed: {', '.join(sorted(ALLOWED_SORT_FIELDS))}")

    if sort_order not in ("asc", "desc"):
        raise HTTPException(status_code=400, detail="sort_order must be 'asc' or 'desc'")

    query = db.query(Product).filter(Product.is_active == True)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.short_description.ilike(search_term),
                Product.description.ilike(search_term),
                Product.sku.ilike(search_term),
            )
        )

    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)

    if in_stock is not None:
        if in_stock:
            query = query.filter(Product.stock_quantity > 0)
        else:
            query = query.filter(Product.stock_quantity == 0)

    total = query.count()

    sort_column = getattr(Product, sort_by)
    if sort_order == "desc":
        sort_column = sort_column.desc()

    products = query.order_by(sort_column).offset(skip).limit(limit).all()

    return ProductListResponse(
        items=products,
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/featured", response_model=list[ProductResponse])
def get_featured_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(
        and_(Product.is_featured == True, Product.is_active == True)
    ).all()
    return products


@router.get("/slug/{slug}", response_model=ProductDetail)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("/{product_id}", response_model=ProductDetail)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    slug = product.slug or generate_slug(product.name)

    existing = db.query(Product).filter(Product.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    if product.sku:
        existing_sku = db.query(Product).filter(Product.sku == product.sku).first()
        if existing_sku:
            raise HTTPException(status_code=400, detail="SKU already exists")

    if product.category_id:
        validate_category(db, product.category_id)

    db_product = Product(
        category_id=product.category_id,
        name=product.name,
        slug=slug,
        sku=product.sku,
        short_description=product.short_description,
        description=product.description,
        price=product.price,
        discount_price=product.discount_price,
        stock_quantity=product.stock_quantity,
        thumbnail=product.thumbnail,
        brand=product.brand,
        weight=product.weight,
        length=product.length,
        width=product.width,
        height=product.height,
        is_featured=product.is_featured,
        is_active=product.is_active,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.name is not None:
        db_product.name = product.name

    if product.slug is not None:
        existing = db.query(Product).filter(
            and_(Product.slug == product.slug, Product.id != product_id)
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")
        db_product.slug = product.slug
    elif product.name is not None:
        db_product.slug = generate_slug(product.name)

    if product.sku is not None:
        existing_sku = db.query(Product).filter(
            and_(Product.sku == product.sku, Product.id != product_id)
        ).first()
        if existing_sku:
            raise HTTPException(status_code=400, detail="SKU already exists")
        db_product.sku = product.sku

    if product.category_id is not None:
        if product.category_id == 0:
            db_product.category_id = None
        else:
            validate_category(db, product.category_id)
            db_product.category_id = product.category_id

    if product.short_description is not None:
        db_product.short_description = product.short_description

    if product.description is not None:
        db_product.description = product.description

    if product.price is not None:
        db_product.price = product.price

    if product.discount_price is not None:
        db_product.discount_price = product.discount_price

    if product.stock_quantity is not None:
        db_product.stock_quantity = product.stock_quantity

    if product.thumbnail is not None:
        db_product.thumbnail = product.thumbnail

    if product.brand is not None:
        db_product.brand = product.brand

    if product.weight is not None:
        db_product.weight = product.weight

    if product.length is not None:
        db_product.length = product.length

    if product.width is not None:
        db_product.width = product.width

    if product.height is not None:
        db_product.height = product.height

    if product.is_featured is not None:
        db_product.is_featured = product.is_featured

    if product.is_active is not None:
        db_product.is_active = product.is_active

    db.commit()
    db.refresh(db_product)
    return db_product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}
