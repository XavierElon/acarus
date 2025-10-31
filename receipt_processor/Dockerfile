# Multi-stage build for Rust backend

# Stage 1: Build dependencies
FROM rust:1.82-slim AS deps
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo fetch && \
    rm -rf src

# Stage 2: Build the application
FROM rust:1.82-slim AS builder
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY Cargo.toml Cargo.lock ./
COPY migrations migrations/

# Copy source code
COPY src src/

# Build the application
RUN cargo build --release

# Stage 3: Runtime image
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/target/release/receipt_processor /usr/local/bin/receipt_processor
COPY --from=builder /app/migrations /app/migrations

# Create a non-root user
RUN useradd -m -u 1000 rustuser && \
    chown -R rustuser:rustuser /app

USER rustuser

# Expose the port the app runs on
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["receipt_processor"]

