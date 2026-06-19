from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from config.database import get_db
from models.theme import ThemeSettings
from models.user import User
from schemas.theme import ThemeSettingsResponse, ThemeSettingsUpdate, ThemeCSSResponse, ActiveThemeCSSPair
from dependencies.auth import require_role
from typing import List

router = APIRouter(prefix="/settings/theme", tags=["theme"])
public_router = APIRouter(tags=["theme"])


def build_theme_response(theme):
    if not theme: return None
    css_vars = {
        "--primary": theme.primary_color,
        "--secondary": theme.secondary_color,
        "--accent": theme.accent_color,
        "--bg": theme.background_color,
        "--surface": theme.surface_color,
        "--header-bg": theme.header_color,
        "--footer-bg": theme.footer_color,
        "--text-primary": theme.text_primary_color,
        "--text-secondary": theme.text_secondary_color,
        "--button-bg": theme.button_bg_color,
        "--button-text": theme.button_text_color,
        "--success": theme.success_color,
        "--warning": theme.warning_color,
        "--error": theme.error_color,
        "--border": theme.border_color,
        "--font-family": theme.font_family,
        "--heading-size": theme.heading_font_size,
        "--body-size": theme.body_font_size,
        "--font-weight": theme.font_weight,
        "--line-height": theme.line_height,
        "--container-width": theme.container_width,
        "--border-radius": theme.border_radius,
        "--box-shadow": theme.box_shadow,
        "--section-spacing": theme.section_spacing,
        "--header-height": theme.header_height,
        "--button-radius": theme.button_border_radius,
        "--button-padding": theme.button_padding,
        "--button-hover": theme.button_hover_color,
        "--button-shadow": theme.button_shadow,
    }
    return ThemeCSSResponse(
        css_variables=css_vars,
        font_family=theme.font_family,
        container_width=theme.container_width,
        grid_columns=theme.grid_columns,
        is_dark_mode=theme.is_dark_mode,
    )

@public_router.get("/settings/theme/active", response_model=ActiveThemeCSSPair)
def get_active_theme_css(response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    theme_light = db.query(ThemeSettings).filter(ThemeSettings.is_active == True).first()
    theme_dark = db.query(ThemeSettings).filter(ThemeSettings.is_active_dark == True).first()
    
    if not theme_light:
        theme_light = ThemeSettings(name="Default Theme", is_active=True)
        db.add(theme_light)
        db.commit()
        db.refresh(theme_light)

    return ActiveThemeCSSPair(
        light=build_theme_response(theme_light),
        dark=build_theme_response(theme_dark)
    )


@router.get("", response_model=List[ThemeSettingsResponse])
def list_themes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    return db.query(ThemeSettings).order_by(ThemeSettings.id).all()


@router.get("/{theme_id}", response_model=ThemeSettingsResponse)
def get_theme(
    theme_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    theme = db.query(ThemeSettings).filter(ThemeSettings.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return theme


@router.put("/{theme_id}", response_model=ThemeSettingsResponse)
def update_theme(
    theme_id: int,
    data: ThemeSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    theme = db.query(ThemeSettings).filter(ThemeSettings.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(theme, key, value)

    if data.is_active is not None and data.is_active:
        db.query(ThemeSettings).filter(
            ThemeSettings.id != theme_id
        ).update({"is_active": False})

    if data.is_active_dark is not None and data.is_active_dark:
        db.query(ThemeSettings).filter(
            ThemeSettings.id != theme_id
        ).update({"is_active_dark": False})

    db.commit()
    db.refresh(theme)
    return theme


@router.post("", response_model=ThemeSettingsResponse, status_code=201)
def create_theme(
    data: ThemeSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    theme = ThemeSettings(**data.model_dump(exclude_unset=True))
    db.add(theme)
    if data.is_active:
        db.query(ThemeSettings).filter(ThemeSettings.id != theme.id).update({"is_active": False})
    if data.is_active_dark:
        db.query(ThemeSettings).filter(ThemeSettings.id != theme.id).update({"is_active_dark": False})
    db.commit()
    db.refresh(theme)
    return theme


@router.delete("/{theme_id}")
def delete_theme(
    theme_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    theme = db.query(ThemeSettings).filter(ThemeSettings.id == theme_id).first()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    db.delete(theme)
    db.commit()
    return {"message": "Theme deleted successfully"}


@router.post("/{theme_id}/duplicate", response_model=ThemeSettingsResponse)
def duplicate_theme(
    theme_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "staff")),
):
    original = db.query(ThemeSettings).filter(ThemeSettings.id == theme_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Theme not found")

    new_theme = ThemeSettings(
        name=f"{original.name} (Copy)",
        is_active=False,
        is_dark_mode=original.is_dark_mode,
        preview_image=original.preview_image,
        primary_color=original.primary_color,
        secondary_color=original.secondary_color,
        accent_color=original.accent_color,
        background_color=original.background_color,
        surface_color=original.surface_color,
        header_color=original.header_color,
        footer_color=original.footer_color,
        text_primary_color=original.text_primary_color,
        text_secondary_color=original.text_secondary_color,
        button_bg_color=original.button_bg_color,
        button_text_color=original.button_text_color,
        success_color=original.success_color,
        warning_color=original.warning_color,
        error_color=original.error_color,
        border_color=original.border_color,
        font_family=original.font_family,
        heading_font_size=original.heading_font_size,
        body_font_size=original.body_font_size,
        font_weight=original.font_weight,
        line_height=original.line_height,
        container_width=original.container_width,
        grid_columns=original.grid_columns,
        card_style=original.card_style,
        border_radius=original.border_radius,
        box_shadow=original.box_shadow,
        section_spacing=original.section_spacing,
        header_height=original.header_height,
        footer_height=original.footer_height,
        button_border_radius=original.button_border_radius,
        button_padding=original.button_padding,
        button_hover_color=original.button_hover_color,
        button_hover_animation=original.button_hover_animation,
        button_shadow=original.button_shadow,
    )
    db.add(new_theme)
    db.commit()
    db.refresh(new_theme)
    return new_theme
