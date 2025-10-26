# Rock Paper Scissors Web3 - Makefile

.PHONY: install build test deploy clean help

# Default target
help:
	@echo "Rock Paper Scissors Web3 - Available Commands:"
	@echo ""
	@echo "  make install     - Install all dependencies"
	@echo "  make build       - Build smart contracts"
	@echo "  make test        - Run contract tests"
	@echo "  make deploy      - Deploy to network"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make frontend    - Start frontend dev server"
	@echo "  make all         - Install, build, and test"
	@echo ""

# Install dependencies
install:
	@echo "Installing Foundry dependencies..."
	forge install
	@echo "Installing Frontend dependencies..."
	cd frontend && npm install
	@echo "✓ Installation complete!"

# Build contracts
build:
	@echo "Building contracts..."
	forge build
	@echo "✓ Build complete!"

# Run tests
test:
	@echo "Running tests..."
	forge test -vv
	@echo "✓ Tests complete!"

# Deploy contracts
deploy:
	@echo "Starting deployment..."
	bash scripts/deploy.sh

# Clean artifacts
clean:
	@echo "Cleaning artifacts..."
	bash scripts/clean.sh

# Start frontend
frontend:
	@echo "Starting frontend..."
	cd frontend && npm run dev

# Start local node (for testing)
node:
	anvil

# Full setup
all: install build test
	@echo "✓ Setup complete! Ready to deploy."

# Format code
format:
	forge fmt

# Run gas report
gas:
	forge test --gas-report

# Run coverage
coverage:
	forge coverage
