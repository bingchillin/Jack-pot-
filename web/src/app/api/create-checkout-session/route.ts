import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeKey = "sk_test_51RcrKKRvWLFjv3oeXjJR6w7OVXgS8BX7CAyERO1Q2UkiJ7xyBgmf480sSGgEYz5OPyTl3i2klYPkccw0ofeUswGd00IbXGIsj0";

// Debug log to check if the Stripe secret key is being read
console.log('DEBUG STRIPE_SECRET_KEY:', stripeKey ? 'Key is set' : 'Key is missing');

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

    const { returnUrl, items, personId, locale } = body;

    if (!returnUrl || !items || !personId) {
      console.error('Missing required parameters:', { returnUrl, items, personId });
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    console.log('Creating checkout session with:', {
      returnUrl,
      items,
      personId,
      locale: locale || 'en'
    });

    // Create line items for Stripe checkout
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur', // Use EUR to match backend currency
        product_data: {
          name: item.product.name,
          description: item.product.description,
          images: item.product.imageUrl ? [item.product.imageUrl] : undefined,
        },
        unit_amount: Math.round(item.product.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create a checkout session WITHOUT payment intent
    // Payment intent will be created only when user actually pays
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: returnUrl,
      cancel_url: returnUrl.replace('order-success', 'cart'),
      metadata: {
        personId: personId.toString(),
        locale: locale || 'en',
        items: JSON.stringify(items.map((item: any) => ({
          productId: item.product.idProduct,
          quantity: item.quantity,
        }))),
      },
      // This ensures payment intent is created only when payment is submitted
      payment_intent_data: {
        capture_method: 'automatic',
        metadata: {
          personId: personId.toString(),
          locale: locale || 'en',
          items: JSON.stringify(items.map((item: any) => ({
            productId: item.product.idProduct,
            quantity: item.quantity,
          }))),
        },
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