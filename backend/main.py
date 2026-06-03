import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from sqlalchemy import text
from config.database import Base, engine, SessionLocal
from models.setting import Setting
from models.branding import BrandingSettings
from models.theme import ThemeSettings
from routers import categories, products, product_images, cart, wishlist, addresses, checkout, orders, inventory, auth, reviews, coupons, banners, reports, settings, customers
from routers import theme as theme_router, branding as branding_router, homepage_sections, cms_blocks, media_library
from routers import ws as ws_router
from routers import customization, telegram
from websocket.connection_manager import manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    manager.set_loop(asyncio.get_event_loop())
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")

    try:
        conn = engine.connect()
        conn.execute(text("ALTER TABLE orders ADD COLUMN is_new INTEGER DEFAULT 1"))
        conn.commit()
        conn.close()
    except Exception:
        pass

    try:
        conn = engine.connect()
        conn.execute(text("ALTER TABLE products ADD COLUMN is_customizable BOOLEAN DEFAULT FALSE"))
        conn.commit()
        conn.close()
    except Exception:
        pass

    try:
        conn = engine.connect()
        conn.execute(text("ALTER TABLE cart_items ADD COLUMN customizations JSON NULL"))
        conn.commit()
        conn.close()
    except Exception:
        pass

    try:
        conn = engine.connect()
        conn.execute(text("ALTER TABLE order_items ADD COLUMN customizations JSON NULL"))
        conn.commit()
        conn.close()
    except Exception:
        pass

    _DEFAULTS = [
        ("homepage_video_enabled", "false", "Enable background video on storefront homepage"),
        ("homepage_video_url", "", "Direct MP4 URL for homepage background video"),
    ]
    try:
        db = SessionLocal()
        try:
            for key, value, desc in _DEFAULTS:
                row = db.query(Setting).filter(Setting.key == key).first()
                if not row:
                    db.add(Setting(key=key, value=value, description=desc))

            if not db.query(BrandingSettings).first():
                db.add(BrandingSettings(store_name="Aquarium Store"))

            if not db.query(ThemeSettings).first():
                db.add(ThemeSettings(name="Default Theme", is_active=True))

            db.commit()
        finally:
            db.close()
    except Exception as e:
        print(f"Warning: Could not seed defaults: {e}")

    try:
        conn = engine.connect()
        conn.execute(text("ALTER TABLE users ADD COLUMN telegram_chat_id VARCHAR(50) NULL"))
        conn.commit()
        conn.close()
    except Exception:
        pass

    try:
        conn = engine.connect()
        conn.execute(text("ALTER TABLE users ADD COLUMN telegram_link_token VARCHAR(100) NULL"))
        conn.commit()
        conn.close()
    except Exception:
        pass

    try:
        conn = engine.connect()
        conn.execute(text("ALTER TABLE users ADD COLUMN telegram_link_token_expires_at DATETIME NULL"))
        conn.commit()
        conn.close()
    except Exception:
        pass

    try:
        conn = engine.connect()
        conn.execute(text("CREATE INDEX ix_users_telegram_link_token ON users (telegram_link_token)"))
        conn.commit()
        conn.close()
    except Exception:
        pass

    try:
        from services.telegram_service import set_webhook
        webhook_base_url = os.getenv("PUBLIC_BASE_URL", "https://your-domain.com")
        webhook_url = f"{webhook_base_url.rstrip('/')}/telegram/webhook"
        if not set_webhook(webhook_url):
            print(f"Warning: Failed to set Telegram webhook to {webhook_url}")
    except Exception as e:
        print(f"Warning: Could not set Telegram webhook: {e}")

    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(categories.router)
app.include_router(products.router)
app.include_router(product_images.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(addresses.router)
app.include_router(checkout.router)
app.include_router(orders.router)
app.include_router(inventory.router)
app.include_router(auth.router)
app.include_router(reviews.router)
app.include_router(coupons.router)
app.include_router(banners.router)
app.include_router(reports.router)
app.include_router(theme_router.public_router)
app.include_router(theme_router.router)
app.include_router(branding_router.public_router)
app.include_router(branding_router.router)
app.include_router(settings.public_router)
app.include_router(settings.homepage_router)
app.include_router(settings.router)
app.include_router(customers.router)
app.include_router(homepage_sections.router)
app.include_router(cms_blocks.public_router)
app.include_router(cms_blocks.router)
app.include_router(media_library.router)
app.include_router(ws_router.router)
app.include_router(customization.router)
app.include_router(telegram.router)


@app.get("/")
def home():
    return {"message": "Aquarium API is running"}
