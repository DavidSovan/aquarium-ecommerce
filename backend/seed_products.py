"""Seed script - run from backend/ directory with: python seed_products.py"""
import sys
import os
import re
from datetime import datetime, timezone, timedelta

# Add backend directory to path so imports work without 'backend.' prefix
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal, engine, Base
from models.product import Product
from models.category import Category
from models.user import User
from models.coupon import Coupon
from models.banner import Banner
from models.setting import Setting
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
            email="admin@aquarium.com",
            password_hash=hash_password("admin123"),
            first_name="Admin",
            last_name="User",
            role="admin",
            is_active=True,
        )
        db.add(admin)

        staff = User(
            email="staff@aquarium.com",
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
        db.flush()

        categories_data = [
            {"name": "Freshwater Fish", "slug": "freshwater-fish", "description": "Beautiful freshwater fish for your aquarium"},
            {"name": "Saltwater Fish", "slug": "saltwater-fish", "description": "Exotic saltwater fish species"},
            {"name": "Tropical Fish", "slug": "tropical-fish", "description": "Colorful tropical fish"},
            {"name": "Aquatic Plants", "slug": "aquatic-plants", "description": "Live plants to beautify your aquarium"},
            {"name": "Aquarium Supplies", "slug": "aquarium-supplies", "description": "Filters, pumps, and accessories"},
            {"name": "Fish Food", "slug": "fish-food", "description": "Nutritional food for all fish types"},
        ]
        cat_map = {}
        for c in categories_data:
            cat = Category(**c, is_active=True)
            db.add(cat)
            db.flush()
            cat_map[c["name"]] = cat.id

        products_data = [
            {"name": "Neon Tetra", "price": 2.99, "cat": "Freshwater Fish", "stock": 100, "brand": "Aquarium Co-Op", "thumb": "https://images.unsplash.com/photo-1544551763-47a0159f92ad?w=500&q=80"},
            {"name": "Guppy Assorted", "price": 4.50, "cat": "Freshwater Fish", "stock": 50, "brand": "LiveAquaria", "thumb": "https://images.unsplash.com/photo-1623912175294-b77e8a9394be?w=500&q=80"},
            {"name": "Corydoras Panda", "price": 6.99, "cat": "Freshwater Fish", "stock": 30, "brand": "AquaHuna", "thumb": "https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?w=500&q=80"},
            {"name": "Angelfish Marble", "price": 12.99, "cat": "Freshwater Fish", "stock": 15, "brand": "LiveAquaria", "thumb": "https://images.unsplash.com/photo-1524704659698-1f6a1bb4e056?w=500&q=80"},
            {"name": "Cherry Shrimp", "price": 3.99, "cat": "Freshwater Fish", "stock": 200, "brand": "Shrimp Farm", "thumb": "https://images.unsplash.com/photo-1620025916301-443b3531b782?w=500&q=80"},
            {"name": "Betta Splendens Male", "price": 15.00, "cat": "Freshwater Fish", "stock": 10, "brand": "Local Breeder", "thumb": "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500&q=80"},
            {"name": "Zebra Danio", "price": 1.99, "cat": "Freshwater Fish", "stock": 150, "brand": "Aquarium Co-Op", "thumb": "https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?w=500&q=80"},
            {"name": "Goldfish Fantail", "price": 8.50, "cat": "Freshwater Fish", "stock": 20, "brand": "AquaHuna", "thumb": "https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=500&q=80"},
            {"name": "Ocellaris Clownfish", "price": 24.99, "cat": "Saltwater Fish", "stock": 40, "brand": "Sea & Reef", "thumb": "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&q=80"},
            {"name": "Blue Tang", "price": 79.99, "cat": "Saltwater Fish", "stock": 5, "brand": "LiveAquaria", "thumb": "https://images.unsplash.com/photo-1534591794212-fc873328a3f4?w=500&q=80"},
            {"name": "Yellow Tang", "price": 149.99, "cat": "Saltwater Fish", "stock": 3, "brand": "Biota", "thumb": "https://images.unsplash.com/photo-1544551763-47a0159f92ad?w=500&q=80"},
            {"name": "Royal Gramma Basslet", "price": 29.99, "cat": "Saltwater Fish", "stock": 12, "brand": "LiveAquaria", "thumb": "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&q=80"},
            {"name": "Firefish Goby", "price": 19.99, "cat": "Saltwater Fish", "stock": 25, "brand": "Sea & Reef", "thumb": "https://images.unsplash.com/photo-1534591794212-fc873328a3f4?w=500&q=80"},
            {"name": "Cleaner Shrimp", "price": 34.99, "cat": "Saltwater Fish", "stock": 15, "brand": "Reef Cleaners", "thumb": "https://images.unsplash.com/photo-1620025916301-443b3531b782?w=500&q=80"},
            {"name": "Banggai Cardinalfish", "price": 27.50, "cat": "Saltwater Fish", "stock": 10, "brand": "Biota", "thumb": "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&q=80"},
            {"name": "Discus Blue Diamond", "price": 65.00, "cat": "Tropical Fish", "stock": 8, "brand": "Wattley Discus", "thumb": "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=500&q=80"},
            {"name": "German Blue Ram", "price": 14.99, "cat": "Tropical Fish", "stock": 20, "brand": "AquaHuna", "thumb": "https://images.unsplash.com/photo-1524704659698-1f6a1bb4e056?w=500&q=80"},
            {"name": "Rummy Nose Tetra", "price": 4.25, "cat": "Tropical Fish", "stock": 80, "brand": "Aquarium Co-Op", "thumb": "https://images.unsplash.com/photo-1544551763-47a0159f92ad?w=500&q=80"},
            {"name": "Cardinal Tetra", "price": 3.75, "cat": "Tropical Fish", "stock": 120, "brand": "LiveAquaria", "thumb": "https://images.unsplash.com/photo-1544551763-47a0159f92ad?w=500&q=80"},
            {"name": "Harlequin Rasbora", "price": 2.99, "cat": "Tropical Fish", "stock": 60, "brand": "AquaHuna", "thumb": "https://images.unsplash.com/photo-1544551763-47a0159f92ad?w=500&q=80"},
            {"name": "Anubias Nana", "price": 9.99, "cat": "Aquatic Plants", "stock": 45, "brand": "Tropica", "thumb": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=80"},
            {"name": "Java Fern", "price": 7.50, "cat": "Aquatic Plants", "stock": 35, "brand": "Tropica", "thumb": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=80"},
            {"name": "Amazon Sword", "price": 12.00, "cat": "Aquatic Plants", "stock": 25, "brand": "Aquarium Co-Op", "thumb": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=80"},
            {"name": "Marimo Moss Ball", "price": 14.99, "cat": "Aquatic Plants", "stock": 50, "brand": "Java Moss", "thumb": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=80"},
            {"name": "Monte Carlo", "price": 8.99, "cat": "Aquatic Plants", "stock": 30, "brand": "Tropica", "thumb": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=80"},
            {"name": "Rotala Rotundifolia", "price": 6.50, "cat": "Aquatic Plants", "stock": 40, "brand": "Aquarium Co-Op", "thumb": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=80"},
            {"name": "Ludwigia Repens", "price": 5.99, "cat": "Aquatic Plants", "stock": 50, "brand": "LiveAquaria", "thumb": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=80"},
            {"name": "Cryptocoryne Wendtii", "price": 8.25, "cat": "Aquatic Plants", "stock": 35, "brand": "Tropica", "thumb": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=80"},
            {"name": "Mystery Snail Blue", "price": 4.99, "cat": "Freshwater Fish", "stock": 40, "brand": "Snail Central", "thumb": "https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?w=500&q=80"},
            {"name": "African Cichlid Mix", "price": 9.99, "cat": "Freshwater Fish", "stock": 30, "brand": "AquaHuna", "thumb": "https://images.unsplash.com/photo-1524704659698-1f6a1bb4e056?w=500&q=80"},
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
                sku=f"SKU-{slug.upper()}",
                short_description=f"High quality {p['name']} for your aquarium.",
                thumbnail=p.get("thumb"),
                is_active=True,
            )
            db.add(product)

        coupons_data = [
            {"code": "WELCOME10", "description": "10% off for new customers", "discount_type": "percentage", "discount_value": 10, "max_uses": 100, "is_active": True},
            {"code": "FREESHIP", "description": "$5 off order", "discount_type": "fixed", "discount_value": 5, "min_order_amount": 50, "max_uses": 50, "is_active": True},
            {"code": "SUMMER20", "description": "20% off summer sale", "discount_type": "percentage", "discount_value": 20, "max_uses": 200, "expires_at": datetime.now(timezone.utc) + timedelta(days=60), "is_active": True},
        ]
        for c in coupons_data:
            db.add(Coupon(**c))

        banners_data = [
            {"title": "Summer Sale", "subtitle": "Up to 20% off on all tropical fish", "image_url": "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1200", "position": "hero", "sort_order": 0, "is_active": True},
            {"title": "New Arrivals", "subtitle": "Check out our latest aquatic plants", "image_url": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=1200", "position": "hero", "sort_order": 1, "is_active": True},
        ]
        for b in banners_data:
            db.add(Banner(**b))

        settings_data = [
            {"key": "store_name", "value": "Aquarium Store", "description": "Store display name"},
            {"key": "store_email", "value": "support@aquariumstore.com", "description": "Store contact email"},
            {"key": "shipping_rate", "value": "5.00", "description": "Default shipping rate"},
            {"key": "tax_rate", "value": "0.08", "description": "Tax rate (decimal)"},
            {"key": "low_stock_threshold", "value": "5", "description": "Low stock alert threshold"},
        ]
        for s in settings_data:
            db.add(Setting(**s))

        db.commit()
        print("Database seeded successfully!")
        print("  Admin:    admin@aquarium.com / admin123")
        print("  Staff:    staff@aquarium.com / staff123")
        print("  Customer: customer@example.com / customer123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
