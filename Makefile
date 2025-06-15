# Workout Tracker Development Commands
.PHONY: help install dev build test lint type-check db-up db-down db-setup db-reset db-status clean

# Default command - show help
help:
	@echo "Workout Tracker Development Commands:"
	@echo ""
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development server (checks DB status)"
	@echo "  make build       - Build for production"
	@echo "  make test        - Run tests"
	@echo "  make lint        - Run ESLint"
	@echo "  make type-check  - Run TypeScript type checking"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-up       - Start PostgreSQL with Docker"
	@echo "  make db-down     - Stop PostgreSQL container"
	@echo "  make db-setup    - Initialize database schema"
	@echo "  make db-reset    - Reset database completely"
	@echo "  make db-status   - Check database status"
	@echo ""
	@echo "  make clean       - Clean build artifacts and node_modules"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install --legacy-peer-deps

# Start development server with DB status check
dev: db-status
	@echo "Starting development server..."
	npm run dev

# Build for production
build:
	@echo "Building for production..."
	npm run build

# Run tests (if available)
test:
	@echo "Running tests..."
	@if [ -f "package.json" ] && grep -q '"test"' package.json; then \
		npm test; \
	else \
		echo "No test script found in package.json"; \
	fi

# Run linting
lint:
	@echo "Running ESLint..."
	npm run lint

# Run TypeScript type checking
type-check:
	@echo "Running TypeScript type check..."
	npx tsc --noEmit

# Start PostgreSQL with Docker
db-up:
	@echo "Starting PostgreSQL database..."
	docker-compose up -d
	@echo "Waiting for database to be ready..."
	@sleep 3
	@make db-status

# Stop PostgreSQL
db-down:
	@echo "Stopping PostgreSQL database..."
	docker-compose down

# Setup database schema
db-setup: db-up
	@echo "Setting up database schema..."
	@if [ -f ".env" ]; then \
		npx prisma db push; \
		echo "Database schema created successfully!"; \
	else \
		echo "Error: .env file not found. Please create it from .env.example"; \
		exit 1; \
	fi

# Reset database completely
db-reset:
	@echo "Resetting database..."
	@make db-down
	@echo "Removing database volume..."
	docker volume rm workout-tracker_postgres_data 2>/dev/null || true
	@make db-setup
	@echo "Database reset complete!"

# Check database status
db-status:
	@echo "Checking database status..."
	@if docker ps | grep -q workout-tracker-db; then \
		echo "✅ Database is running"; \
		docker exec workout-tracker-db pg_isready -U postgres | grep -q "accepting connections" && \
		echo "✅ Database is accepting connections" || \
		echo "⚠️  Database is starting up..."; \
	else \
		echo "⚠️  Database is not running"; \
		echo "💡 Run 'make db-up' to start the database"; \
		echo "🔄 The app will use localStorage as fallback"; \
	fi

# Clean build artifacts and dependencies
clean:
	@echo "Cleaning build artifacts..."
	rm -rf .next
	rm -rf node_modules
	rm -rf .turbo
	@echo "Clean complete!"

# Quick commands for common workflows
.PHONY: fresh setup

# Fresh start - clean, install, and setup database
fresh: clean
	@make install
	@make db-setup
	@echo "Fresh setup complete! Run 'make dev' to start developing."

# Initial setup for new developers
setup:
	@echo "Setting up Workout Tracker..."
	@if [ ! -f ".env" ]; then \
		cp .env.example .env; \
		echo "Created .env file from .env.example"; \
	fi
	@make install
	@make db-setup
	@echo ""
	@echo "✅ Setup complete!"
	@echo "Run 'make dev' to start the development server."