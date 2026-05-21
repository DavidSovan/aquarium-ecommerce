from fastapi.testclient import TestClient
from sqlalchemy import text
from main import app, products
from config.database import Base, engine, SessionLocal
from models.category import Category

client = TestClient(app)

def setup_module(module):
    # Reset products to initial state before running tests in this module
    products.clear()
    products.extend([
        {"id": 1, "name": "Gold Fish", "price": 5.0},
        {"id": 2, "name": "Betta Fish", "price": 12.0}
    ])

    # Create database tables
    Base.metadata.create_all(bind=engine)

    # Clear any existing categories
    db = SessionLocal()
    try:
        # Disable foreign key checks to allow deletion of parent categories
        db.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        db.query(Category).delete()
        db.execute(text("SET FOREIGN_KEY_CHECKS=1"))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning: Could not clear categories: {e}")
    finally:
        db.close()

def test_read_home():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Aquarium API is running"}

def test_get_products():
    response = client.get("/products")
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_get_product():
    response = client.get("/products/1")
    assert response.status_code == 200
    assert response.json()["name"] == "Gold Fish"

def test_create_product():
    new_product = {"id": 3, "name": "Neon Tetra", "price": 3.5}
    response = client.post("/products", json=new_product)
    assert response.status_code == 200
    assert response.json() == new_product

def test_update_product():
    updated_product = {"id": 1, "name": "Gold Fish XL", "price": 7.5}
    response = client.put("/products/1", json=updated_product)
    assert response.status_code == 200
    assert response.json() == updated_product

def test_delete_product():
    # Delete product 2
    response = client.delete("/products/2")
    assert response.status_code == 200
    assert response.json() == {"message": "Product deleted successfully"}

    # Verify it's gone
    response = client.get("/products")
    product_ids = [p["id"] for p in response.json()]
    assert 2 not in product_ids

def test_product_not_found():
    response = client.get("/products/999")
    assert response.status_code == 404

def test_invalid_path():
    response = client.get("/invalid")
    assert response.status_code == 404

def test_update_non_existent_product():
    updated_product = {"id": 999, "name": "Ghost Fish", "price": 0.0}
    response = client.put("/products/999", json=updated_product)
    assert response.status_code == 404

def test_delete_non_existent_product():
    response = client.delete("/products/999")
    assert response.status_code == 404

# Category Tests
def test_create_category():
    category_data = {
        "name": "Freshwater Fish",
        "slug": "freshwater-fish",
        "description": "Fish for freshwater aquariums",
        "is_active": True
    }
    response = client.post("/categories", json=category_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Freshwater Fish"
    assert data["slug"] == "freshwater-fish"
    assert data["is_active"] == True

def test_create_category_with_auto_slug():
    category_data = {
        "name": "Saltwater Fish",
        "description": "Fish for saltwater aquariums",
        "is_active": True
    }
    response = client.post("/categories", json=category_data)
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "saltwater-fish"

def test_list_categories():
    response = client.get("/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2

def test_get_category():
    # Create a category first
    category_data = {
        "name": "Tropical Fish",
        "slug": "tropical-fish",
        "description": "Fish from tropical waters"
    }
    create_response = client.post("/categories", json=category_data)
    category_id = create_response.json()["id"]

    # Get the category
    response = client.get(f"/categories/{category_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Tropical Fish"

def test_update_category():
    # Create a category
    category_data = {
        "name": "Cold Water Fish",
        "slug": "cold-water-fish"
    }
    create_response = client.post("/categories", json=category_data)
    category_id = create_response.json()["id"]

    # Update it
    update_data = {
        "name": "Arctic Fish",
        "description": "Fish from cold waters"
    }
    response = client.put(f"/categories/{category_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Arctic Fish"
    assert data["description"] == "Fish from cold waters"

def test_delete_category():
    # Create a category
    category_data = {
        "name": "Temporary Category",
        "slug": "temp-category"
    }
    create_response = client.post("/categories", json=category_data)
    category_id = create_response.json()["id"]

    # Delete it
    response = client.delete(f"/categories/{category_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Category deleted successfully"

    # Verify it's gone
    response = client.get(f"/categories/{category_id}")
    assert response.status_code == 404

def test_category_tree():
    response = client.get("/categories/tree")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_parent_child_relationship():
    # Create parent category
    parent_data = {
        "name": "Aquatic Plants",
        "slug": "aquatic-plants"
    }
    parent_response = client.post("/categories", json=parent_data)
    parent_id = parent_response.json()["id"]

    # Create child category
    child_data = {
        "name": "Stem Plants",
        "slug": "stem-plants",
        "parent_id": parent_id
    }
    child_response = client.post("/categories", json=child_data)
    assert child_response.status_code == 200
    child_data_response = child_response.json()
    assert child_data_response["parent_id"] == parent_id

def test_duplicate_slug():
    category_data = {
        "name": "Duplicate Slug Test",
        "slug": "duplicate-test"
    }
    client.post("/categories", json=category_data)

    # Try to create with same slug
    response = client.post("/categories", json=category_data)
    assert response.status_code == 400

def test_circular_reference():
    # Create category 1
    cat1_data = {"name": "Category 1", "slug": "cat-1"}
    cat1_response = client.post("/categories", json=cat1_data)
    cat1_id = cat1_response.json()["id"]

    # Create category 2 with cat1 as parent
    cat2_data = {"name": "Category 2", "slug": "cat-2", "parent_id": cat1_id}
    cat2_response = client.post("/categories", json=cat2_data)
    cat2_id = cat2_response.json()["id"]

    # Try to set cat2 as parent of cat1 (circular reference)
    update_data = {"parent_id": cat2_id}
    response = client.put(f"/categories/{cat1_id}", json=update_data)
    assert response.status_code == 400

def test_category_not_found():
    response = client.get("/categories/999")
    assert response.status_code == 404

def test_options_categories():
    origin = "http://localhost:5173"
    response = client.options(
        "/categories",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        }
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
    assert response.headers["access-control-allow-origin"] == origin
