from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CategoryDetail(CategoryResponse):
    parent: Optional["CategoryResponse"] = None

CategoryDetail.model_rebuild()

class CategoryTreeNode(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    image: Optional[str]
    is_active: bool
    children: List["CategoryTreeNode"] = []

    model_config = ConfigDict(from_attributes=True)

CategoryTreeNode.model_rebuild()
