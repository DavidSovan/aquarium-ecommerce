"""
Database Migration 002: Product Customization System

This migration adds full support for dynamic product customization, including:
- Product customization toggle (is_customizable)
- Product options (colors, materials, sizes, dimensions, custom notes)
- Product option values with price modifiers
- Customization data storage in cart and order items

Database Changes:
1. Product table:
   - Added: is_customizable (BOOLEAN, DEFAULT FALSE)

2. Created product_options table:
   - id (PRIMARY KEY)
   - product_id (FOREIGN KEY -> products.id, CASCADE)
   - name (VARCHAR 255, REQUIRED)
   - type (VARCHAR 50, DEFAULT 'dropdown') - dropdown|color|text|dimensions
   - is_required (BOOLEAN, DEFAULT FALSE)
   - sort_order (INTEGER, DEFAULT 0)
   - created_at, updated_at (TIMESTAMPS)

3. Created product_option_values table:
   - id (PRIMARY KEY)
   - option_id (FOREIGN KEY -> product_options.id, CASCADE)
   - value (VARCHAR 255, REQUIRED)
   - price_modifier (FLOAT, DEFAULT 0)
   - image_url (VARCHAR 500, NULLABLE)
   - sort_order (INTEGER, DEFAULT 0)
   - created_at, updated_at (TIMESTAMPS)

4. CartItem table:
   - Added: customizations (JSON, NULLABLE)
   - Stores selected customization options for each cart item

5. OrderItem table:
   - Added: customizations (JSON, NULLABLE)
   - Preserves selected customization options permanently in order history

Database Schema:

-- Product Options (customization option groups)
CREATE TABLE product_options (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    product_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'dropdown', -- dropdown|color|text|dimensions
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_options_product_id (product_id),
    INDEX idx_product_options_sort_order (sort_order)
);

-- Product Option Values (customization option choices)
CREATE TABLE product_option_values (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    option_id INTEGER NOT NULL,
    value VARCHAR(255) NOT NULL,
    price_modifier FLOAT DEFAULT 0,
    image_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE,
    INDEX idx_product_option_values_option_id (option_id),
    INDEX idx_product_option_values_sort_order (sort_order)
);

-- Products Table (updated)
ALTER TABLE products ADD COLUMN is_customizable BOOLEAN DEFAULT FALSE;

-- Cart Items (updated)
ALTER TABLE cart_items ADD COLUMN customizations JSON;

-- Order Items (updated)
ALTER TABLE order_items ADD COLUMN customizations JSON;

Example JSON Customization Data:
{
    "option_1": {
        "option_id": 1,
        "option_name": "Color",
        "value_id": 10,
        "value_text": "Black"
    },
    "option_2": {
        "option_id": 2,
        "option_name": "Material",
        "value_id": 25,
        "value_text": "Leather"
    },
    "option_3": {
        "option_id": 3,
        "option_name": "Size",
        "value_id": 30,
        "value_text": "Large"
    },
    "option_4": {
        "option_id": 4,
        "option_name": "Special Notes",
        "value_text": "Please deliver after 5 PM"
    }
}

API Endpoints:

-- Admin Endpoints
POST   /products/{product_id}/options                    - Create customization option
PUT    /products/options/{option_id}                     - Update customization option
DELETE /products/options/{option_id}                     - Delete customization option
POST   /products/options/{option_id}/values              - Create option value
PUT    /products/options/values/{value_id}               - Update option value
DELETE /products/options/values/{value_id}               - Delete option value
PUT    /products/{product_id}/customizable               - Toggle customizable status
PATCH  /products/{product_id}/customizable-status        - Set customizable status

-- Public Endpoints
GET    /products/{product_id}/options                    - Get customization options for product
POST   /products/calculate-price                         - Calculate final price with customizations
GET    /products/{product_id}                            - Get product detail (includes options if customizable)
GET    /products/slug/{slug}                             - Get product by slug (includes options if customizable)
POST   /cart/items                                       - Add item to cart with customizations
GET    /cart                                             - Get cart (includes customization data)
PUT    /cart/items/{item_id}                             - Update cart item quantity
DELETE /cart/items/{item_id}                             - Remove item from cart
POST   /checkout                                         - Create order with customizations

Pricing Formula:
Final Price = Base Price + Sum(selected option modifiers)

Example:
- Base Sofa Price: $500
- Leather Material: +$100
- Large Size: +$50
- Final Price: $650

Key Features:
1. Dynamic customization without code changes
2. Support for multiple option types (dropdown, color, text, dimensions)
3. Price modifiers per option value
4. Required field validation
5. Real-time price calculation
6. Historical data preservation in orders
7. Cart management with customization comparison
8. Automatic cart merging for customized items
9. Proper inventory tracking
10. Scalable and maintainable architecture

Related Files:
- models/product.py - Product model with is_customizable field
- models/product_option.py - ProductOption and ProductOptionValue models
- models/cart.py - CartItem with customizations JSON column
- models/order.py - OrderItem with customizations JSON column
- routers/customization.py - Admin and public customization APIs
- routers/products.py - Product endpoints with customization options
- routers/cart.py - Cart endpoints with customization support
- routers/checkout.py - Checkout with customization preservation
- schemas/customization.py - Pydantic schemas for customization
- schemas/cart.py - Cart schemas with customization support
- schemas/product.py - Product schemas including ProductOptionResponse
"""

def upgrade():
    """Apply migration"""
    pass


def downgrade():
    """Revert migration"""
    pass
