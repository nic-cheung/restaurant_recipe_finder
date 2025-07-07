# Test Credentials

## Quick Reference
Use these pre-defined credentials for testing different scenarios without having to think up new ones each time.

## 🧪 SIGNUP FLOW TESTING - Disposable Test Emails
**Use these for testing registration flow repeatedly (feel free to delete from database after testing):**

### Quick Test Emails - Registration Flow
- **Email**: `test.signup1@test.local`
- **Password**: `TestPass123!`
- **Name**: `Test User One`

- **Email**: `test.signup2@test.local`
- **Password**: `TestPass123!`
- **Name**: `Test User Two`

- **Email**: `test.signup3@test.local`
- **Password**: `TestPass123!`
- **Name**: `Test User Three`

- **Email**: `test.signup4@test.local`
- **Password**: `TestPass123!`
- **Name**: `Test User Four`

- **Email**: `test.signup5@test.local`
- **Password**: `TestPass123!`
- **Name**: `Test User Five`

### Even Simpler Test Emails
- **Email**: `test@test.dev`
- **Password**: `Test123!`
- **Name**: `Test User`

- **Email**: `demo@test.dev`
- **Password**: `Test123!`
- **Name**: `Demo User`

- **Email**: `signup@test.dev`
- **Password**: `Test123!`
- **Name**: `Signup Test`

### 🗑️ Easy Database Cleanup
To remove all test accounts after testing:
```sql
-- Delete test accounts (safe to run anytime)
DELETE FROM user_recipes WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.local' OR email LIKE '%@test.dev'
);
DELETE FROM favorite_recipes WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.local' OR email LIKE '%@test.dev'
);
DELETE FROM user_preferences WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.local' OR email LIKE '%@test.dev'
);
DELETE FROM users WHERE email LIKE '%@test.local' OR email LIKE '%@test.dev';
```

Or use this one-liner in your terminal:
```bash
# Quick cleanup of test accounts
npx prisma db execute --file cleanup-test-accounts.sql
```

## 🔄 Registration Flow Testing
**Use these for testing the multi-step registration process:**

### Test User 1 - Registration Flow (FRESH - Available)
- **Email**: `fresh.user.2024@example.com`
- **Password**: `TestPass123!`
- **Name**: `Fresh User 2024`
- **Purpose**: Testing new user registration flow

### Test User 2 - Registration Flow (FRESH - Alternative)
- **Email**: `brand.new.user@example.com`
- **Password**: `NewUser2024!`
- **Name**: `Brand New User`
- **Purpose**: Alternative registration testing

### Test User 3 - Registration Flow (FRESH - Backup)
- **Email**: `registration.test.2024@example.com`
- **Password**: `RegTest2024!`
- **Name**: `Registration Test 2024`
- **Purpose**: Backup registration testing

## 👤 Established User Accounts (May Already Exist)
**Use these for testing logged-in user features:**

### Test User 4 - Main Testing Account
- **Email**: `main.tester@example.com`
- **Password**: `MainTest123!`
- **Name**: `Main Tester`
- **Purpose**: Primary account for testing logged-in features

### Test User 5 - Preferences Testing
- **Email**: `preferences.user@example.com`
- **Password**: `PrefTest123!`
- **Name**: `Preferences User`
- **Purpose**: Testing preferences management and updates

### Test User 6 - Recipe Testing
- **Email**: `recipe.chef@example.com`
- **Password**: `RecipeTest123!`
- **Name**: `Recipe Chef`
- **Purpose**: Testing recipe generation and management

## 🧪 Special Testing Scenarios

### Test User 7 - Edge Cases
- **Email**: `edge.case@example.com`
- **Password**: `EdgeCase123!`
- **Name**: `Edge Case Tester`
- **Purpose**: Testing edge cases and error handling

### Test User 8 - Mobile Testing
- **Email**: `mobile.user@example.com`
- **Password**: `MobileTest123!`
- **Name**: `Mobile User`
- **Purpose**: Testing mobile responsiveness and touch interactions

## 📋 Testing Workflows

### Registration Flow Testing
1. Use **Test User 1, 2, or 3** credentials (fresh emails)
2. If account already exists, try the next fresh email
3. Complete all registration steps
4. Verify automatic login after registration

### Logged-In Feature Testing
1. Use **Test User 4, 5, or 6** depending on feature
2. These may be pre-registered accounts
3. Test various logged-in scenarios

### Quick Login for Development
**Fastest login for quick testing:**
- Email: `dev@test.com`
- Password: `Dev123!`
- Name: `Dev User`

## 🔧 Database Management

### To Reset Test Data
If you need to clear test accounts from the database:
```sql
-- Delete specific test users
DELETE FROM users WHERE email LIKE '%@example.com';
DELETE FROM users WHERE email = 'dev@test.com';
```

### To Create Pre-Registered Accounts
You can manually register these accounts once, then reuse them for testing logged-in features.

## 📝 Notes
- All passwords meet complexity requirements (8+ chars, uppercase, lowercase, number, special char)
- Email domains use `@example.com` to clearly identify test accounts
- Names are descriptive of their testing purpose
- Fresh emails (Test User 1-3) are verified available as of last update
- Keep this file updated as you add new test scenarios 