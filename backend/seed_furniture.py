"""Seed script for furniture products - run from backend/ directory with: python seed_furniture.py"""
import sys
import os
import re
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal, engine, Base
from models.product import Product
from models.category import Category
from models.user import User
from models.coupon import Coupon
from models.banner import Banner
from models.setting import Setting
from models.theme import ThemeSettings
from models.branding import BrandingSettings
from models.homepage import HomepageSection
from models.cms_block import CMSBlock
from dependencies.auth import hash_password


def generate_slug(name):
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        admin = User(
            email="admin@furniturestore.com",
            password_hash=hash_password("admin123"),
            first_name="Admin",
            last_name="User",
            role="admin",
            is_active=True,
        )
        db.add(admin)

        staff = User(
            email="staff@furniturestore.com",
            password_hash=hash_password("staff123"),
            first_name="Staff",
            last_name="User",
            role="staff",
            is_active=True,
        )
        db.add(staff)

        customer = User(
            email="customer@example.com",
            password_hash=hash_password("customer123"),
            first_name="John",
            last_name="Doe",
            role="customer",
            is_active=True,
        )
        db.add(customer)

        driver = User(
            email="driver@furniturestore.com",
            password_hash=hash_password("driver123"),
            first_name="Delivery",
            last_name="Driver",
            role="driver",
            is_active=True,
        )
        db.add(driver)
        db.flush()

        themes = [
            {
                "name": "Midnight Pro",
                "is_active": False,
                "is_dark_mode": True,
                "primary_color": "#3b82f6",
                "secondary_color": "#1d4ed8",
                "accent_color": "#60a5fa",
                "background_color": "#0f172a",
                "surface_color": "#1e293b",
                "header_color": "#0f172a",
                "footer_color": "#0f172a",
                "text_primary_color": "#f8fafc",
                "text_secondary_color": "#94a3b8",
                "button_bg_color": "#3b82f6",
                "button_text_color": "#ffffff",
                "success_color": "#10b981",
                "warning_color": "#f59e0b",
                "error_color": "#ef4444",
                "border_color": "#334155",
                "font_family": "'Inter', sans-serif",
                "heading_font_size": "2.5rem",
                "body_font_size": "1rem",
                "font_weight": "400",
                "line_height": "1.6",
                "container_width": "1280px",
                "grid_columns": 4,
                "card_style": "rounded-2xl",
                "border_radius": "1rem",
                "box_shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                "section_spacing": "5rem",
                "header_height": "4.5rem",
                "footer_height": "auto",
                "button_border_radius": "0.75rem",
                "button_padding": "0.875rem 1.75rem",
                "button_hover_color": "#2563eb",
                "button_hover_animation": "scale-up",
                "button_shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.2)"
            },
            {
                "name": "Warm Oak",
                "is_active": False,
                "is_dark_mode": False,
                "primary_color": "#b45309",
                "secondary_color": "#92400e",
                "accent_color": "#f59e0b",
                "background_color": "#fffbeb",
                "surface_color": "#ffffff",
                "header_color": "#451a03",
                "footer_color": "#451a03",
                "text_primary_color": "#451a03",
                "text_secondary_color": "#78350f",
                "button_bg_color": "#b45309",
                "button_text_color": "#ffffff",
                "success_color": "#10b981",
                "warning_color": "#f59e0b",
                "error_color": "#ef4444",
                "border_color": "#fef3c7",
                "font_family": "'Lora', serif",
                "heading_font_size": "2.75rem",
                "body_font_size": "1.05rem",
                "font_weight": "400",
                "line_height": "1.7",
                "container_width": "1200px",
                "grid_columns": 4,
                "card_style": "rounded-3xl",
                "border_radius": "1.5rem",
                "box_shadow": "0 4px 20px -2px rgba(180, 83, 9, 0.1)",
                "section_spacing": "6rem",
                "header_height": "5rem",
                "footer_height": "auto",
                "button_border_radius": "2rem",
                "button_padding": "1rem 2rem",
                "button_hover_color": "#92400e",
                "button_hover_animation": "bounce",
                "button_shadow": "0 10px 15px -3px rgba(180, 83, 9, 0.2)"
            },
            {
                "name": "Nordic Minimal",
                "is_active": False,
                "is_dark_mode": False,
                "primary_color": "#64748b",
                "secondary_color": "#475569",
                "accent_color": "#94a3b8",
                "background_color": "#f8fafc",
                "surface_color": "#ffffff",
                "header_color": "#1e293b",
                "footer_color": "#1e293b",
                "text_primary_color": "#1e293b",
                "text_secondary_color": "#64748b",
                "button_bg_color": "#64748b",
                "button_text_color": "#ffffff",
                "success_color": "#10b981",
                "warning_color": "#f59e0b",
                "error_color": "#ef4444",
                "border_color": "#e2e8f0",
                "font_family": "'Inter', sans-serif",
                "heading_font_size": "2.5rem",
                "body_font_size": "1rem",
                "font_weight": "400",
                "line_height": "1.6",
                "container_width": "1280px",
                "grid_columns": 4,
                "card_style": "rounded-xl",
                "border_radius": "0.75rem",
                "box_shadow": "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                "section_spacing": "5rem",
                "header_height": "4.5rem",
                "footer_height": "auto",
                "button_border_radius": "0.5rem",
                "button_padding": "0.875rem 1.5rem",
                "button_hover_color": "#475569",
                "button_hover_animation": "scale",
                "button_shadow": "0 4px 6px -1px rgba(100, 116, 139, 0.2)"
            },
            {
                "name": "Forest Canopy",
                "is_active": False,
                "is_dark_mode": False,
                "primary_color": "#059669",
                "secondary_color": "#047857",
                "accent_color": "#34d399",
                "background_color": "#f0fdf4",
                "surface_color": "#ffffff",
                "header_color": "#064e3b",
                "footer_color": "#064e3b",
                "text_primary_color": "#064e3b",
                "text_secondary_color": "#047857",
                "button_bg_color": "#059669",
                "button_text_color": "#ffffff",
                "success_color": "#10b981",
                "warning_color": "#f59e0b",
                "error_color": "#ef4444",
                "border_color": "#d1fae5",
                "font_family": "'DM Serif Display', serif",
                "heading_font_size": "2.75rem",
                "body_font_size": "1.05rem",
                "font_weight": "400",
                "line_height": "1.7",
                "container_width": "1280px",
                "grid_columns": 4,
                "card_style": "rounded-xl",
                "border_radius": "0.75rem",
                "box_shadow": "0 4px 16px -2px rgba(5, 150, 105, 0.1)",
                "section_spacing": "5rem",
                "header_height": "4.5rem",
                "footer_height": "auto",
                "button_border_radius": "0.625rem",
                "button_padding": "0.875rem 1.75rem",
                "button_hover_color": "#047857",
                "button_hover_animation": "scale-up",
                "button_shadow": "0 4px 10px -2px rgba(5, 150, 105, 0.3)"
            },
            {
                "name": "Royal Velvet",
                "is_active": False,
                "is_dark_mode": True,
                "primary_color": "#7e22ce",
                "secondary_color": "#6b21a8",
                "accent_color": "#d946ef",
                "background_color": "#0f011e",
                "surface_color": "#1e0533",
                "header_color": "#0f011e",
                "footer_color": "#0f011e",
                "text_primary_color": "#faf5ff",
                "text_secondary_color": "#c084fc",
                "button_bg_color": "#7e22ce",
                "button_text_color": "#ffffff",
                "success_color": "#10b981",
                "warning_color": "#f59e0b",
                "error_color": "#ef4444",
                "border_color": "#3b0764",
                "font_family": "'Playfair Display', serif",
                "heading_font_size": "3rem",
                "body_font_size": "1.05rem",
                "font_weight": "400",
                "line_height": "1.7",
                "container_width": "1200px",
                "grid_columns": 4,
                "card_style": "rounded-2xl",
                "border_radius": "1.25rem",
                "box_shadow": "0 12px 24px -8px rgba(126, 34, 206, 0.2)",
                "section_spacing": "5rem",
                "header_height": "4.5rem",
                "footer_height": "auto",
                "button_border_radius": "0.75rem",
                "button_padding": "0.875rem 2rem",
                "button_hover_color": "#9333ea",
                "button_hover_animation": "glow",
                "button_shadow": "0 4px 14px rgba(126, 34, 206, 0.4)"
            },
            {
                "name": "Ocean Breeze",
                "is_active": False,
                "is_dark_mode": False,
                "primary_color": "#0e7490",
                "secondary_color": "#0891b2",
                "accent_color": "#67e8f9",
                "background_color": "#ecfeff",
                "surface_color": "#ffffff",
                "header_color": "#164e63",
                "footer_color": "#164e63",
                "text_primary_color": "#164e63",
                "text_secondary_color": "#0e7490",
                "button_bg_color": "#0e7490",
                "button_text_color": "#ffffff",
                "success_color": "#10b981",
                "warning_color": "#f59e0b",
                "error_color": "#ef4444",
                "border_color": "#cffafe",
                "font_family": "'Montserrat', sans-serif",
                "heading_font_size": "2.5rem",
                "body_font_size": "1rem",
                "font_weight": "400",
                "line_height": "1.6",
                "container_width": "1280px",
                "grid_columns": 4,
                "card_style": "rounded-xl",
                "border_radius": "0.75rem",
                "box_shadow": "0 4px 12px -2px rgba(14, 116, 144, 0.08)",
                "section_spacing": "5rem",
                "header_height": "4.5rem",
                "footer_height": "auto",
                "button_border_radius": "9999px",
                "button_padding": "0.75rem 1.75rem",
                "button_hover_color": "#0891b2",
                "button_hover_animation": "bounce",
                "button_shadow": "0 4px 10px -2px rgba(14, 116, 144, 0.25)"
            },
            {
                "name": "Charcoal Studio",
                "is_active": False,
                "is_dark_mode": True,
                "primary_color": "#facc15",
                "secondary_color": "#eab308",
                "accent_color": "#fde047",
                "background_color": "#171717",
                "surface_color": "#262626",
                "header_color": "#0a0a0a",
                "footer_color": "#0a0a0a",
                "text_primary_color": "#fafafa",
                "text_secondary_color": "#a3a3a3",
                "button_bg_color": "#facc15",
                "button_text_color": "#0a0a0a",
                "success_color": "#22c55e",
                "warning_color": "#f59e0b",
                "error_color": "#ef4444",
                "border_color": "#404040",
                "font_family": "'Inter', sans-serif",
                "heading_font_size": "2.25rem",
                "body_font_size": "0.95rem",
                "font_weight": "500",
                "line_height": "1.5",
                "container_width": "1320px",
                "grid_columns": 4,
                "card_style": "rounded-lg",
                "border_radius": "0.5rem",
                "box_shadow": "0 8px 24px rgba(0, 0, 0, 0.5)",
                "section_spacing": "4rem",
                "header_height": "4rem",
                "footer_height": "auto",
                "button_border_radius": "0.375rem",
                "button_padding": "0.75rem 1.5rem",
                "button_hover_color": "#eab308",
                "button_hover_animation": "scale",
                "button_shadow": "0 4px 12px rgba(250, 204, 21, 0.3)"
            },
            {
                "name": "Default Theme",
                "is_active": True,
                "is_dark_mode": False,
                "primary_color": "#2563eb",
                "secondary_color": "#4f46e5",
                "accent_color": "#38bdf8",
                "background_color": "#f9fafb",
                "surface_color": "#ffffff",
                "header_color": "#0c1445",
                "footer_color": "#0c1445",
                "text_primary_color": "#111827",
                "text_secondary_color": "#6b7280",
                "button_bg_color": "#2563eb",
                "button_text_color": "#ffffff",
                "success_color": "#10b981",
                "warning_color": "#f59e0b",
                "error_color": "#ef4444",
                "border_color": "#e5e7eb",
                "font_family": "Inter, system-ui, sans-serif",
                "heading_font_size": "2.5rem",
                "body_font_size": "1rem",
                "font_weight": "400",
                "line_height": "1.6",
                "container_width": "1280px",
                "grid_columns": 4,
                "card_style": "rounded-xl",
                "border_radius": "0.75rem",
                "box_shadow": "0 1px 3px rgba(0,0,0,0.1)",
                "section_spacing": "4rem",
                "header_height": "4rem",
                "footer_height": "auto",
                "button_border_radius": "0.5rem",
                "button_padding": "0.75rem 1.5rem",
                "button_hover_color": "#1d4ed8",
                "button_hover_animation": "scale",
                "button_shadow": "0 4px 6px rgba(0,0,0,0.1)"
            }
        ]
        for t_data in themes:
            db.add(ThemeSettings(**t_data))
        db.flush()

        homepage_sections = [
            {
                "section_type": "hero",
                "sort_order": 0,
                "is_active": True,
                "hero_title": "Modern Living Collection 2026",
                "hero_subtitle": "Transform your space with contemporary furniture designed for comfort and style.",
                "hero_cta_text": "Shop Now",
                "hero_cta_url": "/products?collection=modern-living-2026",
                "hero_bg_image": "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1600&q=80",
                "hero_badge_text": "New Collection",
                "hero_overlay_color": "#1e293b",
                "hero_overlay_opacity": 0.4
            },
            {
                "section_type": "categories",
                "sort_order": 1,
                "is_active": True,
                "content": {
                    "title": "Shop by Room",
                    "subtitle": "Find everything you need to furnish every room in your home.",
                    "items": [
                        {"name": "Living Room", "slug": "living-room", "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80"},
                        {"name": "Bedroom", "slug": "bedroom", "image": "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=500&q=80"},
                        {"name": "Dining Room", "slug": "dining-room", "image": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80"},
                        {"name": "Office", "slug": "office", "image": "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=500&q=80"}
                    ]
                }
            },
            {
                "section_type": "featured_products",
                "sort_order": 2,
                "is_active": True,
                "bg_type": "color",
                "bg_color": "#f8fafc",
                "content": {
                    "title": "Best Sellers",
                    "subtitle": "Our most popular furniture pieces loved by customers everywhere.",
                    "limit": 8
                }
            },
            {
                "section_type": "promo_banner",
                "sort_order": 3,
                "is_active": True,
                "hero_title": "Free Delivery on Orders Over $500",
                "hero_subtitle": "Enjoy complimentary white-glove delivery on all orders above $500. Assembly included.",
                "hero_cta_text": "Start Shopping",
                "hero_cta_url": "/products",
                "hero_bg_image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80",
                "hero_overlay_color": "#1e293b",
                "hero_overlay_opacity": 0.7
            },
            {
                "section_type": "newsletter",
                "sort_order": 4,
                "is_active": True,
                "content": {
                    "title": "Get Interior Inspiration",
                    "subtitle": "Subscribe for design tips, new arrivals, and exclusive offers delivered to your inbox.",
                    "placeholder": "Enter your email address",
                    "button_text": "Subscribe"
                }
            }
        ]
        for s_data in homepage_sections:
            db.add(HomepageSection(**s_data))
        db.flush()

        categories_data = [
            {"name": "Living Room", "slug": "living-room", "description": "Sofas, coffee tables, and entertainment units for your living space"},
            {"name": "Bedroom", "slug": "bedroom", "description": "Beds, dressers, nightstands, and bedroom sets"},
            {"name": "Dining Room", "slug": "dining-room", "description": "Dining tables, chairs, and storage solutions"},
            {"name": "Office", "slug": "office", "description": "Desks, office chairs, and workstation accessories"},
            {"name": "Lighting", "slug": "lighting", "description": "Lamps, chandeliers, and ambient lighting"},
            {"name": "Outdoor", "slug": "outdoor", "description": "Patio furniture, garden sets, and outdoor decor"},
        ]
        cat_map = {}
        for c in categories_data:
            cat = Category(**c, is_active=True)
            db.add(cat)
            db.flush()
            cat_map[c["name"]] = cat.id

        products_data = [
            # Living Room
            {"name": "Mid-Century Velvet Sofa", "price": 899.99, "cat": "Living Room", "stock": 15, "brand": "ModaLiving", "thumb": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80"},
            {"name": "Farmhouse Coffee Table", "price": 349.99, "cat": "Living Room", "stock": 25, "brand": "Rustic Charm", "thumb": "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&q=80"},
            {"name": "L-shaped Sectional Sofa", "price": 1299.99, "cat": "Living Room", "stock": 10, "brand": "ComfortCraft", "thumb": "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80"},
            {"name": "Glass Top TV Stand", "price": 279.99, "cat": "Living Room", "stock": 20, "brand": "EntertainMe", "thumb": "https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=500&q=80"},
            {"name": "Accent Armchair", "price": 449.99, "cat": "Living Room", "stock": 18, "brand": "ModaLiving", "thumb": "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80"},
            # Bedroom
            {"name": "Upholstered Queen Bed Frame", "price": 699.99, "cat": "Bedroom", "stock": 12, "brand": "DreamWell", "thumb": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80"},
            {"name": "6-Drawer Dresser", "price": 549.99, "cat": "Bedroom", "stock": 14, "brand": "DreamWell", "thumb": "https://images.unsplash.com/photo-1597006335771-4b4eebf47f4e?w=500&q=80"},
            {"name": "Nightstand with USB Ports", "price": 179.99, "cat": "Bedroom", "stock": 35, "brand": "SmartSleep", "thumb": "https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=500&q=80"},
            {"name": "King Size Platform Bed", "price": 899.99, "cat": "Bedroom", "stock": 8, "brand": "DreamWell", "thumb": "https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=500&q=80"},
            {"name": "Wardrobe Closet Cabinet", "price": 649.99, "cat": "Bedroom", "stock": 10, "brand": "OrganizePlus", "thumb": "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80"},
            # Dining Room
            {"name": "Solid Wood Dining Table", "price": 749.99, "cat": "Dining Room", "stock": 12, "brand": "Heritage Wood", "thumb": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80"},
            {"name": "Set of 4 Dining Chairs", "price": 499.99, "cat": "Dining Room", "stock": 20, "brand": "Heritage Wood", "thumb": "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&q=80"},
            {"name": "Buffet Sideboard Cabinet", "price": 599.99, "cat": "Dining Room", "stock": 10, "brand": "OrganizePlus", "thumb": "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=500&q=80"},
            {"name": "Glass Display Cabinet", "price": 449.99, "cat": "Dining Room", "stock": 8, "brand": "ShowcasePro", "thumb": "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=80"},
            {"name": "Round Pedestal Table", "price": 599.99, "cat": "Dining Room", "stock": 15, "brand": "Heritage Wood", "thumb": "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=500&q=80"},
            # Office
            {"name": "Executive Office Desk", "price": 549.99, "cat": "Office", "stock": 15, "brand": "WorkSpace Pro", "thumb": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80"},
            {"name": "Ergonomic Mesh Chair", "price": 379.99, "cat": "Office", "stock": 30, "brand": "ErgoComfort", "thumb": "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80"},
            {"name": "Standing Desk Converter", "price": 299.99, "cat": "Office", "stock": 20, "brand": "WorkSpace Pro", "thumb": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80"},
            {"name": "Bookshelf 5-Tier", "price": 199.99, "cat": "Office", "stock": 25, "brand": "OrganizePlus", "thumb": "https://images.unsplash.com/photo-1588279104182-c3ad1c9c5bf4?w=500&q=80"},
            {"name": "Filing Cabinet 2-Drawer", "price": 159.99, "cat": "Office", "stock": 22, "brand": "WorkSpace Pro", "thumb": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80"},
            # Lighting
            {"name": "Crystal Chandelier", "price": 399.99, "cat": "Lighting", "stock": 8, "brand": "Luminous", "thumb": "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&q=80"},
            {"name": "Arc Floor Lamp", "price": 249.99, "cat": "Lighting", "stock": 18, "brand": "Glow & Co", "thumb": "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500&q=80"},
            {"name": "Modern Pendant Light", "price": 179.99, "cat": "Lighting", "stock": 25, "brand": "Luminous", "thumb": "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=500&q=80"},
            {"name": "Table Lamp with USB", "price": 89.99, "cat": "Lighting", "stock": 40, "brand": "Glow & Co", "thumb": "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&q=80"},
            {"name": "Wall Sconce Set", "price": 129.99, "cat": "Lighting", "stock": 30, "brand": "Luminous", "thumb": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80"},
            # Outdoor
            {"name": "Wicker Patio Sofa Set", "price": 1099.99, "cat": "Outdoor", "stock": 8, "brand": "SunSet Living", "thumb": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80"},
            {"name": "Outdoor Dining Table", "price": 599.99, "cat": "Outdoor", "stock": 12, "brand": "Garden Elite", "thumb": "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&q=80"},
            {"name": "Adirondack Chair (Set of 2)", "price": 249.99, "cat": "Outdoor", "stock": 20, "brand": "SunSet Living", "thumb": "https://images.unsplash.com/photo-1591828018381-9bda0b94c518?w=500&q=80"},
            {"name": "Umbrella Patio 10ft", "price": 189.99, "cat": "Outdoor", "stock": 15, "brand": "ShadeMaster", "thumb": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80"},
            {"name": "Hanging Egg Chair", "price": 329.99, "cat": "Outdoor", "stock": 10, "brand": "SunSet Living", "thumb": "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80"},
        ]

        for p in products_data:
            slug = generate_slug(p["name"])
            product = Product(
                name=p["name"],
                slug=slug,
                price=p["price"],
                category_id=cat_map.get(p["cat"]),
                stock_quantity=p["stock"],
                brand=p.get("brand"),
                sku=f"FUR-{slug.upper()}",
                short_description=f"Premium {p['name']} — {p['brand']}.",
                thumbnail=p.get("thumb"),
                is_active=True,
            )
            db.add(product)

        coupons_data = [
            {"code": "WELCOME15", "description": "15% off for new customers", "discount_type": "percentage", "discount_value": 15, "max_uses": 100, "is_active": True},
            {"code": "FREEDELIVERY", "description": "$10 off order", "discount_type": "fixed", "discount_value": 10, "min_order_amount": 100, "max_uses": 50, "is_active": True},
            {"code": "HOMESALE20", "description": "20% off home collection", "discount_type": "percentage", "discount_value": 20, "max_uses": 200, "expires_at": datetime.now(timezone.utc) + timedelta(days=60), "is_active": True},
        ]
        for c in coupons_data:
            db.add(Coupon(**c))

        banners_data = [
            {"title": "Modern Living Collection", "subtitle": "Discover contemporary furniture for every room", "image_url": "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200", "position": "hero", "sort_order": 0, "is_active": True},
            {"title": "Outdoor Essentials", "subtitle": "Create your perfect outdoor space", "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200", "position": "hero", "sort_order": 1, "is_active": True},
        ]
        for b in banners_data:
            db.add(Banner(**b))

        settings_data = [
            {"key": "store_name", "value": "Furniture Store", "description": "Store display name"},
            {"key": "store_email", "value": "support@furniturestore.com", "description": "Store contact email"},
            {"key": "shipping_rate", "value": "15.00", "description": "Default shipping rate"},
            {"key": "tax_rate", "value": "0.08", "description": "Tax rate (decimal)"},
            {"key": "low_stock_threshold", "value": "5", "description": "Low stock alert threshold"},
        ]
        for s in settings_data:
            db.add(Setting(**s))

        branding = BrandingSettings(
            store_name="Furniture Store",
            store_logo=None,
            favicon=None,
            footer_logo=None,
            copyright_text="© 2026 Furniture Store. All rights reserved.",
            contact_email="support@furniturestore.com",
            contact_phone="+1 (555) 123-4567",
            contact_address="123 Design Street, Suite 100, San Francisco, CA 94105",
            social_facebook="https://facebook.com/furniturestore",
            social_twitter="https://twitter.com/furniturestore",
            social_instagram="https://instagram.com/furniturestore",
            social_youtube="https://youtube.com/@furniturestore",
            social_linkedin="https://linkedin.com/company/furniturestore",
        )
        db.add(branding)

        cms_blocks = [
            {
                "title": "About Us",
                "slug": "about-us",
                "block_type": "text",
                "content": {
                    "body": "<h2>Our Story</h2><p>Founded in 2018, Furniture Store started with a simple mission: make quality furniture accessible to everyone. What began as a small workshop in San Francisco has grown into a trusted destination for modern home furnishings. We partner with skilled artisans and sustainable manufacturers to bring you pieces that blend timeless design with everyday comfort.</p><p>Every item in our collection is hand-picked by our design team to ensure it meets our standards for quality, durability, and style. From our mid-century modern sofas to our farmhouse dining tables, we believe your home should tell your story.</p>"
                },
                "sort_order": 0,
                "is_active": True,
            },
            {
                "title": "Our Values",
                "slug": "our-values",
                "block_type": "text",
                "content": {
                    "body": "<ul><li><strong>Sustainability</strong> — We use reclaimed wood, recycled metals, and eco-friendly finishes whenever possible.</li><li><strong>Craftsmanship</strong> — Each piece is built by skilled hands, not just machines.</li><li><strong>Community</strong> — A portion of every sale supports local furniture banks and housing charities.</li><li><strong>Transparency</strong> — We share exactly where and how every product is made.</li></ul>"
                },
                "sort_order": 1,
                "is_active": True,
            },
            {
                "title": "FAQ — Shipping",
                "slug": "faq-shipping",
                "block_type": "html",
                "content": {
                    "body": "<div class=\"faq-item\"><h4>How long does delivery take?</h4><p>Standard delivery takes 5–10 business days. White-glove delivery (including assembly) takes 7–14 business days.</p></div><div class=\"faq-item\"><h4>Do you ship internationally?</h4><p>Currently we ship within the continental US and Canada. International shipping is coming soon.</p></div><div class=\"faq-item\"><h4>What is your return policy?</h4><p>Free returns within 30 days. Items must be in original condition. We arrange pickup at no cost to you.</p></div>"
                },
                "sort_order": 2,
                "is_active": True,
            },
            {
                "title": "FAQ — Assembly",
                "slug": "faq-assembly",
                "block_type": "html",
                "content": {
                    "body": "<div class=\"faq-item\"><h4>Do I need to assemble my furniture?</h4><p>Most items require some assembly. We include all tools and hardware. Our white-glove delivery option includes full assembly and setup.</p></div><div class=\"faq-item\"><h4>Can I hire someone to assemble my furniture?</h4><p>Yes! We partner with Handy and TaskRabbit. You can book a certified assembler during checkout.</p></div>"
                },
                "sort_order": 3,
                "is_active": True,
            },
            {
                "title": "Customer Testimonials",
                "slug": "testimonials",
                "block_type": "html",
                "content": {
                    "body": "<div class=\"testimonial\"><p>\"The quality exceeded my expectations. The sofa is stunning and so comfortable. Delivery was prompt and the team set everything up perfectly.\"</p><cite>— Sarah M., Austin, TX</cite></div><div class=\"testimonial\"><p>\"I was nervous buying furniture online, but the entire experience was seamless. The customer service team helped me pick the perfect dining set.\"</p><cite>— James L., Denver, CO</cite></div><div class=\"testimonial\"><p>\"Beautiful craftsmanship at a fair price. My new bedroom set has transformed my space. Highly recommend!\"</p><cite>— Priya K., Seattle, WA</cite></div>"
                },
                "sort_order": 4,
                "is_active": True,
            },
            {
                "title": "Footer — Quick Links",
                "slug": "footer-quick-links",
                "block_type": "html",
                "content": {
                    "body": "<ul><li><a href=\"/products\">Shop All</a></li><li><a href=\"/products?category=living-room\">Living Room</a></li><li><a href=\"/products?category=bedroom\">Bedroom</a></li><li><a href=\"/products?category=dining-room\">Dining Room</a></li><li><a href=\"/products?category=office\">Office</a></li></ul>"
                },
                "sort_order": 5,
                "is_active": True,
            },
            {
                "title": "Design Inspiration Banner",
                "slug": "design-inspiration",
                "block_type": "banner",
                "content": {
                    "image": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
                    "link": "/products?collection=new-arrivals",
                    "alt": "Modern living room with neutral tones and natural light"
                },
                "sort_order": 6,
                "is_active": True,
            },
            {
                "title": "Featured Categories — Sidebar",
                "slug": "featured-categories-sidebar",
                "block_type": "featured",
                "content": {
                    "categories": ["living-room", "bedroom", "dining-room", "office"],
                    "limit": 4,
                    "layout": "grid"
                },
                "sort_order": 7,
                "is_active": True,
            },
            {
                "title": "Summer Sale Announcement",
                "slug": "summer-sale-announcement",
                "block_type": "html",
                "content": {
                    "body": "<div style=\"background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:1.5rem;border-radius:0.75rem;text-align:center;\"><h3>☀️ Summer Sale — Up to 30% Off</h3><p>Free white-glove delivery on orders over $500. Use code <strong>SUMMER30</strong> at checkout.</p><p><em>Offer ends August 31st.</em></p></div>"
                },
                "sort_order": 8,
                "is_active": True,
            },
            {
                "title": "Delivery Information Bar",
                "slug": "delivery-info-bar",
                "block_type": "html",
                "content": {
                    "body": "<p>🚚 <strong>Free delivery</strong> on orders over $500 &nbsp;|&nbsp; 🔄 <strong>30-day</strong> free returns &nbsp;|&nbsp; 🛋️ <strong>White-glove</strong> assembly available</p>"
                },
                "sort_order": 9,
                "is_active": True,
            },
        ]
        for c_data in cms_blocks:
            db.add(CMSBlock(**c_data))
        db.flush()

        db.commit()
        print("Furniture database seeded successfully!")
        print("  Admin:    admin@furniturestore.com / admin123")
        print("  Staff:    staff@furniturestore.com / staff123")
        print("  Driver:   driver@furniturestore.com / driver123")
        print("  Customer: customer@example.com / customer123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
