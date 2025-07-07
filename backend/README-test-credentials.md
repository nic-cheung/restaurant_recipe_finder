# Test Credentials Generator

This script automatically generates unique test credentials for account creation testing, ensuring no conflicts with existing database entries.

## Usage

### Quick Generation
```bash
# From the backend directory
npm run test:credentials
```

### What it does:
1. **Checks Database**: Queries your Prisma database for existing email addresses
2. **Generates Unique Emails**: Creates new test emails that don't conflict with existing users
3. **Updates Documentation**: Automatically updates `../TEST_CREDENTIALS.md` with new credentials
4. **Logs Results**: Shows you what was generated

### Generated Credentials Format:
- **Email**: `test.{timestamp}.{random}@test.local`
- **Password**: `TestPass123!` (consistent for easy testing)
- **Name**: `Test User {last4digits}`

### Example Output:
```
🔍 Checking existing test credentials...
✅ Generated unique credentials: test.1703123456.789@test.local
✅ Generated unique credentials: test.1703123457.123@test.local
✅ Generated unique credentials: test.1703123458.456@test.local
✅ Generated unique credentials: test.1703123459.789@test.local
✅ Generated unique credentials: test.1703123460.321@test.local

📝 Generated 5 new test credentials:
1. test.1703123456.789@test.local | Test User 3456
2. test.1703123457.123@test.local | Test User 3457
3. test.1703123458.456@test.local | Test User 3458
4. test.1703123459.789@test.local | Test User 3459
5. test.1703123460.321@test.local | Test User 3460

✅ Updated TEST_CREDENTIALS.md with new credentials
🎉 Successfully updated test credentials!
📄 Check TEST_CREDENTIALS.md for the new credentials
```

## When to Use

### Before Testing Registration Flow:
```bash
npm run test:credentials
```
Then use the freshly generated credentials from `TEST_CREDENTIALS.md`

### After Database Reset:
If you've reset your database, run this to ensure you have fresh test credentials available.

### Regular Development:
Run this periodically to keep a fresh set of test credentials available for the team.

## Database Cleanup

The script only generates credentials - it doesn't create accounts. To clean up test accounts after testing:

```sql
-- Remove all test accounts
DELETE FROM user_recipes WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.local'
);
DELETE FROM favorite_recipes WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.local'
);
DELETE FROM user_preferences WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.local'
);
DELETE FROM users WHERE email LIKE '%@test.local';
```

Or use the cleanup script:
```bash
npx prisma db execute --file cleanup-test-accounts.sql
```

## Benefits

1. **No Conflicts**: Never worry about "email already exists" errors during testing
2. **Automated**: No manual credential creation needed
3. **Team Friendly**: Everyone gets fresh credentials automatically
4. **Documented**: Credentials are automatically added to your documentation
5. **Timestamp-based**: Easy to identify when credentials were generated 