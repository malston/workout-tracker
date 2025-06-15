import { renderHook, waitFor, act } from '@testing-library/react'
import { useWorkouts } from '@/hooks/useWorkouts'

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

const mockWorkout = {
  id: '1',
  name: 'Push Day Workout',
  duration: 60,
  caloriesBurned: 300,
  exercises: [
    {
      id: 'we1',
      exerciseId: 'ex1',
      sets: [
        { reps: 10, weight: 135, restTime: 90 }
      ]
    }
  ],
  notes: 'Great workout',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
}

const mockWorkouts = [mockWorkout]

describe('useWorkouts', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    localStorage.clear()
  })

  test('should load workouts from API when database is connected', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWorkouts)
    })

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.workouts).toEqual(mockWorkouts)
    expect(mockFetch).toHaveBeenCalledWith('/api/workouts')
  })

  test('should fallback to localStorage when API fails', async () => {
    localStorage.setItem('workout_workouts', JSON.stringify(mockWorkouts))
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.workouts).toEqual(mockWorkouts)
  })

  test('should add new workout via API', async () => {
    const newWorkout = {
      name: 'Pull Day Workout',
      duration: 45,
      caloriesBurned: 250,
      exercises: [],
      notes: 'Back and biceps'
    }

    const createdWorkout = { ...newWorkout, id: '2', createdAt: new Date(), updatedAt: new Date() }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockWorkout])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(createdWorkout)
      })

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.addWorkout(newWorkout)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorkout)
    })
  })

  test('should update workout via API', async () => {
    const updatedData = { name: 'Modified Push Day' }
    const updatedWorkout = { ...mockWorkout, ...updatedData }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockWorkout])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedWorkout)
      })

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.updateWorkout('1', updatedData)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/workouts/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
  })

  test('should delete workout via API', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockWorkout])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.deleteWorkout('1')
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/workouts/1', {
      method: 'DELETE'
    })
  })

  test('should get workout by id', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockWorkout])
    })

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const workout = result.current.getWorkout('1')
    expect(workout).toEqual(mockWorkout)
  })

  test('should calculate statistics correctly', async () => {
    const workouts = [
      { ...mockWorkout, duration: 60, caloriesBurned: 300 },
      { ...mockWorkout, id: '2', duration: 45, caloriesBurned: 250 },
      { ...mockWorkout, id: '3', duration: 30, caloriesBurned: 200 }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(workouts)
    })

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const stats = result.current.getWorkoutStats()
    expect(stats.totalWorkouts).toBe(3)
    expect(stats.totalDuration).toBe(135) // 60 + 45 + 30
    expect(stats.totalCalories).toBe(750) // 300 + 250 + 200
    expect(stats.averageDuration).toBe(45) // 135 / 3
  })

  test('should handle localStorage fallback when adding workout', async () => {
    // Mock database as disconnected
    jest.mocked(require('@/hooks/useDatabase').useDatabase).mockReturnValue({
      isConnected: false,
      loading: false,
      checkConnection: jest.fn()
    })

    localStorage.setItem('workout_workouts', JSON.stringify([mockWorkout]))

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newWorkout = {
      name: 'Leg Day',
      duration: 75,
      caloriesBurned: 400,
      exercises: [],
      notes: 'Squats and deadlifts'
    }

    await act(async () => {
      await result.current.addWorkout(newWorkout)
    })

    expect(result.current.workouts).toHaveLength(2)
    expect(result.current.workouts[1].name).toBe('Leg Day')
  })

  test('should get recent workouts', async () => {
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const workouts = [
      { ...mockWorkout, id: '1', createdAt: now },
      { ...mockWorkout, id: '2', createdAt: yesterday },
      { ...mockWorkout, id: '3', createdAt: lastWeek }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(workouts)
    })

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const recentWorkouts = result.current.getRecentWorkouts(2)
    expect(recentWorkouts).toHaveLength(2)
    expect(recentWorkouts[0].id).toBe('1') // Most recent first
    expect(recentWorkouts[1].id).toBe('2')
  })
})