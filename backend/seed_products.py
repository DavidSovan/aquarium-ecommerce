import sys
import os
import re
from sqlalchemy.orm import Session
from datetime import datetime, timezone

# Add parent directory to path to import local modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.config.database import SessionLocal, engine, Base
from backend.models.product import Product
from backend.models.category import Category

def generate_slug(name):
    slug = name.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug.strip('-')

def seed():
    db = SessionLocal()
    try:
        # Get categories to associate products
        categories = db.query(Category).all()
        cat_map = {cat.name: cat.id for cat in categories}
        
        # Define some fallback IDs if specific names don't exist
        default_cat_id = categories[0].id if categories else None
        
        freshwater_id = cat_map.get("Freshwater Fish", default_cat_id)
        saltwater_id = cat_map.get("Saltwater Fish", default_cat_id)
        plants_id = cat_map.get("Aquatic Plants", default_cat_id)
        tropical_id = cat_map.get("Tropical Fish", default_cat_id)

        products_data = [
            # Freshwater Fish
            {"name": "Neon Tetra", "price": 2.99, "cat_id": freshwater_id, "stock": 100, "brand": "Aquarium Co-Op"},
            {"name": "Guppy Assorted", "price": 4.50, "cat_id": freshwater_id, "stock": 50, "brand": "LiveAquaria"},
            {"name": "Corydoras Panda", "price": 6.99, "cat_id": freshwater_id, "stock": 30, "brand": "AquaHuna"},
            {"name": "Angelfish Marble", "price": 12.99, "cat_id": freshwater_id, "stock": 15, "brand": "LiveAquaria"},
            {"name": "Cherry Shrimp", "price": 3.99, "cat_id": freshwater_id, "stock": 200, "brand": "Shrimp Farm"},
            {"name": "Betta Splendens Male", "price": 15.00, "cat_id": freshwater_id, "stock": 10, "brand": "Local Breeder"},
            {"name": "Zebra Danio", "price": 1.99, "cat_id": freshwater_id, "stock": 150, "brand": "Aquarium Co-Op"},
            {"name": "Goldfish Fantail", "price": 8.50, "cat_id": freshwater_id, "stock": 20, "brand": "AquaHuna"},
            
            # Saltwater Fish
            {"name": "Ocellaris Clownfish", "price": 24.99, "cat_id": saltwater_id, "stock": 40, "brand": "Sea & Reef"},
            {"name": "Blue Tang", "price": 79.99, "cat_id": saltwater_id, "stock": 5, "brand": "LiveAquaria"},
            {"name": "Yellow Tang", "price": 149.99, "cat_id": saltwater_id, "stock": 3, "brand": "Biota"},
            {"name": "Royal Gramma Basslet", "price": 29.99, "cat_id": saltwater_id, "stock": 12, "brand": "LiveAquaria"},
            {"name": "Firefish Goby", "price": 19.99, "cat_id": saltwater_id, "stock": 25, "brand": "Sea & Reef"},
            {"name": "Cleaner Shrimp", "price": 34.99, "cat_id": saltwater_id, "stock": 15, "brand": "Reef Cleaners"},
            {"name": "Banggai Cardinalfish", "price": 27.50, "cat_id": saltwater_id, "stock": 10, "brand": "Biota"},
            
            # Tropical Fish
            {"name": "Discus Blue Diamond", "price": 65.00, "cat_id": tropical_id, "stock": 8, "brand": "Wattley Discus"},
            {"name": "German Blue Ram", "price": 14.99, "cat_id": tropical_id, "stock": 20, "brand": "AquaHuna"},
            {"name": "Rummy Nose Tetra", "price": 4.25, "cat_id": tropical_id, "stock": 80, "brand": "Aquarium Co-Op"},
            {"name": "Cardinal Tetra", "price": 3.75, "cat_id": tropical_id, "stock": 120, "brand": "LiveAquaria"},
            {"name": "Harlequin Rasbora", "price": 2.99, "cat_id": tropical_id, "stock": 60, "brand": "AquaHuna"},
            
            # Aquatic Plants
            {"name": "Anubias Nana", "price": 9.99, "cat_id": plants_id, "stock": 45, "brand": "Tropica"},
            {"name": "Java Fern", "price": 7.50, "cat_id": plants_id, "stock": 35, "brand": "Tropica"},
            {"name": "Amazon Sword", "price": 12.00, "cat_id": plants_id, "stock": 25, "brand": "Aquarium Co-Op"},
            {"name": "Marimo Moss Ball", "price": 14.99, "cat_id": plants_id, "stock": 50, "brand": "Java Moss"},
            {"name": "Monte Carlo", "price": 8.99, "cat_id": plants_id, "stock": 30, "brand": "Tropica"},
            {"name": "Rotala Rotundifolia", "price": 6.50, "cat_id": plants_id, "stock": 40, "brand": "Aquarium Co-Op"},
            {"name": "Ludwigia Repens", "price": 5.99, "cat_id": plants_id, "stock": 50, "brand": "LiveAquaria"},
            {"name": "Cryptocoryne Wendtii", "price": 8.25, "cat_id": plants_id, "stock": 35, "brand": "Tropica"},
            
            # Others/Mixed
            {"name": "Mystery Snail Blue", "price": 4.99, "cat_id": freshwater_id, "stock": 40, "brand": "Snail Central"},
            {"name": "African Cichlid Mix", "price": 9.99, "cat_id": freshwater_id, "stock": 30, "brand": "AquaHuna"}
        ]

        for p in products_data:
            slug = generate_slug(p["name"])
            # Check if slug exists
            existing = db.query(Product).filter(Product.slug == slug).first()
            if existing:
                continue
                
            product = Product(
                name=p["name"],
                slug=slug,
                price=p["price"],
                category_id=p["cat_id"],
                stock_quantity=p["stock"],
                brand=p.get("brand"),
                sku=f"SKU-{slug.upper()}",
                short_description=f"High quality {p['name']} for your aquarium.",
                is_active=True
            )
            db.add(product)
        
        db.commit()
        print(f"Successfully seeded {len(products_data)} products.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding products: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
