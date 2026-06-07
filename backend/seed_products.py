"""Seed script - run from backend/ directory with: python seed_products.py"""
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
            email="admin@fashionstore.com",
            password_hash=hash_password("admin123"),
            first_name="Admin",
            last_name="User",
            role="admin",
            is_active=True,
        )
        db.add(admin)

        staff = User(
            email="staff@fashionstore.com",
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
            {"name": "Men's Clothing", "slug": "mens-clothing", "description": "Stylish apparel for men"},
            {"name": "Women's Clothing", "slug": "womens-clothing", "description": "Trendy clothing for women"},
            {"name": "Shoes", "slug": "shoes", "description": "Footwear for every occasion"},
            {"name": "Accessories", "slug": "accessories", "description": "Complete your look"},
            {"name": "Kids' Fashion", "slug": "kids-fashion", "description": "Cute and comfortable kids wear"},
            {"name": "Sportswear", "slug": "sportswear", "description": "Performance activewear"},
        ]
        cat_map = {}
        for c in categories_data:
            cat = Category(**c, is_active=True)
            db.add(cat)
            db.flush()
            cat_map[c["name"]] = cat.id

        products_data = [
            # Men's Clothing
            {"name": "Classic Oxford Shirt", "price": 49.99, "cat": "Men's Clothing", "stock": 100, "brand": "Tailored Fit", "thumb": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80"},
            {"name": "Slim Fit Chinos", "price": 59.99, "cat": "Men's Clothing", "stock": 80, "brand": "Urban Khaki", "thumb": "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&q=80"},
            {"name": "Denim Jacket", "price": 89.99, "cat": "Men's Clothing", "stock": 40, "brand": "Rugged Wear", "thumb": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80"},
            {"name": "Wool Blend Blazer", "price": 149.99, "cat": "Men's Clothing", "stock": 25, "brand": "Executive Class", "thumb": "https://images.unsplash.com/photo-1591369822096-5e36b32cd035?w=500&q=80"},
            {"name": "Cotton Crew Neck T-Shirt", "price": 24.99, "cat": "Men's Clothing", "stock": 200, "brand": "Essential Basics", "thumb": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80"},
            # Women's Clothing
            {"name": "Floral Maxi Dress", "price": 79.99, "cat": "Women's Clothing", "stock": 50, "brand": "Boho Chic", "thumb": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80"},
            {"name": "Tailored Blazer", "price": 129.99, "cat": "Women's Clothing", "stock": 35, "brand": "Sheer Elegance", "thumb": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80"},
            {"name": "Cashmere Sweater", "price": 99.99, "cat": "Women's Clothing", "stock": 45, "brand": "Luxe Knits", "thumb": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80"},
            {"name": "High-Waist Jeans", "price": 69.99, "cat": "Women's Clothing", "stock": 75, "brand": "Denim Co.", "thumb": "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500&q=80"},
            {"name": "Silk Blouse", "price": 89.99, "cat": "Women's Clothing", "stock": 40, "brand": "Silk Road", "thumb": "https://images.unsplash.com/photo-1608236415050-3e2eb1c97bb8?w=500&q=80"},
            # Shoes
            {"name": "Running Sneakers", "price": 119.99, "cat": "Shoes", "stock": 60, "brand": "AirStep", "thumb": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80"},
            {"name": "Leather Loafers", "price": 99.99, "cat": "Shoes", "stock": 40, "brand": "Gentleman's Choice", "thumb": "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&q=80"},
            {"name": "Chelsea Boots", "price": 149.99, "cat": "Shoes", "stock": 30, "brand": "Urban Boot Co.", "thumb": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&q=80"},
            {"name": "Canvas Slip-Ons", "price": 44.99, "cat": "Shoes", "stock": 90, "brand": "Casual Step", "thumb": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80"},
            {"name": "Heeled Sandals", "price": 69.99, "cat": "Shoes", "stock": 50, "brand": "Stiletto", "thumb": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80"},
            # Accessories
            {"name": "Leather Watch", "price": 199.99, "cat": "Accessories", "stock": 30, "brand": "Timeless", "thumb": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80"},
            {"name": "Aviator Sunglasses", "price": 129.99, "cat": "Accessories", "stock": 60, "brand": "Vue Optics", "thumb": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80"},
            {"name": "Silk Scarf", "price": 39.99, "cat": "Accessories", "stock": 80, "brand": "Elegance", "thumb": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&q=80"},
            {"name": "Tote Bag", "price": 89.99, "cat": "Accessories", "stock": 45, "brand": "CarryAll", "thumb": "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500&q=80"},
            {"name": "Leather Belt", "price": 49.99, "cat": "Accessories", "stock": 100, "brand": "Buckle Up", "thumb": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"},
            # Kids' Fashion
            {"name": "Graphic Tee", "price": 19.99, "cat": "Kids' Fashion", "stock": 150, "brand": "FunWear", "thumb": "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&q=80"},
            {"name": "Denim Overall", "price": 44.99, "cat": "Kids' Fashion", "stock": 55, "brand": "Tiny Trends", "thumb": "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&q=80"},
            {"name": "Puffer Jacket", "price": 59.99, "cat": "Kids' Fashion", "stock": 40, "brand": "Cozy Kids", "thumb": "https://images.unsplash.com/photo-1544923246-77307dd270b8?w=500&q=80"},
            {"name": "School Backpack", "price": 39.99, "cat": "Kids' Fashion", "stock": 80, "brand": "SmartPack", "thumb": "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500&q=80"},
            {"name": "Kid's Sneakers", "price": 49.99, "cat": "Kids' Fashion", "stock": 100, "brand": "Little Feet", "thumb": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80"},
            # Sportswear
            {"name": "Yoga Leggings", "price": 54.99, "cat": "Sportswear", "stock": 100, "brand": "FlexFit", "thumb": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80"},
            {"name": "Performance Tee", "price": 34.99, "cat": "Sportswear", "stock": 120, "brand": "SportZone", "thumb": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80"},
            {"name": "Training Shorts", "price": 29.99, "cat": "Sportswear", "stock": 90, "brand": "Active Gear", "thumb": "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80"},
            {"name": "Zip-Up Hoodie", "price": 69.99, "cat": "Sportswear", "stock": 60, "brand": "Urban Sport", "thumb": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"},
            {"name": "Sports Bra", "price": 39.99, "cat": "Sportswear", "stock": 75, "brand": "Support Plus", "thumb": "https://images.unsplash.com/photo-1591872028889-2d6c7f976262?w=500&q=80"},
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
                short_description=f"Premium {p['name']} — {p['brand']}.",
                thumbnail=p.get("thumb"),
                is_active=True,
            )
            db.add(product)

        coupons_data = [
            {"code": "WELCOME10", "description": "10% off for new customers", "discount_type": "percentage", "discount_value": 10, "max_uses": 100, "is_active": True},
            {"code": "FREESHIP", "description": "$5 off order", "discount_type": "fixed", "discount_value": 5, "min_order_amount": 50, "max_uses": 50, "is_active": True},
            {"code": "FASHION20", "description": "20% off seasonal collection", "discount_type": "percentage", "discount_value": 20, "max_uses": 200, "expires_at": datetime.now(timezone.utc) + timedelta(days=60), "is_active": True},
        ]
        for c in coupons_data:
            db.add(Coupon(**c))

        banners_data = [
            {"title": "Summer Collection", "subtitle": "Discover the latest summer styles", "image_url": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200", "position": "hero", "sort_order": 0, "is_active": True},
            {"title": "New Arrivals", "subtitle": "Shop our newest fashion arrivals", "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200", "position": "hero", "sort_order": 1, "is_active": True},
        ]
        for b in banners_data:
            db.add(Banner(**b))

        settings_data = [
            {"key": "store_name", "value": "Fashion Store", "description": "Store display name"},
            {"key": "store_email", "value": "support@fashionstore.com", "description": "Store contact email"},
            {"key": "shipping_rate", "value": "5.00", "description": "Default shipping rate"},
            {"key": "tax_rate", "value": "0.08", "description": "Tax rate (decimal)"},
            {"key": "low_stock_threshold", "value": "5", "description": "Low stock alert threshold"},
        ]
        for s in settings_data:
            db.add(Setting(**s))

        db.commit()
        print("Database seeded successfully!")
        print("  Admin:    admin@fashionstore.com / admin123")
        print("  Staff:    staff@fashionstore.com / staff123")
        print("  Customer: customer@example.com / customer123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
