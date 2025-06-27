import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeKey = "sk_test_51RcrKKRvWLFjv3oeXjJR6w7OVXgS8BX7CAyERO1Q2UkiJ7xyBgmf480sSGgEYz5OPyTl3i2klYPkccw0ofeUswGd00IbXGIsj0"

// Debug log to check if the Stripe secret key is being read
console.log('DEBUG STRIPE_SECRET_KEY:', stripeKey);

// Check if Stripe secret key is available
if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(stripeKey || '', {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY is missing');
      return NextResponse.json(
        { error: 'Stripe is not properly configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);

    const { paymentIntentId, orderId, returnUrl, items } = body;

    if (!paymentIntentId || !orderId || !returnUrl) {
      console.error('Missing required parameters:', { paymentIntentId, orderId, returnUrl });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Creating checkout session with:', {
      paymentIntentId,
      orderId,
      returnUrl,
      items
    });

    // Create line items for Stripe checkout
    const lineItems = items ? items.map((item: any) => ({
      price_data: {
        currency: 'usd', // You might want to make this dynamic
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: item.product.imageUrl ? [item.product.imageUrl] : undefined,
        },
        unit_amount: Math.round(item.product.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    })) : [];

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: returnUrl,
      cancel_url: returnUrl.replace('order-success', 'cart'),
      metadata: {
        orderId: orderId.toString(),
        paymentIntentId: paymentIntentId,
      },
    });

    console.log('Checkout session created:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Return a proper error response
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 