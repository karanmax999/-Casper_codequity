# Stage 1: Build the Odra Smart Contracts (Rust)
FROM rust:1.75 AS wasm-builder

# Install prerequisites for Odra
RUN rustup target add wasm32-unknown-unknown
RUN cargo install cargo-odra

WORKDIR /build

# Copy the contracts directory
COPY contracts ./contracts

# Build EscrowVault
WORKDIR /build/contracts/escrow-vault
RUN cargo odra build

# Build SAFEToken (optional, if used by backend)
WORKDIR /build/contracts/safe-token
RUN cargo odra build

# Stage 2: Build the Python Backend and install casper-client
FROM python:3.11-slim

# Install system dependencies needed for casper-client and Rust
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Rust toolchain to compile casper-client
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install casper-client via cargo (this will take a few minutes during the Docker build)
RUN cargo install casper-client

# Set up the Python application
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend ./backend

# Create a directory for the contracts to sit alongside the backend
RUN mkdir -p /app/contracts

# Copy the compiled WASM files from the builder stage
COPY --from=wasm-builder /build/contracts/escrow-vault/wasm/EscrowVault.wasm /app/contracts/escrow_vault.wasm
COPY --from=wasm-builder /build/contracts/safe-token/wasm/SafeToken.wasm /app/contracts/safe_token.wasm

# Expose the port (Railway provides $PORT)
EXPOSE 8000

# Run the FastAPI application
WORKDIR /app/backend
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
