from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from config.database import Base, engine, SessionLocal
from models.setting import Setting
from routers import categories, products, product_images, cart, wishlist, addresses, checkout, orders, inventory, auth, reviews, coupons, banners, reports, settings, customers

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")

    # Seed homepage video setting defaults (idempotent upsert)
    _HOMEPAGE_DEFAULTS = [
        ("homepage_video_enabled", "false", "Enable background video on storefront homepage"),
        ("homepage_video_url", "", "Direct MP4 URL for homepage background video"),
    ]
    try:
        db = SessionLocal()
        try:
            for key, value, desc in _HOMEPAGE_DEFAULTS:
                row = db.query(Setting).filter(Setting.key == key).first()
                if not row:
                    db.add(Setting(key=key, value=value, description=desc))
            db.commit()
        finally:
            db.close()
    except Exception as e:
        print(f"Warning: Could not seed homepage settings: {e}")

    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(settings.public_router)
app.include_router(settings.homepage_router)
app.include_router(settings.router)
app.include_router(customers.router)


@app.get("/")
def home():
    return {"message": "Aquarium API is running"}
