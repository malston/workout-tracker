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
  date: new Date('2023-01-01'),
  notes: 'Great workout',
  status: 'completed',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  exercises: [
    {
      id: 'exercise-1',
      exercise: {
        id: 'bench-press',
        name: 'Bench Press',
        category: 'strength'
      },
      sets: [
        {
          id: 'set-1',
          setNumber: 1,
          reps: 10,
          weight: 135,
          completed: true,
          duration: null,
          distance: null,
          notes: null
        }
      ]
    }
  ]
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
    localStorage.setItem('workout_tracker_workouts', JSON.stringify(mockWorkouts))
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Dates get serialized/deserialized as strings, so we need to check structure
    expect(result.current.workouts).toHaveLength(1)
    expect(result.current.workouts[0].name).toBe(mockWorkout.name)
    expect(result.current.workouts[0].status).toBe(mockWorkout.status)
    expect(result.current.workouts[0].exercises).toHaveLength(1)
  })

  test('should create new workout via API', async () => {
    const newWorkout = {
      name: 'Pull Day Workout',
      date: new Date('2023-01-02'),
      notes: 'Back and biceps',
      status: 'planned' as const,
      exercises: []
    }

    const createdWorkout = { 
      ...newWorkout, 
      id: '2', 
      createdAt: new Date(), 
      updatedAt: new Date()
    }

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
      await result.current.createWorkout(newWorkout)
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


  test('should provide updateWorkout function', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([mockWorkout])
    })

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(typeof result.current.updateWorkout).toBe('function')
  })

  test('should use correct localStorage key', async () => {
    const workoutsData = [mockWorkout]
    localStorage.setItem('workout_tracker_workouts', JSON.stringify(workoutsData))
    mockFetch.mockRejectedValueOnce(new Error('API Error'))

    const { result } = renderHook(() => useWorkouts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Check structure rather than exact equality due to date serialization
    expect(result.current.workouts).toHaveLength(1)
    expect(result.current.workouts[0].name).toBe(mockWorkout.name)
    expect(result.current.workouts[0].id).toBe(mockWorkout.id)
  })
})