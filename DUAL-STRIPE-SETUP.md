# Dual Stripe Accounts Setup Guide

## 🎯 Overview

This guide will help you complete the setup of dual Stripe accounts for backwards compatibility with your existing 4-5 subscribers while routing new customers to your new business bank account.

## 📋 Implementation Status

✅ **Completed:**
- Environment variables setup
- Stripe configuration updated for dual instances
- Client-side Stripe handling for both accounts
- Customer functions updated to route to correct account
- Checkout and portal functions updated
- Webhook handling for dual accounts
- Database schema updates prepared
- Pricing component updated for account detection

## 🔧 Required Setup Steps

### 1. Environment Variables Setup

Update your `.env.local` file with your old Stripe account credentials:

```env
# Replace these with your actual old Stripe account values
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LEGACY=pk_live_YOUR_OLD_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY_LEGACY=sk_live_YOUR_OLD_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET_LEGACY=whsec_YOUR_OLD_WEBHOOK_SECRET
```

### 2. Legacy User IDs Configuration

Add your 4-5 legacy user IDs to the following files:

**File 1: `lib/supabase/admin.ts`** (line 34-41)
```typescript
const LEGACY_USER_IDS = [
  'user-uuid-1',  // Replace with actual UUIDs
  'user-uuid-2',
  'user-uuid-3',
  'user-uuid-4',
  'user-uuid-5',
];
```

**File 2: `lib/stripe/helpers.ts`** (line 6-13)
```typescript
const LEGACY_USER_IDS = [
  'user-uuid-1',  // Must match admin.ts exactly
  'user-uuid-2',
  'user-uuid-3',
  'user-uuid-4',
  'user-uuid-5',
];
```

### 3. Database Schema Updates

Run the SQL commands in `database-updates.sql` in your Supabase SQL editor:

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `database-updates.sql`
3. Update the commented sections with your actual legacy user IDs
4. Execute the SQL

### 4. Stripe Webhook Configuration

You'll need to create separate webhook endpoints for each Stripe account:

**Old Stripe Account:**
1. Go to your old Stripe dashboard → Webhooks
2. Create a new endpoint: `https://your-domain.com/api/webhooks/route`
3. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `billing_portal.session.created`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET_LEGACY`

**New Stripe Account:**
1. Go to your new Stripe dashboard → Webhooks
2. Create a new endpoint: `https://your-domain.com/api/webhooks/route`
3. Select the same events as above
4. This should already be configured (your current webhook)

### 5. Testing Strategy

**Before deploying:**

1. **Test New Users (Default Flow):**
   - Create a test user (not in legacy list)
   - Test subscription signup
   - Verify checkout redirects to new Stripe account
   - Test customer portal access

2. **Test Legacy Users:**
   - Use one of your legacy user IDs
   - Test customer portal access
   - Verify it routes to old Stripe account

3. **Test Webhooks:**
   - Use Stripe CLI to test webhook delivery
   - Verify both accounts can process events

## 🚀 Deployment Steps

1. **Deploy Code Changes:**
   ```bash
   bun run build
   # Deploy to your hosting platform
   ```

2. **Update Environment Variables:**
   - Add legacy Stripe keys to production environment
   - Ensure webhook secrets are configured

3. **Run Database Updates:**
   - Execute `database-updates.sql` in production Supabase

4. **Test in Production:**
   - Test both new and legacy user flows
   - Monitor webhook delivery

## 🔍 How It Works

### New Users (Default)
1. User signs up → routed to new Stripe account
2. `stripe_account_type` set to `'new'` in database
3. All future operations use new Stripe instance

### Legacy Users
1. User ID checked against `LEGACY_USER_IDS`
2. `stripe_account_type` set to `'legacy'` in database
3. All operations use legacy Stripe instance

### Webhook Processing
1. Webhook received → try new Stripe secret first
2. If validation fails → try legacy Stripe secret
3. Process event with appropriate Stripe instance

## 📊 Monitoring

Monitor these areas after deployment:

1. **Webhook Delivery:** Check both Stripe dashboards
2. **Error Logs:** Watch for authentication errors
3. **Customer Portal:** Test access for both user types
4. **Subscription Management:** Verify both accounts work

## 🔧 Troubleshooting

**Common Issues:**

1. **Webhook Validation Errors:**
   - Check webhook secrets match environment variables
   - Verify webhook URLs are correct in both Stripe accounts

2. **Customer Portal Access:**
   - Ensure legacy users route to correct Stripe account
   - Check customer ID mapping in database

3. **Subscription Status:**
   - Verify subscription updates work for both accounts
   - Check database records have correct `stripe_account_type`

## 📞 Support

If you encounter issues:

1. Check browser console for client-side errors
2. Check server logs for webhook/API errors
3. Verify environment variables are set correctly
4. Test with Stripe CLI for webhook debugging

## 🎉 Benefits

Once complete, you'll have:
- Seamless backwards compatibility for existing subscribers
- New customers routed to your business bank account
- Unified codebase managing both Stripe accounts
- Flexible architecture for future account migrations