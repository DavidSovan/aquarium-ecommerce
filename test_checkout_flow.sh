#!/bin/bash

# Test checkout flow end-to-end
API="http://localhost:8000"
USER_ID="e2e-test-user-$(date +%s)"

echo "=== Testing Checkout Flow ==="
echo ""

# Step 1: Create products
echo "1. Creating product..."
PRODUCT=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Neon Tetra Fish",
    "price": 12.99,
    "stock_quantity": 100
  }')
PRODUCT_ID=$(echo $PRODUCT | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "   Product ID: $PRODUCT_ID"
echo ""

# Step 2: Add to cart
echo "2. Adding to cart..."
CART=$(curl -s -X POST "$API/cart/items" \
  -H "Content-Type: application/json" \
  -d "{
    \"product_id\": $PRODUCT_ID,
    \"quantity\": 2
  }")
CART_ID=$(echo $CART | grep -o '"id":"[^"]*' | head -1 | cut -d: -f2 | tr -d '"')
SUBTOTAL=$(echo $CART | grep -o '"subtotal":[0-9.]*' | cut -d: -f2)
echo "   Cart ID: $CART_ID"
echo "   Subtotal: $SUBTOTAL"
echo ""

# Step 3: Create address
echo "3. Creating shipping address..."
ADDRESS=$(curl -s -X POST "$API/addresses" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"full_name\": \"John Doe\",
    \"phone\": \"+1234567890\",
    \"country\": \"US\",
    \"city\": \"New York\",
    \"address_line\": \"123 Main St\"
  }")
ADDRESS_ID=$(echo $ADDRESS | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "   Address ID: $ADDRESS_ID"
echo ""

# Step 4: Checkout
echo "4. Processing checkout..."
ORDER=$(curl -s -X POST "$API/checkout" \
  -H "Content-Type: application/json" \
  -d "{
    \"cart_id\": \"$CART_ID\",
    \"user_id\": \"$USER_ID\",
    \"shipping_address_id\": $ADDRESS_ID
  }")

ORDER_ID=$(echo $ORDER | grep -o '"order_id":[0-9]*' | cut -d: -f2)
TOTAL=$(echo $ORDER | grep -o '"total":[0-9.]*' | cut -d: -f2)
DISCOUNT=$(echo $ORDER | grep -o '"discount":[0-9.]*' | cut -d: -f2)
STATUS=$(echo $ORDER | grep -o '"status":"[^"]*' | cut -d: -f2 | tr -d '"')

echo "   Order ID: $ORDER_ID"
echo "   Status: $STATUS"
echo "   Subtotal: $SUBTOTAL"
echo "   Discount: $DISCOUNT"
echo "   Total: $TOTAL"
echo ""

# Step 5: Verify stock was decremented
echo "5. Verifying stock was decremented..."
PRODUCT_CHECK=$(curl -s -X GET "$API/products/$PRODUCT_ID")
STOCK=$(echo $PRODUCT_CHECK | grep -o '"stock_quantity":[0-9]*' | cut -d: -f2)
echo "   New stock quantity: $STOCK (should be 98)"
echo ""

# Step 6: Verify cart was cleared
echo "6. Verifying cart was cleared..."
CART_CHECK=$(curl -s -X GET "$API/cart?cart_id=$CART_ID")
if echo $CART_CHECK | grep -q "Cart not found"; then
  echo "   ✓ Cart successfully deleted"
else
  echo "   ✗ Cart still exists (ERROR)"
fi
echo ""

echo "=== Checkout Flow Test Complete ==="
