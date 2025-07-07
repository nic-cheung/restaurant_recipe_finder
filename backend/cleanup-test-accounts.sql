-- Cleanup script for test accounts
-- Run this after testing signup flow to remove test accounts

-- Delete all related records first to maintain referential integrity
DELETE FROM user_recipes WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.local' OR email LIKE '%@test.dev'
);

DELETE FROM favorite_recipes WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.local' OR email LIKE '%@test.dev'
);

DELETE FROM user_preferences WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.local' OR email LIKE '%@test.dev'
);

-- Finally delete the test users
DELETE FROM users WHERE email LIKE '%@test.local' OR email LIKE '%@test.dev';

-- Show how many test accounts were removed
SELECT 'Cleanup completed. Test accounts removed.' AS message; 