"""
Migration script for the Dynamic UI Management System.

Creates tables:
- theme_settings
- branding_settings
- homepage_sections
- cms_blocks
- media_library

Run: python -m backend.migrations.001_create_ui_system
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.config.database import engine, Base
from backend.models.theme import ThemeSettings
from backend.models.branding import BrandingSettings
from backend.models.homepage import HomepageSection
from backend.models.cms_block import CMSBlock
from backend.models.media import MediaLibrary


def migrate():
    print("Creating UI system tables...")
    Base.metadata.create_all(bind=engine, tables=[
        ThemeSettings.__table__,
        BrandingSettings.__table__,
        HomepageSection.__table__,
        CMSBlock.__table__,
        MediaLibrary.__table__,
    ])
    print("Done! Tables created successfully.")


def rollback():
    print("Dropping UI system tables...")
    ThemeSettings.__table__.drop(bind=engine, checkfirst=True)
    BrandingSettings.__table__.drop(bind=engine, checkfirst=True)
    HomepageSection.__table__.drop(bind=engine, checkfirst=True)
    CMSBlock.__table__.drop(bind=engine, checkfirst=True)
    MediaLibrary.__table__.drop(bind=engine, checkfirst=True)
    print("Done! Tables dropped.")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="UI System Migration")
    parser.add_argument("--rollback", action="store_true", help="Drop tables instead of creating")
    args = parser.parse_args()

    if args.rollback:
        rollback()
    else:
        migrate()
