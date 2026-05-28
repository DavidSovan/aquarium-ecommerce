from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from config.database import get_db
from models.product import Product
from models.product_option import ProductOption, ProductOptionValue
from models.user import User
from schemas.customization import (
    ProductOptionCreate,
    ProductOptionUpdate,
    ProductOptionResponse,
    ProductOptionValueCreate,
    ProductOptionValueUpdate,
    ProductOptionValueResponse,
    PriceCalculationRequest,
    PriceCalculationResponse,
)
from dependencies.auth import require_role, get_optional_user

router = APIRouter(prefix="/products", tags=["product-customization"])


# --- Get options for a product (public, included in product detail) ---

def get_product_options(db: Session, product_id: int) -> list[ProductOption]:
    return db.query(ProductOption).filter(
        ProductOption.product_id == product_id
    ).order_by(ProductOption.sort_order).all()


# --- Admin: Create option ---

@router.post("/{product_id}/options", response_model=ProductOptionResponse, status_code=201)
def create_option(
    product_id: int,
    data: ProductOptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    option = ProductOption(
        product_id=product_id,
        name=data.name,
        type=data.type,
        is_required=data.is_required,
        sort_order=data.sort_order,
    )
    db.add(option)
    db.flush()

    sort_order = 0
    for v in data.values:
        val = ProductOptionValue(
            option_id=option.id,
            value=v.value,
            price_modifier=v.price_modifier,
            image_url=v.image_url,
            sort_order=v.sort_order if v.sort_order != 0 else sort_order,
        )
        sort_order += 1
        db.add(val)

    db.commit()
    db.refresh(option)
    return option


# --- Admin: Update option ---

@router.put("/options/{option_id}", response_model=ProductOptionResponse)
def update_option(
    option_id: int,
    data: ProductOptionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    option = db.query(ProductOption).filter(ProductOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    if data.name is not None:
        option.name = data.name
    if data.type is not None:
        option.type = data.type
    if data.is_required is not None:
        option.is_required = data.is_required
    if data.sort_order is not None:
        option.sort_order = data.sort_order

    db.commit()
    db.refresh(option)
    return option


# --- Admin: Delete option ---

@router.delete("/options/{option_id}")
def delete_option(
    option_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    option = db.query(ProductOption).filter(ProductOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    db.delete(option)
    db.commit()
    return {"message": "Option deleted successfully"}


# --- Admin: Create option value ---

@router.post("/options/{option_id}/values", response_model=ProductOptionValueResponse, status_code=201)
def create_option_value(
    option_id: int,
    data: ProductOptionValueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    option = db.query(ProductOption).filter(ProductOption.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Option not found")

    val = ProductOptionValue(
        option_id=option_id,
        value=data.value,
        price_modifier=data.price_modifier,
        image_url=data.image_url,
        sort_order=data.sort_order,
    )
    db.add(val)
    db.commit()
    db.refresh(val)
    return val


# --- Admin: Update option value ---

@router.put("/options/values/{value_id}", response_model=ProductOptionValueResponse)
def update_option_value(
    value_id: int,
    data: ProductOptionValueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    val = db.query(ProductOptionValue).filter(ProductOptionValue.id == value_id).first()
    if not val:
        raise HTTPException(status_code=404, detail="Option value not found")

    if data.value is not None:
        val.value = data.value
    if data.price_modifier is not None:
        val.price_modifier = data.price_modifier
    if data.image_url is not None:
        val.image_url = data.image_url
    if data.sort_order is not None:
        val.sort_order = data.sort_order

    db.commit()
    db.refresh(val)
    return val


# --- Admin: Delete option value ---

@router.delete("/options/values/{value_id}")
def delete_option_value(
    value_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    val = db.query(ProductOptionValue).filter(ProductOptionValue.id == value_id).first()
    if not val:
        raise HTTPException(status_code=404, detail="Option value not found")

    db.delete(val)
    db.commit()
    return {"message": "Option value deleted successfully"}


# --- Public: Toggle customizable ---

@router.put("/{product_id}/customizable")
def toggle_customizable(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_customizable = not product.is_customizable
    db.commit()
    db.refresh(product)
    return {"is_customizable": product.is_customizable}


# --- Admin: Set customizable status directly ---

@router.patch("/{product_id}/customizable-status")
def set_customizable_status(
    product_id: int,
    status: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.is_customizable = status
    db.commit()
    db.refresh(product)
    return {"is_customizable": product.is_customizable}


# --- Public: Calculate final price with customizations ---

@router.post("/calculate-price", response_model=PriceCalculationResponse)
def calculate_price(
    data: PriceCalculationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    """
    Calculate the final price of a product with selected customization options.
    
    Example request:
    {
        "product_id": 1,
        "customizations": [
            {"option_id": 1, "value_id": 5},
            {"option_id": 2, "value_id": 8}
        ]
    }
    """
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    base_price = product.discount_price if product.discount_price else product.price
    modifiers_total = 0.0
    breakdown = {}

    if data.customizations:
        for selection in data.customizations:
            if selection.value_id:
                val = db.query(ProductOptionValue).filter(
                    ProductOptionValue.id == selection.value_id,
                    ProductOptionValue.option_id == selection.option_id,
                ).first()
                if val:
                    modifiers_total += val.price_modifier
                    option = db.query(ProductOption).filter(
                        ProductOption.id == selection.option_id
                    ).first()
                    option_name = option.name if option else f"Option {selection.option_id}"
                    breakdown[option_name] = val.price_modifier

    final_price = round(base_price + modifiers_total, 2)

    return PriceCalculationResponse(
        base_price=round(base_price, 2),
        modifiers_total=round(modifiers_total, 2),
        final_price=final_price,
        breakdown=breakdown,
    )


# --- Public: Get all options for a product ---

@router.get("/{product_id}/options", response_model=list[ProductOptionResponse])
def get_product_customization_options(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    """Get all customization options available for a product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product.is_customizable:
        return []

    options = db.query(ProductOption).filter(
        ProductOption.product_id == product_id
    ).order_by(ProductOption.sort_order).all()

    return options
