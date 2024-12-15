import {
  deleteProductRecord,
  manageSubscriptionStatusChange,
  upsertPriceRecord,
  upsertProductRecord
} from '@/utils/supabase/admin';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import { manageDiscordAccess } from '@/utils/discord/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-11-20.acacia',
  appInfo: {
    name: 'ai2saas',
    version: '0.1.0'
  }
});

const relevantEvents = new Set([
  'product.created',
  'product.updated',
  'product.deleted',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'billing_portal.session.created'
]);

export async function POST(request: Request) {
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  const body = await request.text();
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    // if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret!);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'product.created':
        case 'product.updated':
          await upsertProductRecord(event.data.object as Stripe.Product);
          break;
        case 'product.deleted':
          await deleteProductRecord(event.data.object as Stripe.Product);
          break;
        case 'price.created':
        case 'price.updated':
          await upsertPriceRecord(event.data.object as Stripe.Price);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription;
          const isActive =
            event.type !== 'customer.subscription.deleted' &&
            subscription.status === 'active';

          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === 'customer.subscription.created'
          );

          // Manage Discord access
          await manageDiscordAccess(subscription.customer as string, isActive);
          break;
        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session;
          if (checkoutSession.mode === 'subscription') {
            const subscriptionId = checkoutSession.subscription;
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            );

            // Add Discord access for new subscribers
            await manageDiscordAccess(checkoutSession.customer as string, true);
          }
          break;
        case 'billing_portal.session.created':
          const portalSession = event.data
            .object as Stripe.BillingPortal.Session;
          console.log('Billing portal session created:', portalSession.id);
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new NextResponse(
        'Webhook error: "Webhook handler failed. View logs."',
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
