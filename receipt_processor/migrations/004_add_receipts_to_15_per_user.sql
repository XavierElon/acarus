-- Migration: Add receipts to reach 15+ per user for remaining users
-- admin@example.com already has 15 receipts ✓

-- DEMO USER: Add 12 more receipts (currently has 3, needs 12 more = 15)
INSERT INTO receipts (id, user_id, vendor_name, total_amount, currency, purchase_date, created_at, updated_at) VALUES
('c303e840-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440002', 'Dunkin Donuts', 4.50, 'USD', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('c304e840-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 'Shell Gas Station', 32.15, 'USD', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('c305e840-e29b-41d4-a716-446655440005', '750e8400-e29b-41d4-a716-446655440002', '7-Eleven', 5.67, 'USD', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('c306e840-e29b-41d4-a716-446655440006', '750e8400-e29b-41d4-a716-446655440002', 'Burger King', 9.87, 'USD', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('c307e840-e29b-41d4-a716-446655440007', '750e8400-e29b-41d4-a716-446655440002', 'Uber', 12.45, 'USD', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('c308e840-e29b-41d4-a716-446655440008', '750e8400-e29b-41d4-a716-446655440002', 'Lyft', 9.50, 'USD', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
('c309e840-e29b-41d4-a716-446655440009', '750e8400-e29b-41d4-a716-446655440002', 'McDonalds', 6.99, 'USD', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('c310e840-e29b-41d4-a716-446655440010', '750e8400-e29b-41d4-a716-446655440002', 'CVS Pharmacy', 15.33, 'USD', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days', NOW() - INTERVAL '11 days'),
('c311e840-e29b-41d4-a716-446655440011', '750e8400-e29b-41d4-a716-446655440002', 'Taco Bell', 7.45, 'USD', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'),
('c312e840-e29b-41d4-a716-446655440012', '750e8400-e29b-41d4-a716-446655440002', 'Wendys', 8.67, 'USD', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days'),
('c313e840-e29b-41d4-a716-446655440013', '750e8400-e29b-41d4-a716-446655440002', 'Dunkin Donuts', 4.25, 'USD', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days'),
('c314e840-e29b-41d4-a716-446655440014', '750e8400-e29b-41d4-a716-446655440002', '7-Eleven', 6.89, 'USD', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days');

INSERT INTO receipt_items (id, receipt_id, name, quantity, unit_price, total_price) VALUES
(gen_random_uuid(), 'c303e840-e29b-41d4-a716-446655440003', 'Coffee', 1, 3.50, 3.50),
(gen_random_uuid(), 'c303e840-e29b-41d4-a716-446655440003', 'Donut', 1, 1.00, 1.00),
(gen_random_uuid(), 'c306e840-e29b-41d4-a716-446655440006', 'Whopper Meal', 1, 9.87, 9.87),
(gen_random_uuid(), 'c304e840-e29b-41d4-a716-446655440004', 'Car Wash', 1, 2.15, 2.15),
(gen_random_uuid(), 'c305e840-e29b-41d4-a716-446655440005', 'Snacks', 1, 5.67, 5.67),
(gen_random_uuid(), 'c309e840-e29b-41d4-a716-446655440009', 'Happy Meal', 1, 6.99, 6.99),
(gen_random_uuid(), 'c307e840-e29b-41d4-a716-446655440007', 'Ride Share', 1, 12.45, 12.45),
(gen_random_uuid(), 'c308e840-e29b-41d4-a716-446655440008', 'Ride Share', 1, 9.50, 9.50),
(gen_random_uuid(), 'c309e840-e29b-41d4-a716-446655440009', 'Happy Meal', 1, 6.99, 6.99),
(gen_random_uuid(), 'c310e840-e29b-41d4-a716-446655440010', 'Medicine', 1, 15.33, 15.33),
(gen_random_uuid(), 'c311e840-e29b-41d4-a716-446655440011', 'Taco Box', 1, 7.45, 7.45),
(gen_random_uuid(), 'c312e840-e29b-41d4-a716-446655440012', 'Baconator', 1, 8.67, 8.67),
(gen_random_uuid(), 'c313e840-e29b-41d4-a716-446655440013', 'Coffee', 1, 4.25, 4.25),
(gen_random_uuid(), 'c314e840-e29b-41d4-a716-446655440014', 'Drinks', 1, 6.89, 6.89);

