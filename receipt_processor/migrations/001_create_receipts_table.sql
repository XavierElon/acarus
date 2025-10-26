CREATE TABLE receipts (
    id UUID PRIMARY KEY,
    vendor_name TEXT NOT NULL,
    total_amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(3) NOT NULL,
    purchase_date TIMESTAMPTZ NOT NULL,
    receipt_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE receipt_items (
    id UUID PRIMARY KEY,
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DOUBLE PRECISION NOT NULL,
    total_price DOUBLE PRECISION NOT NULL
);

CREATE INDEX idx_receipts_vendor_name ON receipts(vendor_name);
CREATE INDEX idx_receipts_purchase_date ON receipts(purchase_date);
CREATE INDEX idx_receipt_items_receipt_id ON receipt_items(receipt_id);