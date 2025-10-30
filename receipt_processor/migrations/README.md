# Database Migrations

This directory contains SQL migration files for the Receipt Processor database.

## Migration Files

1. **001_create_receipts_table.sql** - Creates the initial receipts and receipt_items tables
2. **002_add_users_and_auth.sql** - Adds user authentication and updates receipts with user_id
3. **003_seed_test_data.sql** - Seeds test users and mock receipt data

## Running Migrations

### Apply all migrations manually:

```bash
# Connect to your database
psql -h localhost -U your_username -d receipt_processor

# Run migrations in order
\i migrations/001_create_receipts_table.sql
\i migrations/002_add_users_and_auth.sql
\i migrations/003_seed_test_data.sql
```

### Or use a migration tool:

```bash
# Using psql
psql -h localhost -U your_username -d receipt_processor -f migrations/001_create_receipts_table.sql
psql -h localhost -U your_username -d receipt_processor -f migrations/002_add_users_and_auth.sql
psql -h localhost -U your_username -d receipt_processor -f migrations/003_seed_test_data.sql
```

## Test Users

The migration `003_seed_test_data.sql` creates the following test users:

| Email               | Password      | User ID                              | Notes                                        |
| ------------------- | ------------- | ------------------------------------ | -------------------------------------------- |
| `admin@example.com` | `admin123`    | 550e8400-e29b-41d4-a716-446655440000 | Business-focused user with office expenses   |
| `test@example.com`  | `password123` | 650e8400-e29b-41d4-a716-446655440001 | Typical user with mixed expenses             |
| `demo@example.com`  | `demo123`     | 750e8400-e29b-41d4-a716-446655440002 | Frequent spender with lots of transactions   |
| `john@example.com`  | `john123`     | 850e8400-e29b-41d4-a716-446655440003 | Family-oriented user with larger purchases   |
| `jane@example.com`  | `jane123`     | 950e8400-e29b-41d4-a716-446655440004 | Health-conscious user with wellness expenses |

## Test Receipt Data

Each user has realistic receipt data including:

- Business expenses (WeWork, Hotels)
- Food & Dining (Starbucks, Dunkin Donuts)
- Shopping (Target, Walmart, Amazon)
- Transportation (Uber, Gas Stations)
- Entertainment (Movie Theaters)
- Healthcare (CVS Pharmacy, Prescriptions)
- Health & Wellness (Whole Foods, Organic products)

## Regenerating Password Hashes

If you need to generate new password hashes, use the built-in binary:

```bash
cargo run --bin hash_passwords
```

This will output bcrypt hashes for all test passwords that you can use in migration files.

## Resetting Test Data

To reset all test data:

```sql
-- WARNING: This will delete all data!
DELETE FROM receipt_items;
DELETE FROM receipts;
DELETE FROM users;
```

Then re-run the migration files.

## Notes

- All test data is intended for development and testing only
- Password hashes use bcrypt with DEFAULT_COST (12 rounds)
- Receipt dates are calculated relative to NOW() to ensure they're always recent
- UUIDs are consistent across runs for testing reproducibility
