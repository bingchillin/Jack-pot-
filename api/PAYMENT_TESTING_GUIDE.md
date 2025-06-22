# Payment Flow Testing Guide

## 🧪 TESTING THE COMPLETE PAYMENT FLOW

### Prerequisites:
1. **Stripe Test Keys** - Make sure you have test keys in your `.env`
2. **Database** - Ensure your database has the updated schema
3. **Sample Data** - You'll need at least one person and one product

---

## 🎯 TESTING FLOW

### Step 1: Start the API Server

```bash
npm run start:dev
```

### Step 2: Open Swagger UI

Visit: **http://localhost:3000/api** 

You'll see all the new payment endpoints:
- `POST /orders` - Create order (now returns payment info)
- `POST /orders/confirm-payment` - Confirm payment
- `GET /orders/payment-status/{paymentIntentId}` - Check payment status
- `PATCH /orders/{id}/cancel` - Cancel order

---

## 🔑 1. Get an Auth Token

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-user@example.com",
    "password": "your-password"
  }'
```

**Save the `access_token` from the response!**

---

## 📦 2. Create an Order (Test Payment Intent Creation)

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Test St",
      "city": "Test City",
      "state": "TS",
      "postalCode": "12345",
      "country": "US"
    },
    "shippingCost": 5.99,
    "taxAmount": 8.50
  }'
```

**Expected Response:**
```json
{
  "idOrder": 1,
  "personId": 1,
  "totalAmount": 159.47,
  "currency": "EUR",
  "status": "payment_processing",
  "stripePaymentIntentId": "pi_1234567890abcdef",
  "clientSecret": "pi_1234567890abcdef_secret_1234567890abcdef",
  "requiresPayment": true,
  "message": "Order created successfully. Complete payment to proceed.",
  "stripeCustomerId": "cus_1234567890abcdef"
}
```

**🎉 Success indicators:**
- ✅ `stripePaymentIntentId` is present
- ✅ `clientSecret` is present
- ✅ `status` is `"payment_processing"`
- ✅ `stripeCustomerId` is present

---

## 📊 3. Check Payment Status

```bash
curl -X GET http://localhost:3000/orders/payment-status/pi_1234567890abcdef \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "orderId": 1,
  "orderStatus": "payment_processing",
  "stripePaymentIntentId": "pi_1234567890abcdef",
  "stripePaymentStatus": "requires_payment_method",
  "totalAmount": 159.47,
  "currency": "EUR",
  "isPaid": false,
  "message": "Payment is being processed."
}
```

---

## ❌ 4. Test Order Cancellation

```bash
curl -X PATCH http://localhost:3000/orders/1/cancel \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "idOrder": 1,
  "status": "cancelled",
  "stripePaymentIntentId": "pi_1234567890abcdef"
}
```

**🎉 Success indicators:**
- ✅ Order status changed to `"cancelled"`
- ✅ Stock was released back to inventory
- ✅ Stripe PaymentIntent was cancelled

---

## 💳 5. Test Payment Confirmation (Optional)

```bash
curl -X POST http://localhost:3000/orders/confirm-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "paymentIntentId": "pi_1234567890abcdef",
    "paymentMethodId": "pm_card_visa"
  }'
```

---

## 🔍 WHAT TO LOOK FOR

### In the API Logs:
```
✅ Ensured Stripe customer cus_xxx for person 1
Created payment intent pi_xxx for order 1
Updated payment intent pi_xxx
Cancelled payment intent pi_xxx
```

### In Your Database:
```sql
-- Check order was created with payment info
SELECT id_order, status, stripe_payment_intent_id, stripe_customer_id, total_amount 
FROM orders 
ORDER BY created_at DESC LIMIT 1;

-- Check stock was reserved then released
SELECT id_product, name, stock_quantity, reserved_quantity 
FROM products 
WHERE id_product = 1;

-- Check person has Stripe customer ID
SELECT id_person, email, stripe_customer_id 
FROM persons 
WHERE id_person = 1;
```

### In Stripe Dashboard:
1. Go to **https://dashboard.stripe.com/test/payments**
2. You should see:
   - ✅ New customer created
   - ✅ Payment intent created
   - ✅ Payment intent cancelled (if you tested cancellation)

---

## 🚨 TROUBLESHOOTING

### If `stripeCustomerId` is null:
```bash
# Check Stripe service status
curl -X GET http://localhost:3000/stripe/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### If order creation fails:
```bash
# Check if you have products
curl -X GET http://localhost:3000/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Check if you're authenticated
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🎯 QUICK TEST CHECKLIST

- [ ] **API starts without errors**
- [ ] **Swagger UI loads at http://localhost:3000/api**
- [ ] **Can login and get auth token**
- [ ] **Order creation returns payment info**
- [ ] **Payment status endpoint works**
- [ ] **Order cancellation works**
- [ ] **Stripe customer is created automatically**
- [ ] **Stock reservation/release works**

---

## 📝 NOTES

- All payment intents are created in EUR currency by default
- Stock is reserved during order creation and released on cancellation
- Stripe customers are created automatically for users who don't have them
- Payment confirmation requires actual payment methods from Stripe's test suite 