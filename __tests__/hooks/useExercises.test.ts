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
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.exercises).toEqual(mockExercises)
    expect(mockFetch).toHaveBeenCalledWith('/api/exercises')
  })

  test('should fallback to localStorage when API fails', async () => {
    localStorage.setItem('workout_exercises', JSON.stringify(mockExercises))
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.exercises).toEqual(mockExercises)
  })

  test('should add new exercise via API', async () => {
    const newExercise = {
      name: 'Squats',
      category: 'strength',
      muscleGroup: ['quadriceps'],
      equipment: 'bodyweight',
      difficulty: 'beginner',
      instructions: 'Do squats',
      notes: ''
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
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.addExercise(newExercise)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExercise)
    })
  })

  test('should update exercise via API', async () => {
    const updatedData = { name: 'Modified Push-ups' }
    const updatedExercise = { ...mockExercise, ...updatedData }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockExercise])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedExercise)
      })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateExercise('1', updatedData)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/exercises/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
  })

  test('should delete exercise via API', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockExercise])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteExercise('1')
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/exercises/1', {
      method: 'DELETE'
    })
  })

  test('should get exercise by id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockExercise])
    })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const exercise = result.current.getExercise('1')
    expect(exercise).toEqual(mockExercise)
  })

  test('should return null for non-existent exercise', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockExercise])
    })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const exercise = result.current.getExercise('999')
    expect(exercise).toBeNull()
  })

  test('should filter exercises by category', async () => {
    const exercises = [
      mockExercise,
      { ...mockExercise, id: '2', category: 'cardio' }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(exercises)
    })

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const strengthExercises = result.current.getExercisesByCategory('strength')
    expect(strengthExercises).toHaveLength(1)
    expect(strengthExercises[0].category).toBe('strength')
  })

  test('should handle localStorage fallback when adding exercise', async () => {
    // Mock database as disconnected
    jest.mocked(require('@/hooks/useDatabase').useDatabase).mockReturnValue({
      isConnected: false,
      loading: false,
      checkConnection: jest.fn()
    })

    localStorage.setItem('workout_exercises', JSON.stringify([mockExercise]))

    const { result } = renderHook(() => useExercises())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newExercise = {
      name: 'Squats',
      category: 'strength',
      muscleGroup: ['quadriceps'],
      equipment: 'bodyweight',
      difficulty: 'beginner',
      instructions: 'Do squats',
      notes: ''
    }

    await act(async () => {
      await result.current.addExercise(newExercise)
    })

    expect(result.current.exercises).toHaveLength(2)
    expect(result.current.exercises[1].name).toBe('Squats')
  })
})