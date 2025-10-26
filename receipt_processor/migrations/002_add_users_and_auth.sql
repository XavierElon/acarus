-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

-- Create API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

ALTER TABLE receipts ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index on user_id for faster queries
CREATE INDEX idx_receipts_user_id ON receipts(user_id);

-- Create index on user_id for faster queries
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);

-- Create index on user_id for faster queries
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Create index on expires_at for expired sessions cleanup
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Create index on expires_at for expired API keys cleanup
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);