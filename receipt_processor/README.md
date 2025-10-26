# Receipt Processor

A Rust application that processes and centralizes receipt data so people don't have to keep physical receipts.

## Features

- Web API for receipt management
- Receipt data processing
- Centralized storage
- RESTful endpoints

## Project Structure

```
receipt_processor/
├── Cargo.toml                 # Project configuration and dependencies
├── src/
│   ├── main.rs               # Application entry point
│   ├── models/               # Data structures
│   │   ├── mod.rs           # Module declaration
│   │   └── receipt.rs       # Receipt data structure
│   ├── handlers/             # Request handlers
│   │   ├── mod.rs           # Module declaration
│   │   └── receipt_handlers.rs # HTTP endpoint handlers
│   ├── services/             # Business logic
│   │   ├── mod.rs           # Module declaration
│   │   └── receipt_service.rs # Receipt processing logic
│   ├── database/             # Database operations
│   │   ├── mod.rs           # Module declaration
│   │   └── connection.rs     # Database connection setup
│   └── utils/                # Helper functions
│       ├── mod.rs            # Module declaration
│       └── date_parser.rs    # Date parsing utilities
├── migrations/                # Database schema changes
├── tests/                     # Test files
└── .env                      # Environment variables
```

## Prerequisites

- Rust (1.70 or later) - [Install Rust](https://rustup.rs/)
- Cargo (comes with Rust)

## How to Run the Application

### 1. Build the application

First time setup or after making code changes:

```bash
cargo build
```

This will:

- Download all dependencies from crates.io
- Compile your Rust code
- Create an executable in `target/debug/receipt_processor`

### 2. Run the application

```bash
cargo run
```

You should see:

```
Starting Receipt Processor...
Server running on http://127.0.0.1:3000
```

### 3. Test the application

Once running, you can test the endpoints:

**Using a web browser:**

- Visit http://localhost:3000/
- Visit http://localhost:3000/health

**Using curl:**

```bash
# Root endpoint
curl http://localhost:3000/

# Health check
curl http://localhost:3000/health
```

### 4. Stop the application

Press `Ctrl+C` in the terminal where the server is running.

## Useful Cargo Commands

```bash
# Quick compile check (faster than build)
cargo check

# Build optimized release version
cargo build --release

# Run tests
cargo test

# Format code
cargo fmt

# Check for common mistakes
cargo clippy

# Update dependencies
cargo update

# Clean build artifacts
cargo clean
```

## API Endpoints

Currently available endpoints:

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

## Development

This is a learning project for understanding Rust fundamentals including:

- Ownership and borrowing
- Async/await
- Error handling with `Result<T, E>`
- Modules and code organization
- Web frameworks (Axum)
- JSON serialization/deserialization

## Next Steps

- Add database integration
- Implement receipt CRUD operations
- Add image processing for receipt photos
- Implement OCR for text extraction
- Add user authentication
