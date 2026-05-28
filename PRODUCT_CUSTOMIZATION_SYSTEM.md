# Product Customization System - Comprehensive Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Admin Workflow](#admin-workflow)
5. [Storefront Workflow](#storefront-workflow)
6. [Request/Response Examples](#requestresponse-examples)
7. [Pricing Logic](#pricing-logic)
8. [Frontend Components](#frontend-components)
9. [Validation Rules](#validation-rules)
10. [Best Practices](#best-practices)

## Overview

The Product Customization System enables furniture e-commerce products to offer dynamic customization options. Each product can be independently configured to:

- Allow or disable customizations
- Define multiple customization options (colors, materials, sizes, dimensions, notes)
- Set price modifiers for each option value
- Display preview images during customization
- Validate required customization fields
- Preserve customization data through checkout and order history

### Key Features

✅ **Dynamic System** - No code changes needed to add/modify customization options  
✅ **Real-time Price Updates** - Prices update instantly as customers select options  
✅ **Option Types** - Support for dropdowns, color pickers, text input, dimensions  
✅ **Price Modifiers** - Each option value can have a positive or negative price adjustment  
✅ **Preview Images** - Display images as customers customize products  
✅ **Validation** - Required field enforcement on storefront and backend  
✅ **Cart Management** - Track customizations per cart item  
✅ **Order Preservation** - Save customization data permanently in order history  
✅ **Mobile Responsive** - Full mobile support for customization UI  

### Example Products

**Customizable Products:**
- Sofa (colors, materials, sizes, cushion types)
- Table (dimensions, finishes, base colors)
- Chair (upholstery, leg finish, seat height)

**Non-Customizable Products:**
- Lighting (standard only)
- Accessories (fixed variants)
- Storage items (no customization needed)

## Database Schema

### Tables Overview

```
products
├── is_customizable (BOOLEAN)
├── ... (existing fields)
└── Relationship: Has many product_options

product_options
├── id (PK)
├── product_id (FK → products)
├── name (e.g., "Color")
├── type (dropdown|color|text|dimensions)
├── is_required (BOOLEAN)
├── sort_order (INTEGER)
├── created_at, updated_at
└── Relationship: Has many product_option_values

product_option_values
├── id (PK)
├── option_id (FK → product_options)
├── value (e.g., "Black", "L", "Leather")
├── price_modifier (FLOAT)
├── image_url (VARCHAR)
├── sort_order (INTEGER)
└── created_at, updated_at

cart_items
├── ... (existing fields)
├── customizations (JSON) ← NEW
└── Stores selected customization options

order_items
├── ... (existing fields)
├── customizations (JSON) ← NEW
└── Permanently preserves customization selections
```

### JSON Data Format

**Customization Data Structure:**

```json
[
  {
    "option_id": 1,
    "value_id": 10,
    "value_text": null
  },
  {
    "option_id": 2,
    "value_id": 25,
    "value_text": null
  },
  {
    "option_id": 4,
    "value_id": null,
    "value_text": "Please deliver after 5 PM"
  }
]
```

**Stored in cart_items.customizations and order_items.customizations**

### Migration Summary

Migration file: `migrations/002_product_customization_system.py`

**Changes Applied:**
1. Added `is_customizable` BOOLEAN column to `products` table (DEFAULT FALSE)
2. Created `product_options` table with customization option definitions
3. Created `product_option_values` table with option value choices and price modifiers
4. Added `customizations` JSON column to `cart_items` table
5. Added `customizations` JSON column to `order_items` table

## API Endpoints

### Admin Endpoints

**Product Customization Toggle**

```
PUT /products/{product_id}/customizable
```
Toggles the `is_customizable` flag for a product.

**Set Customizable Status**

```
PATCH /products/{product_id}/customizable-status?status=true|false
```
Directly set the customizable status (true/false).

**Create Customization Option**

```
POST /products/{product_id}/options
```

Request body:
```json
{
  "name": "Color",
  "type": "dropdown",
  "is_required": true,
  "sort_order": 0,
  "values": [
    {
      "value": "Black",
      "price_modifier": 0,
      "image_url": "https://cdn.example.com/black.jpg",
      "sort_order": 0
    },
    {
      "value": "White",
      "price_modifier": 50,
      "image_url": "https://cdn.example.com/white.jpg",
      "sort_order": 1
    }
  ]
}
```

**Update Customization Option**

```
PUT /products/options/{option_id}
```

Request body:
```json
{
  "name": "Color",
  "type": "color",
  "is_required": false,
  "sort_order": 0
}
```

**Delete Customization Option**

```
DELETE /products/options/{option_id}
```

**Create Option Value**

```
POST /products/options/{option_id}/values
```

Request body:
```json
{
  "value": "Black",
  "price_modifier": 0,
  "image_url": "https://cdn.example.com/black.jpg",
  "sort_order": 0
}
```

**Update Option Value**

```
PUT /products/options/values/{value_id}
```

Request body:
```json
{
  "value": "Black",
  "price_modifier": 0,
  "image_url": "https://cdn.example.com/black.jpg",
  "sort_order": 0
}
```

**Delete Option Value**

```
DELETE /products/options/values/{value_id}
```

---

### Public/Storefront Endpoints

**Get Customization Options for Product**

```
GET /products/{product_id}/options
```

Response:
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
        "price_modifier": 0,
        "image_url": "https://cdn.example.com/black.jpg",
        "sort_order": 0
      },
      {
        "id": 11,
        "option_id": 1,
        "value": "White",
        "price_modifier": 50,
        "image_url": "https://cdn.example.com/white.jpg",
        "sort_order": 1
      }
    ],
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]
```

**Get Product with Customization Options**

```
GET /products/{product_id}
GET /products/slug/{slug}
```

Response includes:
```json
{
  "id": 5,
  "name": "Modern Sofa",
  "price": 500,
  "is_customizable": true,
  "options": [
    {
      "id": 1,
      "name": "Color",
      "type": "dropdown",
      "is_required": true,
      "values": [...]
    },
    {
      "id": 2,
      "name": "Material",
      "type": "dropdown",
      "is_required": true,
      "values": [...]
    }
  ],
  "..." : "other product fields"
}
```

**Calculate Price with Customizations**

```
POST /products/calculate-price
```

Request body:
```json
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

Response:
```json
{
  "base_price": 500.00,
  "modifiers_total": 150.00,
  "final_price": 650.00,
  "breakdown": {
    "Color": 0.00,
    "Material": 100.00,
    "Size": 50.00
  }
}
```

**Add Item to Cart with Customizations**

```
POST /cart/items
```

Request body:
```json
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

Response includes cart with items:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "id": 1,
      "product_id": 5,
      "quantity": 1,
      "customizations": [
        {
          "option_id": 1,
          "value_id": 10
        }
      ],
      "unit_price": 650.00,
      "total_price": 650.00
    }
  ],
  "subtotal": 650.00,
  "total_items": 1
}
```

**Checkout with Customizations**

```
POST /checkout
```

Request body:
```json
{
  "cart_id": "550e8400-e29b-41d4-a716-446655440000",
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "coupon_code": "SAVE10"
}
```

Order items will automatically preserve customizations:
```json
{
  "id": 1,
  "order_id": 100,
  "product_id": 5,
  "product_name": "Modern Sofa",
  "quantity": 1,
  "unit_price": 650.00,
  "total_price": 650.00,
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

## Admin Workflow

### Step 1: Enable Customization for a Product

1. Navigate to **Products** → **Product List**
2. Click **Edit** on the desired product (e.g., "Modern Sofa")
3. Check the **"Enable Customization"** checkbox
4. Click **Save**

### Step 2: Create Customization Options

1. In the product edit page, scroll to **"Customization Options"** section
2. Click **"Expand Customization Manager"**
3. For each customization option:
   - Enter **Option Name** (e.g., "Color", "Material")
   - Select **Option Type**:
     - `dropdown` - Standard select list
     - `color` - Color picker + select
     - `text` - Text input (for notes/special requests)
     - `dimensions` - Dimension values
   - Check **Required** if the option must be selected
   - Click **+ Add**

### Step 3: Add Option Values

1. For each option, click **"+ Add value"**
2. Enter:
   - **Value** (e.g., "Black", "Leather", "Large")
   - **Price Modifier** (amount to add/subtract from base price)
   - **Image URL** (optional, for preview images)
3. Click **Add**

### Step 4: Configure Price Modifiers

Example for a $500 sofa:

| Option | Value | Price Modifier | Total Impact |
|--------|-------|-----------------|--------------|
| Color | Black | $0 | $500 |
| Color | White | +$50 | $550 |
| Material | Cotton | $0 | $500 |
| Material | Leather | +$100 | $600 |
| Size | Small | -$50 | $450 |
| Size | Medium | $0 | $500 |
| Size | Large | +$50 | $550 |

### Step 5: Manage Options

- **Edit Option**: Click the option name to edit settings
- **Delete Option**: Click "Delete" (removes option and all values)
- **Add More Values**: Click "+ Add value" under any option
- **Delete Value**: Click "×" next to any value

### Example Setup

**Product:** Modern Sofa ($500)

**Customization Options:**

```
1. Color (Dropdown, Required)
   - Black (Price Mod: $0)
   - White (Price Mod: +$50)
   - Gray (Price Mod: +$50)

2. Material (Dropdown, Required)
   - Cotton (Price Mod: $0)
   - Linen (Price Mod: +$50)
   - Leather (Price Mod: +$100)

3. Size (Dropdown, Required)
   - Small (Price Mod: -$50)
   - Medium (Price Mod: $0)
   - Large (Price Mod: +$50)
   - XL (Price Mod: +$100)

4. Special Notes (Text, Optional)
   - [No values, customer enters text]
```

## Storefront Workflow

### Step 1: Browse Products

1. Navigate to shop or search
2. Click on a product (e.g., "Modern Sofa")

### Step 2: View Customization Options

- If the product is customizable, a **"Customize Your Product"** section appears
- Required options are marked with a red asterisk (*)
- Each option shows the available choices and price modifiers

### Step 3: Select Customization Options

**For Dropdown Options:**
- Click the dropdown and select a value
- Price automatically updates to show the final price

**For Color Options:**
- Click a color swatch OR select from the dropdown
- Preview image updates (if configured)
- Price updates instantly

**For Text Options:**
- Enter custom text in the textarea
- Preview updates with the text entry

**For Dimension Options:**
- Select from predefined dimensions
- Price adjusts based on selection

### Step 4: Review Final Price

- **Base Price**: Shows original product price
- **Customization**: Shows total modifier amount
- **Final Price**: Shows base + customization total

Example:
```
Base Price:        $500.00
Customization:     +$150.00
Final Price:       $650.00
```

### Step 5: Add to Cart

1. Adjust quantity if needed
2. Click **"Add to Cart"**
3. Validation occurs:
   - Required options are checked
   - Invalid selections are rejected
   - Customization data is saved with the cart item

### Step 6: Review in Cart

In the cart:
- Each customized item shows the customization data
- Price reflects the customized amount (base + modifiers)
- Items with different customizations are tracked separately

### Step 7: Proceed to Checkout

1. Review customization in order summary
2. Customization data is locked when order is created
3. Order history preserves all customization selections

## Request/Response Examples

### Example 1: Create a Sofa with Color and Material Options

**Request:**
```http
POST /products/5/options
Authorization: Bearer admin_token
Content-Type: application/json

{
  "name": "Color",
  "type": "dropdown",
  "is_required": true,
  "sort_order": 0,
  "values": [
    {
      "value": "Black",
      "price_modifier": 0,
      "image_url": "https://cdn.example.com/sofa-black.jpg",
      "sort_order": 0
    },
    {
      "value": "White",
      "price_modifier": 50,
      "image_url": "https://cdn.example.com/sofa-white.jpg",
      "sort_order": 1
    },
    {
      "value": "Gray",
      "price_modifier": 50,
      "image_url": "https://cdn.example.com/sofa-gray.jpg",
      "sort_order": 2
    }
  ]
}
```

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
      "image_url": "https://cdn.example.com/sofa-black.jpg",
      "sort_order": 0
    },
    {
      "id": 11,
      "option_id": 1,
      "value": "White",
      "price_modifier": 50.0,
      "image_url": "https://cdn.example.com/sofa-white.jpg",
      "sort_order": 1
    },
    {
      "id": 12,
      "option_id": 1,
      "value": "Gray",
      "price_modifier": 50.0,
      "image_url": "https://cdn.example.com/sofa-gray.jpg",
      "sort_order": 2
    }
  ],
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Example 2: Customer Selects Customizations and Adds to Cart

**Request:**
```http
POST /cart/items
Content-Type: application/json

{
  "product_id": 5,
  "quantity": 1,
  "cart_id": "abc123-def456",
  "customizations": [
    {
      "option_id": 1,
      "value_id": 11
    },
    {
      "option_id": 2,
      "value_id": 25
    }
  ]
}
```

**Response:**
```json
{
  "id": "abc123-def456",
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
          "value_id": 11
        },
        {
          "option_id": 2,
          "value_id": 25
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

### Example 3: Price Calculation

**Request:**
```http
POST /products/calculate-price
Content-Type: application/json

{
  "product_id": 5,
  "customizations": [
    {
      "option_id": 1,
      "value_id": 11
    },
    {
      "option_id": 2,
      "value_id": 25
    },
    {
      "option_id": 3,
      "value_id": 30
    }
  ]
}
```

**Response:**
```json
{
  "base_price": 500.0,
  "modifiers_total": 150.0,
  "final_price": 650.0,
  "breakdown": {
    "Color": 50.0,
    "Material": 100.0,
    "Size": 0.0
  }
}
```

### Example 4: Order Preservation

**Order Created from Customized Cart:**
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
  "coupon_code": null,
  "coupon_discount": 0.0,
  "total": 1310.0,
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
          "value_id": 11
        },
        {
          "option_id": 2,
          "value_id": 25
        }
      ]
    }
  ],
  "created_at": "2025-01-15T14:22:00Z",
  "updated_at": "2025-01-15T14:22:00Z"
}
```

## Pricing Logic

### Formula

```
Final Price = Base Price + Sum(selected option value modifiers)
```

### Calculation Steps

1. **Get Base Price**
   - Use `discount_price` if available
   - Otherwise use `price`

2. **Collect Modifiers**
   - For each selected customization
   - Look up the `ProductOptionValue` by `value_id`
   - Get the `price_modifier`

3. **Sum Modifiers**
   - Add all positive modifiers (upsells)
   - Add all negative modifiers (downsells)

4. **Calculate Final Price**
   - Final = Base + Total Modifiers

### Example Calculation

**Product:** Modern Sofa
- Base Price: $500
- Discount Price: None

**Customer Selections:**
1. Color: White (+$50)
2. Material: Leather (+$100)
3. Size: Large (+$50)

**Calculation:**
```
Base Price:           $500.00
Color (White):        +$50.00
Material (Leather):   +$100.00
Size (Large):         +$50.00
────────────────────────────
Final Price:          $700.00
```

### Price Modifier Types

| Type | Modifier | Effect |
|------|----------|--------|
| Upsell | +50.00 | Increases final price |
| Base | 0.00 | No price change |
| Downsell | -25.00 | Decreases final price |

### Real-time Updates

Frontend handles real-time price updates:
1. Listen for customization selection changes
2. Calculate modifiers for each option
3. Update displayed final price immediately
4. Show price breakdown

## Frontend Components

### ProductDetail Page

**Location:** `storefront/src/pages/ProductDetail.jsx`

**Features:**
- Displays product information
- Shows customization options if product is customizable
- Handles add-to-cart with customizations
- Shows validation errors
- Updates price in real-time

### CustomizationPanel Component

**Location:** `storefront/src/pages/ProductDetail.jsx` (embedded)

**Props:**
```typescript
{
  options: ProductOption[],           // Available customization options
  onCustomizationsChange: (selections) => void,  // Callback when selection changes
  basePrice: number                   // Base product price
}
```

**Renders:**
- Option label with required indicator
- Input based on option type (dropdown, color, textarea, select)
- Price summary with breakdown
- Validation messages

### Admin CustomizationManager Component

**Location:** `admin/src/pages/products/ProductList.jsx` (embedded)

**Props:**
```typescript
{
  productId: number,        // Product ID to manage customizations for
  onClose: () => void       // Callback to close the manager
}
```

**Features:**
- Create customization options
- Add option values with price modifiers
- Edit existing options
- Delete options and values
- Show preview of option values
- Real-time updates

## Validation Rules

### Backend Validation

**Required Options:**
- If an option has `is_required: true`, the customization must include a selection for that option
- For dropdown/color options: must have a valid `value_id`
- For text options: must have non-empty `value_text`

**Value Validation:**
- `value_id` must exist in `ProductOptionValue` table
- `option_id` must match the option owning the value
- Product must be marked as customizable

**Cart Validation:**
- Product must exist and have available stock
- If product is not customizable, no customizations should be provided
- Customization data must be valid JSON

**Checkout Validation:**
- All customizations from cart must still be valid (values must exist)
- Stock quantities must be rechecked
- Price modifiers must be recalculated

### Frontend Validation

**During Customization:**
- Required options indicated with red asterisk
- Error messages shown when required option is not selected
- Prevent add-to-cart without required options filled

**During Cart Review:**
- Show customization data for each item
- Display final price including modifiers
- Allow quantity adjustment without affecting customization

### Error Messages

```
"Option(s) not provided: Color, Material"
"This product does not support customizations"
"Invalid value for option 'Color'"
"Text value is required for option 'Special Notes'"
"Required option 'Material' is missing"
```

## Best Practices

### Admin Best Practices

1. **Option Naming**
   - Use clear, customer-friendly names
   - Examples: "Color", "Material", "Size", "Special Requests"
   - Avoid abbreviations

2. **Value Naming**
   - Be descriptive: "Black Leather" instead of "BK-LTH"
   - Include size indicators: "Small (36\" wide)"
   - Be consistent with wording

3. **Price Modifiers**
   - Document your pricing strategy
   - Consider material costs vs. perceived value
   - Test pricing with sample configurations

4. **Required Fields**
   - Mark as required only when necessary
   - Make optional fields truly optional
   - Consider defaults for non-required options

5. **Sorting**
   - Use `sort_order` to control display order
   - Put popular options first
   - Group related values together

6. **Images**
   - Use preview images for color options
   - Ensure images are properly hosted
   - Test image loading
   - Keep file sizes reasonable for mobile

### Developer Best Practices

1. **Serialization**
   - Always serialize customizations to JSON for storage
   - Use consistent field names
   - Preserve value IDs for auditing

2. **Price Calculation**
   - Always recalculate prices on backend
   - Never trust frontend price values
   - Check modifiers exist before applying

3. **Error Handling**
   - Validate customizations early
   - Return clear error messages
   - Log failed validations for debugging

4. **Performance**
   - Cache product options
   - Use indexes on foreign keys
   - Avoid N+1 queries when loading cart

5. **Data Preservation**
   - Always save customizations to order history
   - Preserve modifiers in order items
   - Allow historical data queries

### Customer Best Practices

1. **Clear Options**
   - Provide enough preview images
   - Show price impacts clearly
   - Explain each customization option

2. **Validation Feedback**
   - Show which required fields are missing
   - Provide specific error messages
   - Highlight problems in real-time

3. **Mobile Experience**
   - Ensure color swatches are tap-friendly
   - Make text inputs touch-optimized
   - Show full price on mobile

4. **Accessibility**
   - Label all form inputs clearly
   - Use ARIA attributes where needed
   - Ensure color options have text labels
   - Maintain keyboard navigation

## Maintenance and Troubleshooting

### Common Issues

**Issue: Price not updating in real-time**
- Check that `calculate-price` endpoint is being called
- Verify customization IDs are correct
- Check for JavaScript errors in console

**Issue: Options not showing in storefront**
- Verify `is_customizable` is true for product
- Check that options are created in admin
- Ensure product is queried with `eager load` for options

**Issue: Cart items not preserving customizations**
- Verify JSON serialization in backend
- Check that customizations are being passed in POST request
- Ensure customization data is valid JSON

**Issue: Admin customization form not saving**
- Check authentication token is valid
- Verify user has admin/staff role
- Look for validation errors in API response

### Database Checks

```sql
-- Check if product is customizable
SELECT id, name, is_customizable FROM products WHERE id = 5;

-- Get all options for a product
SELECT * FROM product_options WHERE product_id = 5 ORDER BY sort_order;

-- Get all values for an option
SELECT * FROM product_option_values WHERE option_id = 1 ORDER BY sort_order;

-- Check cart items with customizations
SELECT id, product_id, customizations FROM cart_items WHERE cart_id = 'abc123';

-- Check order items preserve customizations
SELECT id, product_name, customizations FROM order_items WHERE order_id = 100;
```

## Related Files

### Backend
- `models/product.py` - Product model with is_customizable
- `models/product_option.py` - ProductOption and ProductOptionValue models
- `routers/customization.py` - Admin and public APIs
- `routers/products.py` - Product endpoints with options
- `routers/cart.py` - Cart with customization support
- `routers/checkout.py` - Checkout with customization preservation
- `schemas/customization.py` - Pydantic schemas

### Frontend Storefront
- `pages/ProductDetail.jsx` - Product detail with CustomizationPanel
- `pages/ProductDetail.jsx` - CustomizationPanel component
- `services/productService.js` - API calls

### Frontend Admin
- `pages/products/ProductList.jsx` - ProductList with CustomizationManager
- `pages/products/ProductList.jsx` - CustomizationManager component
- `services/productService.js` - API calls

### Migrations
- `migrations/002_product_customization_system.py` - Database schema

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Production Ready
