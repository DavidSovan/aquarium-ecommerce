from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
import re
from config.database import get_db
from models.category import Category
from models.user import User
from schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryDetail,
    CategoryTreeNode,
)
from dependencies.auth import require_role

router = APIRouter(prefix="/categories", tags=["categories"])

def generate_slug(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def validate_parent_exists(db: Session, parent_id: int) -> Category:
    parent = db.query(Category).filter(Category.id == parent_id).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent category not found")
    return parent

def prevent_circular_reference(db: Session, category_id: int, new_parent_id: int):
    if category_id == new_parent_id:
        raise HTTPException(status_code=400, detail="Category cannot be its own parent")

    current = db.query(Category).filter(Category.id == new_parent_id).first()
    while current:
        if current.id == category_id:
            raise HTTPException(status_code=400, detail="Circular reference detected")
        current = current.parent

def build_tree_node(category: Category) -> CategoryTreeNode:
    children = [build_tree_node(child) for child in category.children]
    return CategoryTreeNode(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        image=category.image,
        is_active=category.is_active,
        children=children,
    )

@router.get("", response_model=list[CategoryResponse])
def list_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(Category).filter(Category.is_active == True).offset(skip).limit(limit).all()
    return categories

@router.get("/tree", response_model=list[CategoryTreeNode])
def get_category_tree(db: Session = Depends(get_db)):
    root_categories = db.query(Category).filter(
        and_(Category.parent_id == None, Category.is_active == True)
    ).all()
    tree = [build_tree_node(cat) for cat in root_categories]
    return tree

@router.get("/{category_id}", response_model=CategoryDetail)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("", response_model=CategoryResponse)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    slug = category.slug or generate_slug(category.name)

    existing = db.query(Category).filter(Category.slug == slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    if category.parent_id:
        validate_parent_exists(db, category.parent_id)

    db_category = Category(
        name=category.name,
        slug=slug,
        description=category.description,
        image=category.image,
        parent_id=category.parent_id,
        is_active=category.is_active,
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    if category.name:
        db_category.name = category.name

    if category.slug:
        existing = db.query(Category).filter(
            and_(Category.slug == category.slug, Category.id != category_id)
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")
        db_category.slug = category.slug
    elif category.name:
        db_category.slug = generate_slug(category.name)

    if category.description is not None:
        db_category.description = category.description

    if category.image is not None:
        db_category.image = category.image

    if category.parent_id is not None:
        if category.parent_id == 0:
            db_category.parent_id = None
        else:
            prevent_circular_reference(db, category_id, category.parent_id)
            validate_parent_exists(db, category.parent_id)
            db_category.parent_id = category.parent_id

    if category.is_active is not None:
        db_category.is_active = category.is_active

    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}
