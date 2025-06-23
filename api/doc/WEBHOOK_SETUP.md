# Stripe Webhooks Setup Guide

## 🔧 Environment Variables

Add this to your `.env` file:

```bash
# Stripe Webhook Secret (get this from Stripe Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
```

## 🔗 Webhook Endpoint

Your webhook endpoint is: `http://localhost:3000/stripe/webhook`

## 📋 Stripe Dashboard Setup

### 1. Go to Stripe Dashboard
- Visit: https://dashboard.stripe.com/test/webhooks
- Click "Add endpoint"

### 2. Configure Endpoint
- **Endpoint URL**: `http://localhost:3000/stripe/webhook`
- **Events to send**: Select these events:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.canceled`
  - `payment_intent.requires_action`
  - `customer.created`
  - `payment_method.attached`

### 3. Get Webhook Secret
- After creating the endpoint, click on it
- In the "Signing secret" section, click "Reveal"
- Copy the secret (starts with `whsec_`)
- Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## 🧪 Testing Webhooks

### Option 1: Stripe CLI (Recommended for local testing)

```bash
# Install Stripe CLI
# Download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward events to your local server
stripe listen --forward-to localhost:3000/stripe/webhook

# This will show you the webhook secret to use in your .env
```

### Option 2: ngrok (For external testing)

```bash
# Install ngrok
npm install -g ngrok

# Expose your local server
ngrok http 3000

# Use the ngrok URL in Stripe dashboard
# Example: https://abc123.ngrok.io/stripe/webhook
```

## 📊 What the Webhooks Do

### Payment Success (`payment_intent.succeeded`)
- ✅ Mark order as `PAID`
- ✅ Set `paidAt` timestamp
- ✅ Convert reserved stock to sold
- ✅ Log payment method

### Payment Failed (`payment_intent.payment_failed`)
- ❌ Mark order as `PAYMENT_FAILED`
- ❌ Release reserved stock back to inventory
- ❌ Log error details

### Payment Canceled (`payment_intent.canceled`)
- 🚫 Mark order as `CANCELLED`
- 🚫 Release reserved stock
- 🚫 Log cancellation

### Payment Requires Action (`payment_intent.requires_action`)
- 🔄 Keep order as `PAYMENT_PROCESSING`
- 🔄 Wait for customer action (3D Secure, etc.)

## 🔒 Security Features

- ✅ **Signature Verification**: All webhooks are verified using Stripe signatures
- ✅ **Idempotency**: Prevents duplicate processing of same event
- ✅ **Error Handling**: Proper HTTP status codes returned to Stripe
- ✅ **Logging**: Comprehensive logging for debugging

## 🐛 Debugging

### Check Webhook Logs
```bash
# In your API logs, look for:
📨 Received webhook: payment_intent.succeeded (evt_1234567890)
✅ Order 1 marked as PAID and stock updated
```

### Test Webhook Endpoint
```bash
curl -X POST http://localhost:3000/stripe/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### Verify Stripe Events
- Go to Stripe Dashboard > Events
- Check if webhooks are being sent
- Look for delivery attempts and responses

## 🚀 Production Setup

1. **Use HTTPS**: Stripe requires HTTPS for production webhooks
2. **Environment Variables**: Set `STRIPE_WEBHOOK_SECRET` in production
3. **Rate Limiting**: Consider adding rate limiting to webhook endpoint
4. **Monitoring**: Set up alerts for webhook failures
5. **Idempotency**: Store processed event IDs in database for production 