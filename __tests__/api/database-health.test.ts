import { GET } from '@/app/api/health/database/route'

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    $queryRaw: jest.fn(),
  }
}))

const { db } = require('@/lib/db')

describe.skip('/api/health/database', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return connected true when database is accessible', async () => {
    db.$queryRaw.mockResolvedValue([{ result: 1 }])

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.connected).toBe(true)
    expect(data.timestamp).toBeDefined()
    expect(db.$queryRaw).toHaveBeenCalledWith`SELECT 1 as result`
  })

  test('should return connected false when database query fails', async () => {
    db.$queryRaw.mockRejectedValue(new Error('Connection failed'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.connected).toBe(false)
    expect(data.error).toBe('Connection failed')
    expect(data.timestamp).toBeDefined()
  })

  test('should handle database timeout', async () => {
    db.$queryRaw.mockRejectedValue(new Error('timeout'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.connected).toBe(false)
    expect(data.error).toBe('timeout')
  })

  test('should include timestamp in response', async () => {
    const beforeTime = Date.now()
    db.$queryRaw.mockResolvedValue([{ result: 1 }])

    const response = await GET()
    const data = await response.json()
    const afterTime = Date.now()

    expect(data.timestamp).toBeGreaterThanOrEqual(beforeTime)
    expect(data.timestamp).toBeLessThanOrEqual(afterTime)
  })

  test('should handle database connection pool exhaustion', async () => {
    db.$queryRaw.mockRejectedValue(new Error('Connection pool exhausted'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.connected).toBe(false)
    expect(data.error).toBe('Connection pool exhausted')
  })

  test('should always return 200 status regardless of database state', async () => {
    // Test successful connection
    db.$queryRaw.mockResolvedValue([{ result: 1 }])
    let response = await GET()
    expect(response.status).toBe(200)

    // Test failed connection
    db.$queryRaw.mockRejectedValue(new Error('Failed'))
    response = await GET()
    expect(response.status).toBe(200)
  })
})