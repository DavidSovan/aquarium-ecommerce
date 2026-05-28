# Product Customization System - API Reference Guide

## Quick Reference

### Base URL
```
/products
/cart
/checkout
```

### Authentication
- Admin endpoints: Require `admin` or `staff` role
- Public endpoints: Open to all users
- Customization data endpoints: `calculate-price` available to all

---

## Admin API Endpoints

### Customization Management

#### Toggle Product Customization
**Enable/disable customizations for a product**

```http
PUT /products/{product_id}/customizable
Authorization: Bearer {token}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| product_id | integer (path) | Product ID |

**Response (200 OK):**
```json
{
  "is_customizable": true
}
```

**Errors:**
- `404`: Product not found

---

#### Set Customization Status
**Directly set customization status to true or false**

```http
PATCH /products/{product_id}/customizable-status?status=true
Authorization: Bearer {token}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| product_id | integer (path) | Product ID |
| status | boolean (query) | true or false |

**Response (200 OK):**
```json
{
  "is_customizable": true
}
```

---

#### Create Customization Option
**Create a new customization option group**

```http
POST /products/{product_id}/options
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string",
  "type": "dropdown|color|text|dimensions",
  "is_required": boolean,
  "sort_order": integer,
  "values": [
    {
      "value": "string",
      "price_modifier": number,
      "image_url": "string (optional)",
      "sort_order": integer
    }
  ]
}
```

**Request Schema:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | ✅ | Max 255 chars |
| type | enum | ✅ | dropdown, color, text, dimensions |
| is_required | boolean | ✅ | Default: false |
| sort_order | integer | ✅ | Default: 0 |
| values | array | ❌ | Option values to create with option |

**Response (201 Created):**
```json
{
  "id": 1,
  "product_id": 5,
  "name": "Color",
  "type": "dropdown",
  "is_required": true,
  "sort_order": 0,
  "values": [
    {
      "id": 10,
      "option_id": 1,
      "value": "Black",
      "price_modifier": 0.0,
      "image_url": null,
      "sort_order": 0
    }
  ],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Errors:**
- `404`: Product not found
- `400`: Invalid data

---

#### Update Customization Option
**Modify an existing customization option**

```http
PUT /products/options/{option_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "string (optional)",
  "type": "enum (optional)",
  "is_required": boolean (optional),
  "sort_order": integer (optional)
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "product_id": 5,
  "name": "Color",
  "type": "dropdown",
  "is_required": true,
  "sort_order": 0,
  "values": [...],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

---

#### Delete Customization Option
**Remove a customization option and all its values**

```http
DELETE /products/options/{option_id}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Option deleted successfully"
}
```

**Errors:**
- `404`: Option not found

---

#### Create Option Value
**Add a value to an existing customization option**

```http
POST /products/options/{option_id}/values
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "string",
  "price_modifier": number,
  "image_url": "string (optional)",
  "sort_order": integer
}
```

**Request Schema:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| value | string | ✅ | Max 255 chars |
| price_modifier | number | ✅ | Default: 0, can be negative |
| image_url | string | ❌ | URL to preview image |
| sort_order | integer | ✅ | Display order |

**Response (201 Created):**
```json
{
  "id": 10,
  "option_id": 1,
  "value": "Black",
  "price_modifier": 0.0,
  "image_url": null,
  "sort_order": 0
}
```

---

#### Update Option Value
**Modify an existing option value**

```http
PUT /products/options/values/{value_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "string (optional)",
  "price_modifier": number (optional),
  "image_url": "string (optional)",
  "sort_order": integer (optional)
}
```

**Response (200 OK):**
```json
{
  "id": 10,
  "option_id": 1,
  "value": "Black",
  "price_modifier": 0.0,
  "image_url": null,
  "sort_order": 0
}
```

---

#### Delete Option Value
**Remove a value from an option**

```http
DELETE /products/options/values/{value_id}
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "Option value deleted successfully"
}
```

---

## Public/Storefront API Endpoints

#### Get Product Customization Options
**Retrieve all customization options for a product**

```http
GET /products/{product_id}/options
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "product_id": 5,
    "name": "Color",
    "type": "dropdown",
    "is_required": true,
    "sort_order": 0,
    "values": [
      {
        "id": 10,
        "option_id": 1,
        "value": "Black",
        "price_modifier": 0.0,
        "image_url": "https://cdn.example.com/black.jpg",
        "sort_order": 0
      },
      {
        "id": 11,
        "option_id": 1,
        "value": "White",
        "price_modifier": 50.0,
        "image_url": "https://cdn.example.com/white.jpg",
        "sort_order": 1
      }
    ],
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]
```

**Returns empty array if product is not customizable**

---

#### Get Product Detail (with Options)
**Retrieve full product details including customization options**

```http
GET /products/{product_id}
GET /products/slug/{slug}
```

**Response (200 OK):**
```json
{
  "id": 5,
  "category_id": 1,
  "name": "Modern Sofa",
  "slug": "modern-sofa",
  "sku": "SOFA-001",
  "short_description": "A beautiful modern sofa",
  "description": "Detailed description...",
  "price": 500.0,
  "discount_price": null,
  "stock_quantity": 10,
  "thumbnail": "https://cdn.example.com/sofa.jpg",
  "brand": "FurnitureCo",
  "weight": 50.0,
  "length": 200.0,
  "width": 90.0,
  "height": 80.0,
  "is_featured": true,
  "is_active": true,
  "is_customizable": true,
  "created_at": "2025-01-01T12:00:00Z",
  "updated_at": "2025-01-15T10:30:00Z",
  "category": {
    "id": 1,
    "name": "Sofas",
    "slug": "sofas"
  },
  "images": [
    {
      "id": 1,
      "image_url": "https://cdn.example.com/sofa-1.jpg",
      "sort_order": 0
    }
  ],
  "options": [
    {
      "id": 1,
      "product_id": 5,
      "name": "Color",
      "type": "dropdown",
      "is_required": true,
      "sort_order": 0,
      "values": [...]
    }
  ]
}
```

---

#### Calculate Price with Customizations
**Calculate final price based on selected customization options**

```http
POST /products/calculate-price
Content-Type: application/json

{
  "product_id": 5,
  "customizations": [
    {
      "option_id": 1,
      "value_id": 10
    },
    {
      "option_id": 2,
      "value_id": 25
    }
  ]
}
```

**Request Schema:**
```json
{
  "product_id": "integer - Product ID",
  "customizations": [
    {
      "option_id": "integer - Option ID",
      "value_id": "integer (optional) - Option value ID"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "base_price": 500.0,
  "modifiers_total": 150.0,
  "final_price": 650.0,
  "breakdown": {
    "Color": 0.0,
    "Material": 100.0,
    "Size": 50.0
  }
}
```

**Errors:**
- `404`: Product not found
- `400`: Invalid customization data

---

#### Add Item to Cart with Customizations
**Add a product to cart with customization selections**

```http
POST /cart/items
Content-Type: application/json

{
  "product_id": 5,
  "quantity": 1,
  "cart_id": "550e8400-e29b-41d4-a716-446655440000",
  "customizations": [
    {
      "option_id": 1,
      "value_id": 10
    },
    {
      "option_id": 2,
      "value_id": 25
    },
    {
      "option_id": 4,
      "value_text": "Special delivery instructions"
    }
  ]
}
```

**Request Schema:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| product_id | integer | ✅ | Product to add |
| quantity | integer | ✅ | Items to add |
| cart_id | string | ✅ | UUID of cart |
| customizations | array | ❌ | Customization selections |

**Customization Format:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| option_id | integer | ✅ | Option ID |
| value_id | integer | ❌ | For dropdown/color/dimensions |
| value_text | string | ❌ | For text options |

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "id": 42,
      "product_id": 5,
      "product": {
        "id": 5,
        "name": "Modern Sofa",
        "slug": "modern-sofa",
        "price": 500.0,
        "discount_price": null,
        "thumbnail": "https://cdn.example.com/sofa.jpg",
        "stock_quantity": 10,
        "is_customizable": true
      },
      "quantity": 1,
      "customizations": [
        {
          "option_id": 1,
          "value_id": 10
        }
      ],
      "unit_price": 650.0,
      "total_price": 650.0
    }
  ],
  "subtotal": 650.0,
  "total_items": 1
}
```

**Validation Errors:**
- `400`: Product not found
- `400`: Insufficient stock
- `400`: Customization validation failed
- `400`: Required option not provided
- `400`: Invalid option value

---

#### Get Cart with Customizations
**Retrieve cart contents with customization data**

```http
GET /cart?cart_id=550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "id": 42,
      "product_id": 5,
      "product": {
        "id": 5,
        "name": "Modern Sofa",
        "slug": "modern-sofa",
        "price": 500.0,
        "discount_price": null,
        "thumbnail": "https://cdn.example.com/sofa.jpg",
        "stock_quantity": 10,
        "is_customizable": true
      },
      "quantity": 1,
      "customizations": [
        {
          "option_id": 1,
          "value_id": 10
        }
      ],
      "unit_price": 650.0,
      "total_price": 650.0
    }
  ],
  "subtotal": 650.0,
  "total_items": 1
}
```

---

#### Update Cart Item
**Modify quantity of a cart item**

```http
PUT /cart/items/{item_id}
Content-Type: application/json

{
  "cart_id": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 2
}
```

**Response (200 OK):** Same as Get Cart

---

#### Remove Item from Cart
**Delete a cart item**

```http
DELETE /cart/items/{item_id}?cart_id=550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):** Same as Get Cart

---

#### Checkout with Customizations
**Create order from cart preserving customizations**

```http
POST /checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "cart_id": "550e8400-e29b-41d4-a716-446655440000",
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "coupon_code": "SAVE10",
  "notes": "Please handle with care"
}
```

**Response (200 OK):**
```json
{
  "id": 100,
  "order_number": "ORD-ABC123DEF456",
  "user_id": "user-789",
  "order_status": "pending",
  "payment_status": "pending",
  "subtotal": 1300.0,
  "shipping": 10.0,
  "discount": 0.0,
  "coupon_code": "SAVE10",
  "coupon_discount": 130.0,
  "total": 1180.0,
  "items": [
    {
      "id": 1,
      "order_id": 100,
      "product_id": 5,
      "product_name": "Modern Sofa",
      "product_sku": "SOFA-001",
      "quantity": 2,
      "unit_price": 650.0,
      "total_price": 1300.0,
      "customizations": [
        {
          "option_id": 1,
          "value_id": 10
        }
      ]
    }
  ],
  "created_at": "2025-01-15T14:22:00Z",
  "updated_at": "2025-01-15T14:22:00Z"
}
```

**Customizations are preserved in order_items**

---

## Data Types and Formats

### ProductOption
```typescript
{
  id: number,
  product_id: number,
  name: string,
  type: "dropdown" | "color" | "text" | "dimensions",
  is_required: boolean,
  sort_order: number,
  values: ProductOptionValue[],
  created_at: string (ISO 8601),
  updated_at: string (ISO 8601)
}
```

### ProductOptionValue
```typescript
{
  id: number,
  option_id: number,
  value: string,
  price_modifier: number,
  image_url: string | null,
  sort_order: number
}
```

### Customization
```typescript
{
  option_id: number,        // Required
  value_id?: number,        // For dropdown, color, dimensions
  value_text?: string       // For text options
}
```

### PriceCalculation
```typescript
{
  base_price: number,
  modifiers_total: number,
  final_price: number,
  breakdown: {
    [option_name: string]: number
  }
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 500 | Server Error |

---

## Example Workflows

### Complete Workflow: Add Customized Product to Cart

1. **Get Product with Options**
   ```
   GET /products/5
   ```

2. **Calculate Price**
   ```
   POST /products/calculate-price
   {
     "product_id": 5,
     "customizations": [{"option_id": 1, "value_id": 10}]
   }
   ```

3. **Add to Cart**
   ```
   POST /cart/items
   {
     "product_id": 5,
     "quantity": 1,
     "cart_id": "abc123",
     "customizations": [{"option_id": 1, "value_id": 10}]
   }
   ```

4. **Get Cart**
   ```
   GET /cart?cart_id=abc123
   ```

5. **Checkout**
   ```
   POST /checkout
   {
     "cart_id": "abc123",
     "shipping_address_id": 1,
     "billing_address_id": 1
   }
   ```

### Complete Workflow: Create Customization Options (Admin)

1. **Create Option**
   ```
   POST /products/5/options
   {
     "name": "Color",
     "type": "dropdown",
     "is_required": true,
     "sort_order": 0,
     "values": [
       {"value": "Black", "price_modifier": 0, "sort_order": 0},
       {"value": "White", "price_modifier": 50, "sort_order": 1}
     ]
   }
   ```

2. **Add More Values**
   ```
   POST /products/options/1/values
   {
     "value": "Gray",
     "price_modifier": 50,
     "sort_order": 2
   }
   ```

3. **Create Second Option**
   ```
   POST /products/5/options
   {
     "name": "Material",
     "type": "dropdown",
     "is_required": true,
     "sort_order": 1,
     "values": [...]
   }
   ```

---

**Last Updated:** January 2025  
**API Version:** 1.0
