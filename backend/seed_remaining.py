import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config.database import SessionLocal
from models.branding import BrandingSettings
from models.cms_block import CMSBlock

db = SessionLocal()
try:
    if db.query(BrandingSettings).count() == 0:
        db.add(BrandingSettings(
            store_name="Aquarium Store",
            logo_url="https://example.com/logo.png",
            favicon_url="https://example.com/favicon.ico",
            is_active=True
        ))
    
    if db.query(CMSBlock).count() == 0:
        db.add(CMSBlock(
            slug="about-us",
            title="About Us",
            block_type="text",
            content={"text": "Welcome to our store. We sell the best products."},
            is_active=True
        ))
    db.commit()
    print("Seeded remaining tables.")
except Exception as e:
    db.rollback()
    print("Error:", e)
finally:
    db.close()
