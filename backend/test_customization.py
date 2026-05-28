"""Validation of the Product Customization system."""
from fastapi.testclient import TestClient
from sqlalchemy import text
from main import app
from config.database import Base, engine, SessionLocal
from models.category import Category
from models.product import Product
from models.cart import Cart, CartItem
from models.order import Order, OrderItem
from models.product_option import ProductOption, ProductOptionValue
from models.user import User
from models.address import Address
import uuid

client = TestClient(app)


def setup_module():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS=0"))
        for tbl in [OrderItem, Order, Address, CartItem, Cart, ProductOptionValue, ProductOption, Product, Category, User]:
            db.query(tbl).delete()
        db.execute(text("SET FOREIGN_KEY_CHECKS=1"))
        db.commit()

        admin = User(
            id=str(uuid.uuid4()),
            email="admin@test.com",
            password_hash="not-checked-in-tests",
            first_name="Admin",
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()

        from dependencies.auth import create_access_token
        token = create_access_token({"sub": admin.id, "role": "admin"})
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

    return token


ADMIN_TOKEN = setup_module()
HEADERS = {"Authorization": f"Bearer {ADMIN_TOKEN}"}


def test_1_create_customizable_product():
    resp = client.post("/products", json={
        "name": "Customizable Sofa",
        "price": 500.0,
        "stock_quantity": 10,
        "is_customizable": True,
    }, headers=HEADERS)
    assert resp.status_code == 201, f"Expected 201, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert data.get("is_customizable") == True, f"is_customizable not True in response: {data}"
    print(f"  [PASS] Created customizable product. ID={data['id']}")
    return data["id"]


def test_2_create_non_customizable_product():
    resp = client.post("/products", json={
        "name": "Plain Chair",
        "price": 100.0,
        "stock_quantity": 5,
    }, headers=HEADERS)
    assert resp.status_code == 201
    data = resp.json()
    assert data["is_customizable"] == False
    print(f"  [PASS] Created non-customizable product. ID={data['id']}")
    return data["id"]


def test_3_create_options(product_id):
    resp = client.post(f"/products/{product_id}/options", json={
        "name": "Material",
        "type": "dropdown",
        "is_required": True,
        "sort_order": 0,
        "values": [
            {"value": "Fabric", "price_modifier": 0},
            {"value": "Leather", "price_modifier": 100, "image_url": "https://example.com/leather.jpg"},
            {"value": "Velvet", "price_modifier": 75},
        ],
    }, headers=HEADERS)
    assert resp.status_code == 201
    opt = resp.json()
    assert len(opt["values"]) == 3
    print(f"  [PASS] Created 'Material' option (ID={opt['id']}) with 3 values")
    return opt


def test_4_create_size_option(product_id):
    resp = client.post(f"/products/{product_id}/options", json={
        "name": "Size",
        "type": "dimensions",
        "is_required": True,
        "sort_order": 1,
        "values": [
            {"value": "Small", "price_modifier": 0},
            {"value": "Large", "price_modifier": 50},
        ],
    }, headers=HEADERS)
    assert resp.status_code == 201
    opt = resp.json()
    print(f"  [PASS] Created 'Size' option (ID={opt['id']}) with 2 values")
    return opt


def test_5_create_text_option(product_id):
    resp = client.post(f"/products/{product_id}/options", json={
        "name": "Special Requests",
        "type": "text",
        "is_required": False,
        "sort_order": 2,
        "values": [],
    }, headers=HEADERS)
    assert resp.status_code == 201
    print(f"  [PASS] Created 'Special Requests' text option")
    return resp.json()


def test_6_product_detail_includes_options(product_id):
    resp = client.get(f"/products/{product_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_customizable"] == True
    assert len(data["options"]) == 3
    print(f"  [PASS] Product detail includes {len(data['options'])} options")


def test_7_non_customizable_has_no_options(plain_id):
    resp = client.get(f"/products/{plain_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_customizable"] == False
    assert len(data.get("options", [])) == 0
    print(f"  [PASS] Non-customizable product has no options")


def test_8_add_to_cart_with_customizations(product_id, material_option, size_option):
    leather_id = material_option["values"][1]["id"]
    large_id = size_option["values"][1]["id"]

    resp = client.post("/cart/items", json={
        "product_id": product_id,
        "quantity": 2,
        "customizations": [
            {"option_id": material_option["id"], "value_id": leather_id},
            {"option_id": size_option["id"], "value_id": large_id},
        ],
    })
    assert resp.status_code == 201
    cart = resp.json()
    item = cart["items"][0]

    expected = 500 + 100 + 50  # 650
    assert item["unit_price"] == expected, f"Expected {expected}, got {item['unit_price']}"
    assert item["total_price"] == expected * 2
    assert len(item["customizations"]) == 2
    print(f"  [PASS] Cart: ${item['unit_price']}/unit, ${item['total_price']} total with {len(item['customizations'])} customizations")
    return cart["id"]


def test_9_reject_customizations_for_non_customizable(plain_id):
    resp = client.post("/cart/items", json={
        "product_id": plain_id,
        "quantity": 1,
        "customizations": [{"option_id": 999, "value_id": 999}],
    })
    assert resp.status_code == 400
    print(f"  [PASS] Non-customizable product rejects customizations")


def test_10_validate_required_options(product_id):
    resp = client.post("/cart/items", json={
        "product_id": product_id,
        "quantity": 1,
        "customizations": [],
    })
    assert resp.status_code == 400
    assert "required" in resp.json()["detail"].lower()
    print(f"  [PASS] Required option validation works")


def test_11_checkout_preserves_customizations(cart_id, material_option, size_option):
    addr_resp = client.post("/addresses", json={
        "user_id": "custom-test-user",
        "full_name": "Test User",
        "phone": "+1",
        "country": "US",
        "city": "City",
        "address_line": "123 St",
    }, headers=HEADERS)
    assert addr_resp.status_code == 201
    addr_id = addr_resp.json()["id"]

    order_resp = client.post("/checkout", json={
        "cart_id": cart_id,
        "user_id": "custom-test-user",
        "shipping_address_id": addr_id,
    }, headers=HEADERS)
    assert order_resp.status_code == 200, f"Checkout error: {order_resp.text}"
    order = order_resp.json()
    cust_item = order["items"][0]
    assert cust_item["customizations"] is not None, f"Customizations not saved: {order}"
    assert len(cust_item["customizations"]) == 2
    assert cust_item["unit_price"] == 650.0
    print(f"  [PASS] Order #{order['order_number']}: price=${cust_item['unit_price']}, customizations preserved")
    return order


def test_12_update_option(material_option):
    resp = client.put(f"/products/options/{material_option['id']}", json={
        "name": "Updated Material",
        "is_required": False,
    }, headers=HEADERS)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Material"
    print(f"  [PASS] Option update works")


def test_13_toggle_customizable(product_id):
    resp = client.put(f"/products/{product_id}/customizable", headers=HEADERS)
    assert resp.status_code == 200
    assert resp.json()["is_customizable"] == False

    resp = client.put(f"/products/{product_id}/customizable", headers=HEADERS)
    assert resp.json()["is_customizable"] == True
    print(f"  [PASS] Toggle customizable works")


def test_14_delete_option_value(material_option):
    val_id = material_option["values"][1]["id"]
    resp = client.delete(f"/products/options/values/{val_id}", headers=HEADERS)
    assert resp.status_code == 200
    print(f"  [PASS] Delete option value works")


def test_15_delete_option(material_option):
    resp = client.delete(f"/products/options/{material_option['id']}", headers=HEADERS)
    assert resp.status_code == 200
    print(f"  [PASS] Delete option works")


def test_16_same_product_different_customizations_separate_items(product_id, size_option):
    small_id = size_option["values"][0]["id"]
    large_id = size_option["values"][1]["id"]

    # Re-create a material option
    mat_resp = client.post(f"/products/{product_id}/options", json={
        "name": "Material", "type": "dropdown", "is_required": True, "values": [
            {"value": "Fabric", "price_modifier": 0},
            {"value": "Leather", "price_modifier": 100},
        ],
    }, headers=HEADERS)
    mat = mat_resp.json()
    fabric_id = mat["values"][0]["id"]
    leather_id = mat["values"][1]["id"]

    # Create a new cart and add same product with different customizations
    cart_resp = client.post("/cart/items", json={
        "product_id": product_id, "quantity": 1,
        "customizations": [{"option_id": mat["id"], "value_id": fabric_id}, {"option_id": size_option["id"], "value_id": small_id}],
    })
    cart_id = cart_resp.json()["id"]

    client.post("/cart/items", json={
        "cart_id": cart_id, "product_id": product_id, "quantity": 1,
        "customizations": [{"option_id": mat["id"], "value_id": leather_id}, {"option_id": size_option["id"], "value_id": large_id}],
    })

    cart = client.get("/cart", params={"cart_id": cart_id}).json()
    assert len(cart["items"]) == 2, f"Expected 2 separate items, got {len(cart['items'])}"
    print(f"  [PASS] Same product with different customizations = {len(cart['items'])} separate cart items")

    # Add same customizations again - should merge
    client.post("/cart/items", json={
        "cart_id": cart_id, "product_id": product_id, "quantity": 2,
        "customizations": [{"option_id": mat["id"], "value_id": fabric_id}, {"option_id": size_option["id"], "value_id": small_id}],
    })
    cart = client.get("/cart", params={"cart_id": cart_id}).json()
    fabric_item = [i for i in cart["items"] if i["unit_price"] == 500.0][0]
    assert fabric_item["quantity"] == 3, f"Expected merged qty 3, got {fabric_item['quantity']}"
    print(f"  [PASS] Same customizations merge correctly (qty={fabric_item['quantity']})")


if __name__ == "__main__":
    print("Testing Product Customization System...\n")

    pid = test_1_create_customizable_product()
    plain = test_2_create_non_customizable_product()
    mat_opt = test_3_create_options(pid)
    size_opt = test_4_create_size_option(pid)
    test_5_create_text_option(pid)
    test_6_product_detail_includes_options(pid)
    test_7_non_customizable_has_no_options(plain)
    cart_id = test_8_add_to_cart_with_customizations(pid, mat_opt, size_opt)
    test_9_reject_customizations_for_non_customizable(plain)
    test_10_validate_required_options(pid)
    test_11_checkout_preserves_customizations(cart_id, mat_opt, size_opt)
    test_12_update_option(mat_opt)
    test_13_toggle_customizable(pid)
    test_14_delete_option_value(mat_opt)
    test_15_delete_option(mat_opt)
    test_16_same_product_different_customizations_separate_items(pid, size_opt)

    print("\n=== ALL CUSTOMIZATION TESTS PASSED ===")
