"""Seed script for homepage sections - run from backend/ directory with: python seed_homepage.py"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal
from models.homepage import HomepageSection

def seed_homepage():
    db = SessionLocal()
    try:
        # Clear existing homepage sections to ensure a fresh state
        db.query(HomepageSection).delete()
        db.commit()
        print("Cleared existing homepage sections.")

        sections = [
            {
                "section_type": "hero",
                "sort_order": 0,
                "is_active": True,
                "hero_title": "Summer Collection 2026",
                "hero_subtitle": "Discover the latest trends in sustainable fashion. Fresh styles for a brighter future.",
                "hero_cta_text": "Shop Now",
                "hero_cta_url": "/products?collection=summer-2026",
                "hero_bg_image": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80",
                "hero_badge_text": "New Season",
                "hero_overlay_color": "#0f172a",
                "hero_overlay_opacity": 0.4
            },
            {
                "section_type": "categories",
                "sort_order": 1,
                "is_active": True,
                "content": {
                    "title": "Shop by Category",
                    "subtitle": "Explore our curated collections across all departments.",
                    "items": [
                        {"name": "Men's Clothing", "slug": "mens-clothing", "image": "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=500&q=80"},
                        {"name": "Women's Clothing", "slug": "womens-clothing", "image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80"},
                        {"name": "Shoes", "slug": "shoes", "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"},
                        {"name": "Accessories", "slug": "accessories", "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80"}
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
                    "title": "New Arrivals",
                    "subtitle": "The most anticipated pieces of the season have arrived.",
                    "limit": 8
                }
            },
            {
                "section_type": "promo_banner",
                "sort_order": 3,
                "is_active": True,
                "hero_title": "Member Exclusive: 20% Off",
                "hero_subtitle": "Join our membership program today and get an extra 20% off your first order plus free shipping on all orders over $50.",
                "hero_cta_text": "Join Now",
                "hero_cta_url": "/auth/register",
                "hero_bg_image": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
                "hero_overlay_color": "#1e293b",
                "hero_overlay_opacity": 0.7
            },
            {
                "section_type": "newsletter",
                "sort_order": 4,
                "is_active": True,
                "content": {
                    "title": "Stay in the Loop",
                    "subtitle": "Subscribe to our newsletter to receive updates on new arrivals, special offers, and styling tips.",
                    "placeholder": "Enter your email address",
                    "button_text": "Subscribe"
                }
            }
        ]

        for s_data in sections:
            section = HomepageSection(**s_data)
            db.add(section)
        
        db.commit()
        print(f"Successfully seeded {len(sections)} homepage sections!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding homepage: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_homepage()
