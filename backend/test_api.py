from fastapi.testclient import TestClient
from sqlalchemy import text
from main import app
from config.database import Base, engine, SessionLocal
from models.category import Category
from models.product import Product

client = TestClient(app)


def setup_module(module):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        db.query(Product).delete()
        db.query(Category).delete()
        db.execute(text("SET FOREIGN_KEY_CHECKS=1"))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning: Could not clear tables: {e}")
    finally:
        db.close()


# --- Home ---

def test_read_home():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Aquarium API is running"}


# --- Products ---

def test_create_product():
    product_data = {
        "name": "Gold Fish",
        "slug": "gold-fish",
        "price": 5.0,
        "stock_quantity": 10,
        "is_active": True,
    }
    response = client.post("/products", json=product_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Gold Fish"
    assert data["slug"] == "gold-fish"
    assert data["price"] == 5.0
    assert data["stock_quantity"] == 10
    assert "id" in data


def test_create_product_with_auto_slug():
    product_data = {
        "name": "Betta Fish",
        "price": 12.0,
        "stock_quantity": 5,
    }
    response = client.post("/products", json=product_data)
    assert response.status_code == 201
    data = response.json()
    assert data["slug"] == "betta-fish"


def test_list_products():
    response = client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2
    assert len(data["items"]) >= 2
    assert "items" in data
    assert "total" in data
    assert "skip" in data
    assert "limit" in data


def test_get_product():
    # Create a product first
    product_data = {
        "name": "Neon Tetra",
        "price": 3.5,
        "stock_quantity": 20,
    }
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    response = client.get(f"/products/{product_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Neon Tetra"


def test_get_product_by_slug():
    response = client.get("/products/slug/gold-fish")
    assert response.status_code == 200
    assert response.json()["name"] == "Gold Fish"


def test_get_featured_products():
    # Create a featured product
    featured_data = {
        "name": "Featured Fish",
        "price": 25.0,
        "stock_quantity": 3,
        "is_featured": True,
    }
    client.post("/products", json=featured_data)

    response = client.get("/products/featured")
    assert response.status_code == 200
    data = response.json()
    assert any(p["name"] == "Featured Fish" for p in data)


def test_update_product():
    # Create a product
    product_data = {"name": "Update Test Fish", "price": 10.0, "stock_quantity": 7}
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    update_data = {"name": "Updated Fish", "price": 15.0}
    response = client.put(f"/products/{product_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Fish"
    assert data["price"] == 15.0


def test_delete_product():
    product_data = {"name": "Temp Fish", "price": 2.0, "stock_quantity": 1}
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    response = client.delete(f"/products/{product_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Product deleted successfully"

    response = client.get(f"/products/{product_id}")
    assert response.status_code == 404


def test_product_not_found():
    response = client.get("/products/99999")
    assert response.status_code == 404


def test_invalid_path():
    response = client.get("/invalid")
    assert response.status_code == 404


def test_update_non_existent_product():
    update_data = {"name": "Ghost Fish", "price": 5.0}
    response = client.put("/products/99999", json=update_data)
    assert response.status_code == 404


def test_delete_non_existent_product():
    response = client.delete("/products/99999")
    assert response.status_code == 404


def test_duplicate_slug():
    product_data = {
        "name": "Duplicate Slug",
        "slug": "duplicate-slug-test",
        "price": 5.0,
        "stock_quantity": 1,
    }
    client.post("/products", json=product_data)

    response = client.post("/products", json=product_data)
    assert response.status_code == 400


def test_product_search():
    response = client.get("/products", params={"search": "betta"})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert any("betta" in p["name"].lower() for p in data["items"])


def test_product_filter_by_category():
    # Create a category
    cat_data = {"name": "Test Category", "slug": "test-cat"}
    cat_resp = client.post("/categories", json=cat_data)
    cat_id = cat_resp.json()["id"]

    # Create product in that category
    product_data = {
        "name": "Categorized Fish",
        "price": 8.0,
        "stock_quantity": 5,
        "category_id": cat_id,
    }
    client.post("/products", json=product_data)

    response = client.get("/products", params={"category_id": cat_id})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] > 0
    assert all(p["category_id"] == cat_id for p in data["items"])


def test_product_price_filter():
    response = client.get("/products", params={"min_price": 10.0, "max_price": 20.0})
    assert response.status_code == 200
    data = response.json()
    for p in data["items"]:
        assert 10.0 <= p["price"] <= 20.0


def test_product_sort():
    response = client.get("/products", params={"sort_by": "price", "sort_order": "asc"})
    assert response.status_code == 200
    data = response.json()
    if len(data["items"]) > 1:
        prices = [p["price"] for p in data["items"]]
        assert prices == sorted(prices)


def test_product_pagination():
    response = client.get("/products", params={"skip": 0, "limit": 1})
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 1
    assert data["skip"] == 0
    assert data["limit"] == 1


# --- Categories ---

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
    category_data = {
        "name": "Tropical Fish",
        "slug": "tropical-fish",
        "description": "Fish from tropical waters"
    }
    create_response = client.post("/categories", json=category_data)
    category_id = create_response.json()["id"]

    response = client.get(f"/categories/{category_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Tropical Fish"


def test_update_category():
    category_data = {
        "name": "Cold Water Fish",
        "slug": "cold-water-fish"
    }
    create_response = client.post("/categories", json=category_data)
    category_id = create_response.json()["id"]

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
    category_data = {
        "name": "Temporary Category",
        "slug": "temp-category"
    }
    create_response = client.post("/categories", json=category_data)
    category_id = create_response.json()["id"]

    response = client.delete(f"/categories/{category_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Category deleted successfully"

    response = client.get(f"/categories/{category_id}")
    assert response.status_code == 404


def test_category_tree():
    response = client.get("/categories/tree")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_parent_child_relationship():
    parent_data = {
        "name": "Aquatic Plants",
        "slug": "aquatic-plants"
    }
    parent_response = client.post("/categories", json=parent_data)
    parent_id = parent_response.json()["id"]

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

    response = client.post("/categories", json=category_data)
    assert response.status_code == 400


def test_circular_reference():
    cat1_data = {"name": "Category 1", "slug": "circ-cat-1"}
    cat1_response = client.post("/categories", json=cat1_data)
    cat1_id = cat1_response.json()["id"]

    cat2_data = {"name": "Category 2", "slug": "circ-cat-2", "parent_id": cat1_id}
    cat2_response = client.post("/categories", json=cat2_data)
    cat2_id = cat2_response.json()["id"]

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
