from fastapi.testclient import TestClient
from sqlalchemy import text
from main import app
from config.database import Base, engine, SessionLocal
from models.category import Category
from models.product import Product
from models.product_image import ProductImage
from models.cart import Cart, CartItem

client = TestClient(app)


def setup_module(module):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        db.query(CartItem).delete()
        db.query(Cart).delete()
        db.query(ProductImage).delete()
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


# --- Product Images ---

def test_upload_image():
    product_data = {"name": "Image Test Fish", "price": 10.0, "stock_quantity": 5}
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    image_data = {"image_url": "https://example.com/fish1.jpg"}
    response = client.post(f"/products/{product_id}/images", json=image_data)
    assert response.status_code == 201
    data = response.json()
    assert data["image_url"] == "https://example.com/fish1.jpg"
    assert data["product_id"] == product_id
    assert data["sort_order"] == 0
    assert "id" in data


def test_upload_multiple_images():
    product_data = {"name": "Multi Image Fish", "price": 15.0, "stock_quantity": 3}
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    img1 = client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/img1.jpg"}).json()
    img2 = client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/img2.jpg"}).json()
    img3 = client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/img3.jpg"}).json()

    assert img1["sort_order"] == 0
    assert img2["sort_order"] == 1
    assert img3["sort_order"] == 2


def test_get_product_images():
    product_data = {"name": "Gallery Fish", "price": 20.0, "stock_quantity": 4}
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/g1.jpg"})
    client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/g2.jpg"})

    response = client.get(f"/products/{product_id}/images")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_upload_image_to_nonexistent_product():
    response = client.post("/products/99999/images", json={"image_url": "https://example.com/nope.jpg"})
    assert response.status_code == 404


def test_delete_image():
    product_data = {"name": "Delete Img Fish", "price": 12.0, "stock_quantity": 2}
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    img = client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/del.jpg"}).json()
    img_id = img["id"]

    response = client.delete(f"/products/images/{img_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Image deleted successfully"

    response = client.get(f"/products/{product_id}/images")
    assert len(response.json()) == 0


def test_delete_nonexistent_image():
    response = client.delete("/products/images/99999")
    assert response.status_code == 404


def test_reorder_images():
    product_data = {"name": "Reorder Fish", "price": 18.0, "stock_quantity": 6}
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    img1 = client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/r1.jpg"}).json()
    img2 = client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/r2.jpg"}).json()
    img3 = client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/r3.jpg"}).json()

    response = client.put("/products/images/reorder", json={
        "items": [
            {"id": img1["id"], "sort_order": 2},
            {"id": img2["id"], "sort_order": 0},
            {"id": img3["id"], "sort_order": 1},
        ]
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Images reordered successfully"

    images = client.get(f"/products/{product_id}/images").json()
    assert images[0]["id"] == img2["id"]
    assert images[1]["id"] == img3["id"]
    assert images[2]["id"] == img1["id"]


def test_product_detail_includes_images():
    product_data = {"name": "Detail Image Fish", "price": 22.0, "stock_quantity": 7}
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/d1.jpg"})
    client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/d2.jpg"})

    response = client.get(f"/products/{product_id}")
    assert response.status_code == 200
    data = response.json()
    assert "images" in data
    assert len(data["images"]) == 2
    assert data["images"][0]["image_url"] == "https://example.com/d1.jpg"


def test_set_thumbnail_from_images():
    product_data = {"name": "Thumbnail Fish", "price": 25.0, "stock_quantity": 8}
    create_resp = client.post("/products", json=product_data)
    product_id = create_resp.json()["id"]

    img = client.post(f"/products/{product_id}/images", json={"image_url": "https://example.com/thumb.jpg"}).json()

    update_data = {"thumbnail": img["image_url"]}
    response = client.put(f"/products/{product_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["thumbnail"] == "https://example.com/thumb.jpg"


# --- Cart ---

def test_add_to_cart():
    product_data = {"name": "Cart Fish", "price": 10.0, "stock_quantity": 5}
    prod = client.post("/products", json=product_data).json()
    product_id = prod["id"]

    response = client.post("/cart/items", json={"product_id": product_id, "quantity": 2})
    assert response.status_code == 201
    data = response.json()
    assert data["total_items"] == 2
    assert len(data["items"]) == 1
    assert data["items"][0]["product_id"] == product_id
    assert data["items"][0]["quantity"] == 2
    assert data["items"][0]["unit_price"] == 10.0
    assert data["items"][0]["total_price"] == 20.0
    assert len(data["id"]) == 36  # UUID length
    cart_id = data["id"]

    # Clean up
    client.delete("/cart/clear", params={"cart_id": cart_id})


def test_add_to_existing_cart():
    product_data = {"name": "Cart Fish 2", "price": 15.0, "stock_quantity": 10}
    prod = client.post("/products", json=product_data).json()
    product_id = prod["id"]

    cart = client.post("/cart/items", json={"product_id": product_id, "quantity": 1}).json()
    cart_id = cart["id"]

    response = client.post("/cart/items", json={"cart_id": cart_id, "product_id": product_id, "quantity": 2})
    assert response.status_code == 201
    data = response.json()
    assert data["id"] == cart_id
    assert data["items"][0]["quantity"] == 3  # 1 + 2

    client.delete("/cart/clear", params={"cart_id": cart_id})


def test_add_multiple_products_to_cart():
    p1 = client.post("/products", json={"name": "P1", "price": 5.0, "stock_quantity": 10}).json()
    p2 = client.post("/products", json={"name": "P2", "price": 8.0, "stock_quantity": 10}).json()

    cart = client.post("/cart/items", json={"product_id": p1["id"], "quantity": 2}).json()
    cart_id = cart["id"]

    client.post("/cart/items", json={"cart_id": cart_id, "product_id": p2["id"], "quantity": 3})

    response = client.get("/cart", params={"cart_id": cart_id})
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] == 5
    assert len(data["items"]) == 2
    assert abs(data["subtotal"] - (2 * 5.0 + 3 * 8.0)) < 0.01

    client.delete("/cart/clear", params={"cart_id": cart_id})


def test_add_to_cart_insufficient_stock():
    product_data = {"name": "Low Stock Fish", "price": 20.0, "stock_quantity": 1}
    prod = client.post("/products", json=product_data).json()

    response = client.post("/cart/items", json={"product_id": prod["id"], "quantity": 5})
    assert response.status_code == 400
    assert "stock" in response.json()["detail"].lower()


def test_add_nonexistent_product_to_cart():
    response = client.post("/cart/items", json={"product_id": 99999, "quantity": 1})
    assert response.status_code == 404


def test_get_nonexistent_cart():
    response = client.get("/cart", params={"cart_id": "nonexistent-uuid"})
    assert response.status_code == 404


def test_update_cart_item_quantity():
    p = client.post("/products", json={"name": "Update Cart Fish", "price": 12.0, "stock_quantity": 10}).json()
    cart = client.post("/cart/items", json={"product_id": p["id"], "quantity": 1}).json()
    cart_id = cart["id"]
    item_id = cart["items"][0]["id"]

    response = client.put(f"/cart/items/{item_id}", json={"cart_id": cart_id, "quantity": 4})
    assert response.status_code == 200
    data = response.json()
    assert data["items"][0]["quantity"] == 4
    assert data["total_items"] == 4

    client.delete("/cart/clear", params={"cart_id": cart_id})


def test_update_nonexistent_cart_item():
    response = client.put("/cart/items/99999", json={"cart_id": "some-uuid", "quantity": 2})
    assert response.status_code == 404


def test_remove_cart_item():
    p = client.post("/products", json={"name": "Remove Cart Fish", "price": 7.0, "stock_quantity": 5}).json()
    cart = client.post("/cart/items", json={"product_id": p["id"], "quantity": 3}).json()
    cart_id = cart["id"]
    item_id = cart["items"][0]["id"]

    response = client.delete(f"/cart/items/{item_id}", params={"cart_id": cart_id})
    assert response.status_code == 200
    assert len(response.json()["items"]) == 0
    assert response.json()["total_items"] == 0

    client.delete("/cart/clear", params={"cart_id": cart_id})


def test_clear_cart():
    p = client.post("/products", json={"name": "Clear Cart Fish", "price": 9.0, "stock_quantity": 5}).json()
    cart = client.post("/cart/items", json={"product_id": p["id"], "quantity": 2}).json()
    cart_id = cart["id"]

    response = client.delete("/cart/clear", params={"cart_id": cart_id})
    assert response.status_code == 200
    assert len(response.json()["items"]) == 0
    assert response.json()["total_items"] == 0
    assert response.json()["subtotal"] == 0.0


def test_cart_with_discount_price():
    product_data = {"name": "Discounted Cart Fish", "price": 50.0, "discount_price": 40.0, "stock_quantity": 5}
    prod = client.post("/products", json=product_data).json()

    cart = client.post("/cart/items", json={"product_id": prod["id"], "quantity": 2}).json()
    cart_id = cart["id"]

    assert cart["items"][0]["unit_price"] == 40.0
    assert cart["items"][0]["total_price"] == 80.0
    assert abs(cart["subtotal"] - 80.0) < 0.01

    client.delete("/cart/clear", params={"cart_id": cart_id})


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
