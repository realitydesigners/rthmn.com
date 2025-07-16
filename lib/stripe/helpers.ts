// Helper functions for Stripe account detection

// Client-side helper to determine if a user is legacy (for pricing component)
export const isLegacyUserClient = (userId: string): boolean => {
  // This should match the same logic in lib/supabase/admin.ts
  const LEGACY_USER_IDS = [
    '851e1dab-50aa-44a9-b73f-08e4ef748ed6',
    '8ad039b3-d3a5-447b-bdda-80b9f854b0fe',
    'c3d7587a-31ff-4aa8-9d98-be63b8f6d613',
    '0ab91c3e-483b-46b0-afa7-64bad4df6da4',
    '50790fb7-4df9-4fb8-a4fa-a6cd9c1f3306',
    'bef0d6a5-ccb6-46c6-be68-aadad101b65f',
    'c8c40404-85fb-466f-ac22-c0ec255e171f',
  ];
  
  return LEGACY_USER_IDS.includes(userId);
};

// Server action to get user's Stripe account type
export async function getUserStripeAccountType(userId: string): Promise<'new' | 'legacy'> {
  // Import the server-side function
  const { isLegacyUser } = await import('@/lib/supabase/admin');
  const isLegacy = await isLegacyUser(userId);
  return isLegacy ? 'legacy' : 'new';
}