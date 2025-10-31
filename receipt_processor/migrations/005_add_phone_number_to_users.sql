ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);

-- Update existing users with phone numbers
-- Format: +1 followed by a variation of their user ID digits for uniqueness
UPDATE users SET phone_number = '+15508400000' WHERE id = '550e8400-e29b-41d4-a716-446655440000'; -- admin@example.com
UPDATE users SET phone_number = '+16508400001' WHERE id = '650e8400-e29b-41d4-a716-446655440001'; -- test@example.com
UPDATE users SET phone_number = '+17508400002' WHERE id = '750e8400-e29b-41d4-a716-446655440002'; -- demo@example.com
UPDATE users SET phone_number = '+18508400003' WHERE id = '850e8400-e29b-41d4-a716-446655440003'; -- john@example.com
UPDATE users SET phone_number = '+19508400004' WHERE id = '950e8400-e29b-41d4-a716-446655440004'; -- jane@example.com

-- Now make the column NOT NULL (since all existing users have phone numbers)
ALTER TABLE users ALTER COLUMN phone_number SET NOT NULL;

CREATE UNIQUE INDEX idx_users_phone_number ON users(phone_number);