# Product Customization System - Quick Start Guide

## For Admins: 5-Minute Setup

### Step 1: Enable Customization on a Product
1. Go to **Products** → **Product List**
2. Click **Edit** on a product (e.g., "Modern Sofa")
3. Check **"Enable Customization"**
4. Scroll to **"Customization Options"** section
5. Click **"Expand Customization Manager"**

### Step 2: Create First Option (Color)
1. Enter Option Name: `Color`
2. Select Type: `dropdown`
3. Check **Required**
4. Click **+ Add**

### Step 3: Add Option Values
1. Click **"+ Add value"** under the Color option
2. Enter values:
   - Value: `Black`, Modifier: `$0`
   - Value: `White`, Modifier: `+$50`
   - Value: `Gray`, Modifier: `+$50`

### Step 4: Create Second Option (Material)
1. Enter Option Name: `Material`
2. Select Type: `dropdown`
3. Check **Required**
4. Click **+ Add**
5. Add values:
   - Value: `Cotton`, Modifier: `$0`
   - Value: `Leather`, Modifier: `+$100`

### Step 5: Save and Test
1. Click **Save** on product
2. Visit storefront and view the product
3. You should see **"Customize Your Product"** section
4. Select options and verify price updates

**Total Time: ~5 minutes**

---

## For Developers: Integration Guide

### 1. Verify Database Tables Exist

```bash
# Check product customization tables
sqlite3 db.sqlite

SELECT name FROM sqlite_master WHERE type='table' 
AND name IN ('product_options', 'product_option_values');
```

Expected output:
```
product_options
product_option_values
```

### 2. Verify Backend Endpoints

```bash
# Get customization options for a product
curl http://localhost:8000/products/5/options

# Calculate price
curl -X POST http://localhost:8000/products/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 5,
    "customizations": [{"option_id": 1, "value_id": 10}]
  }'
```

### 3. Add Item to Cart with Customization

```bash
curl -X POST http://localhost:8000/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 5,
    "quantity": 1,
    "cart_id": "test-cart-123",
    "customizations": [
      {"option_id": 1, "value_id": 10},
      {"option_id": 2, "value_id": 25}
    ]
  }'
```

### 4. Verify Storefront Component

Check `/frontend/storefront/src/pages/ProductDetail.jsx`:
- Look for `<CustomizationPanel />` component
- Verify it renders when `product.is_customizable === true`
- Test selection and price updates

### 5. Verify Admin Component

Check `/frontend/admin/src/pages/products/ProductList.jsx`:
- Look for `<CustomizationManager />` component
- Verify it opens when clicking product edit button
- Test creating/editing/deleting options

---

## Common Tasks

### Task: Add Color Customization with Preview Images

```bash
# Step 1: Create Color option
curl -X POST http://localhost:8000/products/5/options \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Color",
    "type": "color",
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
      }
    ]
  }'
```

---

### Task: Make Customization Optional

```bash
# Create a note/request option that's optional
curl -X POST http://localhost:8000/products/5/options \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Special Requests",
    "type": "text",
    "is_required": false,
    "sort_order": 10
  }'
```

---

### Task: Create Size Option with Price Tiers

```bash
curl -X POST http://localhost:8000/products/5/options \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Size",
    "type": "dimensions",
    "is_required": true,
    "sort_order": 2,
    "values": [
      {
        "value": "Small (36 inches)",
        "price_modifier": -50,
        "sort_order": 0
      },
      {
        "value": "Medium (48 inches)",
        "price_modifier": 0,
        "sort_order": 1
      },
      {
        "value": "Large (60 inches)",
        "price_modifier": 100,
        "sort_order": 2
      },
      {
        "value": "XL (72 inches)",
        "price_modifier": 200,
        "sort_order": 3
      }
    ]
  }'
```

---

### Task: Disable Customization on a Product

```bash
# Method 1: Toggle (if currently enabled, will disable)
curl -X PUT http://localhost:8000/products/5/customizable \
  -H "Authorization: Bearer admin_token"

# Method 2: Set directly to false
curl -X PATCH http://localhost:8000/products/5/customizable-status?status=false \
  -H "Authorization: Bearer admin_token"
```

---

### Task: Check Customization Data in Orders

```sql
-- Query orders with customized items
SELECT 
  oi.id,
  o.order_number,
  oi.product_name,
  oi.quantity,
  oi.unit_price,
  oi.customizations
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE oi.customizations IS NOT NULL
LIMIT 10;
```

---

## Testing Checklist

- [ ] Can enable/disable customization on product
- [ ] Can create customization options
- [ ] Can add values with price modifiers
- [ ] Options appear in storefront product detail
- [ ] Price updates in real-time when selecting options
- [ ] Required field validation works
- [ ] Can add customized item to cart
- [ ] Cart shows customization data
- [ ] Customization data preserved in order history
- [ ] Admin can edit/delete options
- [ ] Admin can edit/delete option values
- [ ] Non-customizable products don't show options
- [ ] Mobile responsive layout works
- [ ] Multiple customizations combine properly
- [ ] Negative price modifiers work (discounts)

---

## API Cheat Sheet

### Get All Options for Product
```
GET /products/{product_id}/options
```

### Calculate Price
```
POST /products/calculate-price
{
  "product_id": 5,
  "customizations": [{"option_id": 1, "value_id": 10}]
}
```

### Create Option (Admin)
```
POST /products/{product_id}/options
{
  "name": "Color",
  "type": "dropdown",
  "is_required": true,
  "sort_order": 0,
  "values": [...]
}
```

### Add to Cart with Customization
```
POST /cart/items
{
  "product_id": 5,
  "quantity": 1,
  "cart_id": "abc123",
  "customizations": [{"option_id": 1, "value_id": 10}]
}
```

### Update Option Value
```
PUT /products/options/values/{value_id}
{
  "value": "New Value",
  "price_modifier": 50
}
```

### Delete Option
```
DELETE /products/options/{option_id}
```

---

## Troubleshooting

### Issue: Options Not Showing in Storefront
**Solution:**
1. Verify `product.is_customizable = true` in database
2. Check options exist: `GET /products/{product_id}/options`
3. Check network tab in browser for API calls

### Issue: Price Not Updating
**Solution:**
1. Check JavaScript console for errors
2. Verify calculate-price endpoint returns correct values
3. Test price calculation manually: `POST /products/calculate-price`

### Issue: Cart Item Not Saving Customizations
**Solution:**
1. Verify customizations are being sent in POST request
2. Check JSON serialization in response
3. Review cart response: `GET /cart?cart_id=...`

### Issue: Admin Can't Create Options
**Solution:**
1. Verify user has admin/staff role
2. Check authentication token is valid
3. Review error message in API response
4. Check browser console for errors

---

## File Locations

| Component | Location |
|-----------|----------|
| Database Models | `backend/models/product_option.py` |
| Backend APIs | `backend/routers/customization.py` |
| Cart Handling | `backend/routers/cart.py` |
| Checkout | `backend/routers/checkout.py` |
| Frontend Component | `frontend/storefront/src/pages/ProductDetail.jsx` |
| Admin Component | `frontend/admin/src/pages/products/ProductList.jsx` |
| Documentation | `PRODUCT_CUSTOMIZATION_SYSTEM.md` |
| API Reference | `API_REFERENCE_CUSTOMIZATION.md` |
| Migration | `backend/migrations/002_product_customization_system.py` |

---

## Next Steps

1. **For Admins:**
   - Start by enabling customization on your flagship product
   - Add a color option to test the system
   - Create a few size options with price tiers
   - Test on storefront and in cart

2. **For Developers:**
   - Review the API endpoints
   - Test all CRUD operations
   - Integrate with your frontend/mobile app
   - Set up automated testing
   - Monitor order data for customizations

3. **For Marketing:**
   - Decide which products will have customization
   - Plan customization options strategy
   - Create preview images for color/material options
   - Plan pricing strategy

---

## Support Resources

- Full Documentation: `PRODUCT_CUSTOMIZATION_SYSTEM.md`
- API Reference: `API_REFERENCE_CUSTOMIZATION.md`
- Database Migration: `backend/migrations/002_product_customization_system.py`
- Example Requests: API_REFERENCE_CUSTOMIZATION.md → Request/Response Examples

---

**Last Updated:** January 2025
