import { renderHook, waitFor, act } from '@testing-library/react'
import { useExercises } from '@/hooks/useExercises'

// Mock the useDatabase hook
jest.mock('@/hooks/useDatabase', () => ({
  useDatabase: () => ({
    isConnected: true,
    loading: false,
    checkConnection: jest.fn()
  })
}))

const mockFetch = jest.fn()
global.fetch = mockFetch

const mockExercise = {
  id: '1',
  name: 'Push-ups',
  category: 'strength',
  muscleGroup: ['chest', 'triceps'],
  equipment: 'bodyweight',
  difficulty: 'beginner',
  instructions: 'Do push-ups',
  notes: 'Keep form strict',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
}

const mockExercises = [mockExercise]

describe('useExercises', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
  })

  test('should load exercises from API when database is connected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockExercises)
    })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.exercises).toEqual(mockExercises)
    expect(mockFetch).toHaveBeenCalledWith('/api/exercises')
  })

  test('should fallback to localStorage when API fails', async () => {
    localStorage.setItem('workout_tracker_exercises', JSON.stringify(mockExercises))
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check structure since dates get serialized
    expect(result.current.exercises).toHaveLength(1)
    expect(result.current.exercises[0].name).toBe(mockExercise.name)
    expect(result.current.exercises[0].category).toBe(mockExercise.category)
  })

  test('should create new exercise via API', async () => {
    const newExercise = {
      name: 'Squats',
      category: 'strength',
      muscleGroup: ['quadriceps', 'glutes'],
      equipment: 'bodyweight',
      difficulty: 'intermediate',
      instructions: 'Perform squats with proper form',
      notes: 'Keep back straight'
    }

    const createdExercise = { ...newExercise, id: '2', createdAt: new Date(), updatedAt: new Date() }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockExercise])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdExercise)
      })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.createExercise(newExercise)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExercise)
    })
  })

  test('should get exercise by id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockExercise])
    })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const exercise = result.current.getExercise('1')
    expect(exercise).toEqual(mockExercise)
  })

  test('should return undefined for non-existent exercise', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockExercise])
    })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const exercise = result.current.getExercise('999')
    expect(exercise).toBeUndefined()
  })

  test('should have all expected functions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockExercise])
    })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(typeof result.current.createExercise).toBe('function')
    expect(typeof result.current.updateExercise).toBe('function')
    expect(typeof result.current.deleteExercise).toBe('function')
    expect(typeof result.current.getExercise).toBe('function')
    expect(typeof result.current.refetch).toBe('function')
  })

  test('should handle errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.exercises).toEqual([])
  })
})