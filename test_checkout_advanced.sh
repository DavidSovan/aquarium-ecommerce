#!/bin/bash

API="http://localhost:8000"
USER_ID="e2e-test-billing-$(date +%s)"

echo "=== Testing Advanced Checkout Features ==="
echo ""

# Create discounted product
echo "1. Creating product with discount..."
PRODUCT=$(curl -s -X POST "$API/products" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beta Fish",
    "price": 25.00,
    "discount_price": 18.00,
    "stock_quantity": 50
  }')
PRODUCT_ID=$(echo $PRODUCT | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "   Product ID: $PRODUCT_ID"
echo ""

# Add to cart
echo "2. Adding to cart (quantity: 3)..."
CART=$(curl -s -X POST "$API/cart/items" \
  -H "Content-Type: application/json" \
  -d "{\"product_id\": $PRODUCT_ID, \"quantity\": 3}")
CART_ID=$(echo $CART | grep -o '"id":"[^"]*' | head -1 | cut -d: -f2 | tr -d '"')
echo "   Cart ID: $CART_ID"
echo ""

# Create two addresses
echo "3. Creating shipping and billing addresses..."
SHIPPING=$(curl -s -X POST "$API/addresses" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"full_name\": \"John Shipping\",
    \"phone\": \"+1111111111\",
    \"country\": \"US\",
    \"city\": \"New York\",
    \"address_line\": \"123 Shipping St\"
  }")
SHIPPING_ID=$(echo $SHIPPING | grep -o '"id":[0-9]*' | cut -d: -f2)

BILLING=$(curl -s -X POST "$API/addresses" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"full_name\": \"John Billing\",
    \"phone\": \"+2222222222\",
    \"country\": \"CA\",
    \"city\": \"Toronto\",
    \"address_line\": \"456 Billing Ave\"
  }")
BILLING_ID=$(echo $BILLING | grep -o '"id":[0-9]*' | cut -d: -f2)
echo "   Shipping ID: $SHIPPING_ID"
echo "   Billing ID: $BILLING_ID"
echo ""

# Checkout with both addresses
echo "4. Processing checkout with both addresses..."
ORDER=$(curl -s -X POST "$API/checkout" \
  -H "Content-Type: application/json" \
  -d "{
    \"cart_id\": \"$CART_ID\",
    \"user_id\": \"$USER_ID\",
    \"shipping_address_id\": $SHIPPING_ID,
    \"billing_address_id\": $BILLING_ID
  }")

echo "$ORDER" | grep -o '"order_id":[0-9]*' > /dev/null
if [ $? -eq 0 ]; then
  ORDER_ID=$(echo $ORDER | grep -o '"order_id":[0-9]*' | cut -d: -f2)
  SUBTOTAL=$(echo $ORDER | grep -o '"subtotal":[0-9.]*' | cut -d: -f2)
  DISCOUNT=$(echo $ORDER | grep -o '"discount":[0-9.]*' | cut -d: -f2)
  TOTAL=$(echo $ORDER | grep -o '"total":[0-9.]*' | cut -d: -f2)
  
  echo "   ✓ Order created successfully"
  echo "   Order ID: $ORDER_ID"
  echo "   Subtotal: $SUBTOTAL (expected: 54.00 = 18.00 * 3)"
  echo "   Discount: $DISCOUNT (expected: 21.00 = (25.00-18.00) * 3)"
  echo "   Total: $TOTAL (expected: 54.00)"
else
  echo "   ✗ Checkout failed"
  echo "$ORDER"
fi
echo ""

echo "=== Advanced Checkout Test Complete ==="
