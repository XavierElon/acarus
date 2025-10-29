-- Migration: Seed test users and mock receipt data
-- This adds test users with realistic receipt data for testing

-- Test users with bcrypt hashed passwords (DEFAULT_COST = 10)
-- Passwords match the MOCK_USERS.md file

-- User 1: admin@example.com / admin123
INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@example.com', '$2b$12$Sgy02ExdeckiCeD1yecDs.HRlWqEPJrM3WqMd9IZK1TcQnkbJlO9K', NOW(), NOW());

-- User 2: test@example.com / password123
INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'test@example.com', '$2b$12$oRIGi/6FGxoLtIad/OPWAuvE/35O4LORrh4nsSkjgO.oFrt2fYTCa', NOW(), NOW());

-- User 3: demo@example.com / demo123
INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES
('750e8400-e29b-41d4-a716-446655440002', 'demo@example.com', '$2b$12$NO7IaiDyepVZo7awiQSPZ.INCCmwB/YwPlOS.P6I.KlALLvLOXmdm', NOW(), NOW());

-- User 4: john@example.com / john123
INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES
('850e8400-e29b-41d4-a716-446655440003', 'john@example.com', '$2b$12$EgX3a2ecmEt0e9ip5261p.WTr4YcHgUl3d4ZnA1jRxqVWhef/oZzi', NOW(), NOW());

-- User 5: jane@example.com / jane123
INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES
('950e8400-e29b-41d4-a716-446655440004', 'jane@example.com', '$2b$12$NOp5oNSamlmGyqK5z1hMYOvSOnjcHuR5v7qVAkPesP5stJz8CW.pa', NOW(), NOW());

-- Business Receipt 1 (Admin User)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('a100e840-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'WeWork', 125.00, 'USD', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'a100e840-e29b-41d4-a716-446655440000', 'Office Space', 1, 125.00, 125.00);

-- Business Receipt 2 (Admin User)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('a101e840-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Hilton Hotel', 250.00, 'USD', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'a101e840-e29b-41d4-a716-446655440001', 'Hotel Room', 2, 100.00, 200.00),
(gen_random_uuid(), 'a101e840-e29b-41d4-a716-446655440001', 'Room Service', 1, 50.00, 50.00);

-- Personal Receipt 1 (Test User)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('b200e840-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440001', 'Starbucks Coffee', 8.05, 'USD', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'b200e840-e29b-41d4-a716-446655440000', 'Grande Latte', 1, 4.95, 4.95),
(gen_random_uuid(), 'b200e840-e29b-41d4-a716-446655440000', 'Blueberry Muffin', 1, 2.50, 2.50);

-- Shopping Receipt (Test User)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('b201e840-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Target', 45.67, 'USD', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'b201e840-e29b-41d4-a716-446655440001', 'Paper Towels', 2, 8.99, 17.98),
(gen_random_uuid(), 'b201e840-e29b-41d4-a716-446655440001', 'Laundry Detergent', 1, 12.99, 12.99),
(gen_random_uuid(), 'b201e840-e29b-41d4-a716-446655440001', 'Bananas', 1, 3.99, 3.99),
(gen_random_uuid(), 'b201e840-e29b-41d4-a716-446655440001', 'Milk', 1, 4.99, 4.99);

-- Transportation Receipt (Test User)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('b202e840-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Shell Gas Station', 52.30, 'USD', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'b202e840-e29b-41d4-a716-446655440002', 'Regular Gas', 1, 45.00, 45.00),
(gen_random_uuid(), 'b202e840-e29b-41d4-a716-446655440002', 'Car Wash', 1, 7.30, 7.30);

-- Entertainment Receipt (Demo User)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('c300e840-e29b-41d4-a716-446655440000', '750e8400-e29b-41d4-a716-446655440002', 'AMC Theaters', 28.50, 'USD', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'c300e840-e29b-41d4-a716-446655440000', 'Adult Ticket', 2, 12.00, 24.00),
(gen_random_uuid(), 'c300e840-e29b-41d4-a716-446655440000', 'Popcorn', 1, 4.50, 4.50);

-- Healthcare Receipt (Demo User)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('c301e840-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', 'CVS Pharmacy', 23.45, 'USD', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'c301e840-e29b-41d4-a716-446655440001', 'Prescription', 1, 15.00, 15.00),
(gen_random_uuid(), 'c301e840-e29b-41d4-a716-446655440001', 'Pain Reliever', 1, 8.45, 8.45);

-- Family Shopping Receipt (John User)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('d400e840-e29b-41d4-a716-446655440000', '850e8400-e29b-41d4-a716-446655440003', 'Walmart', 89.99, 'USD', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'd400e840-e29b-41d4-a716-446655440000', 'Groceries', 1, 45.00, 45.00),
(gen_random_uuid(), 'd400e840-e29b-41d4-a716-446655440000', 'Kids Meal', 3, 8.00, 24.00),
(gen_random_uuid(), 'd400e840-e29b-41d4-a716-446655440000', 'Household Items', 1, 20.99, 20.99);

-- Health & Wellness Receipt (Jane User)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('e500e840-e29b-41d4-a716-446655440000', '950e8400-e29b-41d4-a716-446655440004', 'Whole Foods', 67.50, 'USD', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'e500e840-e29b-41d4-a716-446655440000', 'Organic Produce', 1, 25.00, 25.00),
(gen_random_uuid(), 'e500e840-e29b-41d4-a716-446655440000', 'Protein Powder', 1, 35.00, 35.00),
(gen_random_uuid(), 'e500e840-e29b-41d4-a716-446655440000', 'Vitamins', 1, 7.50, 7.50);

-- Additional frequently purchased items for demo user
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('c302e840-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 'Dunkin'' Donuts', 6.50, 'USD', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'c302e840-e29b-41d4-a716-446655440002', 'Coffee', 1, 4.00, 4.00),
(gen_random_uuid(), 'c302e840-e29b-41d4-a716-446655440002', 'Donut', 2, 1.25, 2.50);

-- More test receipts for test user
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('b203e840-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'Amazon', 34.99, 'USD', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'b203e840-e29b-41d4-a716-446655440003', 'Electronics', 1, 34.99, 34.99);

-- Uber ride for test user
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('b204e840-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', 'Uber', 15.75, 'USD', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'b204e840-e29b-41d4-a716-446655440004', 'Ride Share', 1, 15.75, 15.75);

-- ============================================
-- ADDITIONAL RECEIPTS TO REACH 15+ PER USER
-- ============================================

-- ADMIN USER: Add 13 more receipts (currently has 2)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('a102e840-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Regus', 145.00, 'USD', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('a103e840-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'FedEx', 28.50, 'USD', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
('a104e840-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Marriott', 185.75, 'USD', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
('a105e840-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Office Depot', 67.99, 'USD', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
('a106e840-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440000', 'Staples', 45.33, 'USD', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days', NOW() - INTERVAL '22 days'),
('a107e840-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440000', 'Delta Airlines', 425.50, 'USD', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
('a108e840-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440000', 'UPS Store', 12.75, 'USD', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'),
('a109e840-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', 'Expensify', 89.00, 'USD', NOW() - INTERVAL '32 days', NOW() - INTERVAL '32 days', NOW() - INTERVAL '32 days'),
('a110e840-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'QuickBooks', 299.00, 'USD', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'),
('a111e840-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Hilton Hotel', 210.00, 'USD', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days'),
('a112e840-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Uber Business', 35.60, 'USD', NOW() - INTERVAL '42 days', NOW() - INTERVAL '42 days', NOW() - INTERVAL '42 days'),
('a113e840-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Lyft Business', 28.45, 'USD', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days'),
('a114e840-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440000', 'Business Dinner', 125.50, 'USD', NOW() - INTERVAL '48 days', NOW() - INTERVAL '48 days', NOW() - INTERVAL '48 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'a102e840-e29b-41d4-a716-446655440002', 'Coworking Space', 1, 145.00, 145.00),
(gen_random_uuid(), 'a103e840-e29b-41d4-a716-446655440003', 'Shipping Services', 1, 28.50, 28.50),
(gen_random_uuid(), 'a104e840-e29b-41d4-a716-446655440004', 'Hotel Room', 2, 85.00, 170.00),
(gen_random_uuid(), 'a104e840-e29b-41d4-a716-446655440004', 'WiFi Access', 1, 15.75, 15.75),
(gen_random_uuid(), 'a105e840-e29b-41d4-a716-446655440005', 'Office Supplies', 1, 67.99, 67.99),
(gen_random_uuid(), 'a106e840-e29b-41d4-a716-446655440006', 'Printer Paper', 5, 8.00, 40.00),
(gen_random_uuid(), 'a106e840-e29b-41d4-a716-446655440006', 'Ink Cartridge', 1, 5.33, 5.33),
(gen_random_uuid(), 'a107e840-e29b-41d4-a716-446655440007', 'Flight Ticket', 1, 425.50, 425.50),
(gen_random_uuid(), 'a108e840-e29b-41d4-a716-446655440008', 'Packaging Service', 1, 12.75, 12.75),
(gen_random_uuid(), 'a109e840-e29b-41d4-a716-446655440009', 'Software License', 1, 89.00, 89.00),
(gen_random_uuid(), 'a110e840-e29b-41d4-a716-446655440010', 'Accounting Software', 1, 299.00, 299.00),
(gen_random_uuid(), 'a111e840-e29b-41d4-a716-446655440011', 'Hotel Room', 1, 180.00, 180.00),
(gen_random_uuid(), 'a111e840-e29b-41d4-a716-446655440011', 'Room Service', 1, 30.00, 30.00),
(gen_random_uuid(), 'a112e840-e29b-41d4-a716-446655440012', 'Business Ride', 1, 35.60, 35.60),
(gen_random_uuid(), 'a113e840-e29b-41d4-a716-446655440013', 'Business Ride', 1, 28.45, 28.45),
(gen_random_uuid(), 'a114e840-e29b-41d4-a716-446655440014', 'Client Meal', 1, 125.50, 125.50);
