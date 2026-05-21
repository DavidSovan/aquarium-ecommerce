from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
from routers import categories
from config.database import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
    yield

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(categories.router)

class Product(BaseModel):
    id: int
    name: str
    price: float

# In-memory database for products
products = [
    {"id": 1, "name": "Gold Fish", "price": 5.0},
    {"id": 2, "name": "Betta Fish", "price": 12.0}
]

@app.get("/")
def home():
    return {"message": "Aquarium API is running"}

@app.get("/products", response_model=List[Product])
def get_products():
    return products

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    for product in products:
        if product["id"] == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")

@app.post("/products", response_model=Product)
def create_product(product: Product):
    # Check if product ID already exists
    for existing_product in products:
        if existing_product["id"] == product.id:
            raise HTTPException(status_code=400, detail="Product ID already exists")

    products.append(product.model_dump())
    return product

@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, updated_product: Product):
    for index, product in enumerate(products):
        if product["id"] == product_id:
            products[index] = updated_product.model_dump()
            return updated_product

    raise HTTPException(status_code=404, detail="Product not found")

@app.delete("/products/{product_id}")
def delete_product(product_id: int):
    for index, product in enumerate(products):
        if product["id"] == product_id:
            del products[index]
            return {"message": "Product deleted successfully"}

    raise HTTPException(status_code=404, detail="Product not found")