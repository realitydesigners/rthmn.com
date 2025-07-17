// Helper functions for Stripe account detection

// Client-side helper to determine if a user is legacy
// Since we can't do async database calls client-side easily, we assume all existing users are legacy
// The server-side logic (which runs first) will handle the actual database lookup
export const isLegacyUserClient = (userId: string): boolean => {
  // For client-side, we assume legacy to be safe. 
  // The server-side checkout creation handles the real logic.
  // This primarily affects which Stripe.js instance loads for redirectToCheckout
  return true; // Safe default - server-side logic is authoritative
};

// Server action to get user's Stripe account type
export async function getUserStripeAccountType(userId: string): Promise<'new' | 'legacy'> {
  // Import the server-side function
  const { isLegacyUser } = await import('@/lib/supabase/admin');
  const isLegacy = await isLegacyUser(userId);
  return isLegacy ? 'legacy' : 'new';
}