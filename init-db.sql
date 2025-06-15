-- Initialize the workout_tracker database
-- This file is executed when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
-- (This is handled by POSTGRES_DB environment variable)

-- Set up any initial database configuration
-- Enable UUID extension (useful for generating unique IDs)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can add any initial data or configuration here
-- For example, default workout templates, exercise categories, etc.

-- This file is optional and can be empty
-- Prisma will handle the schema creation