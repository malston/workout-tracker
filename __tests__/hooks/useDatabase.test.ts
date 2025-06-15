import { renderHook, waitFor } from '@testing-library/react'
import { useDatabase } from '@/hooks/useDatabase'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('useDatabase', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  test('should initially set isConnected to false and loading to true', () => {
    const { result } = renderHook(() => useDatabase())
    
    expect(result.current.isConnected).toBe(false)
    expect(result.current.loading).toBe(true)
  })

  test('should set isConnected to true when database health check succeeds', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ connected: true })
    })

    const { result } = renderHook(() => useDatabase())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.isConnected).toBe(true)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/health/database')
  })

  test('should set isConnected to false when database health check fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Database connection failed'))

    const { result } = renderHook(() => useDatabase())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.isConnected).toBe(false)
    })
  })

  test('should set isConnected to false when API returns error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    const { result } = renderHook(() => useDatabase())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.isConnected).toBe(false)
    })
  })

  test('should retry database check when checkConnection is called', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ connected: true })
    })

    const { result } = renderHook(() => useDatabase())

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true)
    })

    mockFetch.mockClear()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ connected: true })
    })

    await result.current.checkConnection()

    expect(mockFetch).toHaveBeenCalledWith('/api/health/database')
  })
})