from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "Aquarium API is running"
    }

@app.get("/products")
def get_products():
    return [
        {
            "id": 1,
            "name": "Gold Fish",
            "price": 5
        },
        {
            "id": 2,
            "name": "Betta Fish",
            "price": 12
        }
    ]