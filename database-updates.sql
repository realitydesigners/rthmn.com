-- Database schema updates for dual Stripe accounts support
-- Run these commands in your Supabase SQL editor

-- 1. Add stripe_account_type column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_account_type VARCHAR(10) DEFAULT 'new';

-- 2. Add stripe_account_type column to users table (optional, for future use)
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_type VARCHAR(10) DEFAULT 'new';

-- 3. Update existing customers to 'legacy' status
UPDATE customers SET stripe_account_type = 'legacy' WHERE id IN (
  '851e1dab-50aa-44a9-b73f-08e4ef748ed6',
  '8ad039b3-d3a5-447b-bdda-80b9f854b0fe',
  'c3d7587a-31ff-4aa8-9d98-be63b8f6d613',
  '0ab91c3e-483b-46b0-afa7-64bad4df6da4',
  '50790fb7-4df9-4fb8-a4fa-a6cd9c1f3306',
  'bef0d6a5-ccb6-46c6-be68-aadad101b65f',
  'c8c40404-85fb-466f-ac22-c0ec255e171f'
);

-- 4. Update existing users to 'legacy' status (optional)
UPDATE users SET stripe_account_type = 'legacy' WHERE id IN (
  '851e1dab-50aa-44a9-b73f-08e4ef748ed6',
  '8ad039b3-d3a5-447b-bdda-80b9f854b0fe',
  'c3d7587a-31ff-4aa8-9d98-be63b8f6d613',
  '0ab91c3e-483b-46b0-afa7-64bad4df6da4',
  '50790fb7-4df9-4fb8-a4fa-a6cd9c1f3306',
  'bef0d6a5-ccb6-46c6-be68-aadad101b65f',
  'c8c40404-85fb-466f-ac22-c0ec255e171f'
);

-- 5. Create an index on stripe_account_type for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_stripe_account_type ON customers(stripe_account_type);
CREATE INDEX IF NOT EXISTS idx_users_stripe_account_type ON users(stripe_account_type);

-- 6. Add a comment to document the change
COMMENT ON COLUMN customers.stripe_account_type IS 'Indicates which Stripe account this customer belongs to: new or legacy';
COMMENT ON COLUMN users.stripe_account_type IS 'Indicates which Stripe account this user belongs to: new or legacy';