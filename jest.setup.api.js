// Setup for API route tests
const { TextEncoder, TextDecoder } = require('util')

// Mock Next.js runtime for API routes
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Setup Node.js fetch API for tests
require('whatwg-fetch')

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'