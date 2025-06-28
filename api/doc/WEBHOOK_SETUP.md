# Stripe Webhook Setup Guide

## Overview
This implementation creates orders only after successful payment completion, eliminating orphaned orders and stock reservation issues.

## Local Development Setup

### 1. Install Stripe CLI
```bash
# macOS (using Homebrew)
brew install stripe/stripe-cli/stripe

# Or download from: https://github.com/stripe/stripe-cli/releases
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Forward Webhooks to Local Server
```bash
# Forward webhooks to your local API server
stripe listen --forward-to localhost:3000/orders/webhook

# This will output a webhook signing secret like:
# Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 4. Set Environment Variables
Add the webhook secret to your `.env` file:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

## Production Setup

### 1. Create Webhook Endpoint in Stripe Dashboard
1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/orders/webhook`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"

### 2. Get Webhook Signing Secret
1. In the webhook details page, click "Reveal" next to "Signing secret"
2. Copy the secret starting with `whsec_`
3. Add to your production environment variables

## How It Works

### 1. Order Creation Flow
```
User adds items to cart → 
Create payment intent (reserves stock) → 
User completes payment → 
Stripe sends webhook → 
Order marked as PAID
```

### 2. Webhook Events Handled
- **`payment_intent.succeeded`**: Order status → PAID, stock permanently reserved
- **`payment_intent.payment_failed`**: Order status → PAYMENT_FAILED, stock released back

### 3. Stock Management
- **Reserved**: Stock is held during payment processing
- **Permanent**: Stock is permanently allocated after successful payment
- **Released**: Stock is returned to available if payment fails

## Testing

### 1. Test Successful Payment
```bash
# Create a test payment intent
stripe payment_intents create --amount=1000 --currency=eur

# Simulate successful payment
stripe payment_intents confirm pi_xxxxxxxxxxxxx
```

### 2. Test Failed Payment
```bash
# Create a test payment intent
stripe payment_intents create --amount=1000 --currency=eur

# Simulate failed payment
stripe payment_intents cancel pi_xxxxxxxxxxxxx
```

### 3. Monitor Webhooks
```bash
# View webhook events
stripe events list

# View specific event
stripe events retrieve evt_xxxxxxxxxxxxx
```

## Benefits

1. **No Orphaned Orders**: Orders only exist after successful payment
2. **Clean Stripe Dashboard**: No pending/processing orders cluttering the view
3. **Automatic Stock Management**: Stock is properly managed based on payment status
4. **Reliable State**: Order status always reflects actual payment state
5. **Simplified Logic**: No need for complex cleanup or retry mechanisms

## Troubleshooting

### Webhook Not Receiving Events
1. Check if Stripe CLI is forwarding: `stripe listen --print-secret`
2. Verify webhook secret in environment variables
3. Check API server logs for webhook errors
4. Ensure endpoint URL is accessible

### Orders Not Being Created
1. Verify webhook events are being received
2. Check order service logs for payment intent lookup
3. Ensure stock is available for reservation
4. Verify Stripe customer ID exists

### Stock Issues
1. Check if stock is being properly reserved/released
2. Verify product stock quantities in database
3. Check for transaction rollbacks in logs 