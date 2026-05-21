from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import categories, products, product_images, cart, wishlist, addresses, checkout
from config.database import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
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


@app.get("/")
def home():
    return {"message": "Aquarium API is running"}
