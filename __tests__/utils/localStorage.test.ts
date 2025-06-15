import {
  getFromLocalStorage,
  setToLocalStorage,
  removeFromLocalStorage,
  localStorageKeys,
  generateId
} from '@/utils/localStorage'

describe('localStorage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getFromLocalStorage', () => {
    test('should return stored value when key exists', () => {
      const testData = { name: 'Test Exercise', category: 'strength' }
      localStorage.setItem('test_key', JSON.stringify(testData))

      const result = getFromLocalStorage('test_key', null)
      expect(result).toEqual(testData)
    })

    test('should return default value when key does not exist', () => {
      const defaultValue = { default: true }
      const result = getFromLocalStorage('non_existent_key', defaultValue)
      expect(result).toEqual(defaultValue)
    })

    test('should return default value when stored value is invalid JSON', () => {
      localStorage.setItem('invalid_json', 'invalid json string')
      const defaultValue = []
      const result = getFromLocalStorage('invalid_json', defaultValue)
      expect(result).toEqual(defaultValue)
    })

    test('should handle different data types', () => {
      // String
      localStorage.setItem('string_key', JSON.stringify('hello'))
      expect(getFromLocalStorage('string_key', '')).toBe('hello')

      // Number
      localStorage.setItem('number_key', JSON.stringify(42))
      expect(getFromLocalStorage('number_key', 0)).toBe(42)

      // Boolean
      localStorage.setItem('boolean_key', JSON.stringify(true))
      expect(getFromLocalStorage('boolean_key', false)).toBe(true)

      // Array
      const array = [1, 2, 3]
      localStorage.setItem('array_key', JSON.stringify(array))
      expect(getFromLocalStorage('array_key', [])).toEqual(array)
    })
  })

  describe('setToLocalStorage', () => {
    test('should store value in localStorage', () => {
      const testData = { name: 'Push-ups', sets: 3 }
      setToLocalStorage('test_exercise', testData)

      const stored = localStorage.getItem('test_exercise')
      expect(JSON.parse(stored!)).toEqual(testData)
    })

    test('should handle different data types', () => {
      setToLocalStorage('string', 'hello')
      setToLocalStorage('number', 42)
      setToLocalStorage('boolean', true)
      setToLocalStorage('array', [1, 2, 3])
      setToLocalStorage('object', { key: 'value' })

      expect(getFromLocalStorage('string', '')).toBe('hello')
      expect(getFromLocalStorage('number', 0)).toBe(42)
      expect(getFromLocalStorage('boolean', false)).toBe(true)
      expect(getFromLocalStorage('array', [])).toEqual([1, 2, 3])
      expect(getFromLocalStorage('object', {})).toEqual({ key: 'value' })
    })

    test('should overwrite existing values', () => {
      setToLocalStorage('test_key', 'initial')
      setToLocalStorage('test_key', 'updated')

      expect(getFromLocalStorage('test_key', '')).toBe('updated')
    })
  })

  describe('removeFromLocalStorage', () => {
    test('should remove item from localStorage', () => {
      localStorage.setItem('test_key', 'test_value')
      expect(localStorage.getItem('test_key')).toBe('test_value')

      removeFromLocalStorage('test_key')
      expect(localStorage.getItem('test_key')).toBeNull()
    })

    test('should handle removing non-existent keys gracefully', () => {
      expect(() => {
        removeFromLocalStorage('non_existent_key')
      }).not.toThrow()
    })
  })

  describe('localStorageKeys', () => {
    test('should have all required keys defined', () => {
      expect(localStorageKeys.exercises).toBe('workout_tracker_exercises')
      expect(localStorageKeys.workouts).toBe('workout_tracker_workouts')
      expect(localStorageKeys.workoutSessions).toBe('workout_tracker_sessions')
      expect(localStorageKeys.activeSession).toBe('workout_tracker_active_session')
      expect(localStorageKeys.workoutTemplates).toBe('workout_tracker_templates')
    })

    test('should have unique values for all keys', () => {
      const values = Object.values(localStorageKeys)
      const uniqueValues = [...new Set(values)]
      expect(values.length).toBe(uniqueValues.length)
    })
  })

  describe('generateId', () => {
    test('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
      expect(id2.length).toBeGreaterThan(0)
    })

    test('should generate IDs with consistent format', () => {
      const id = generateId()
      
      // Should be a string of reasonable length (assuming timestamp-based or similar)
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(5)
    })

    test('should generate multiple unique IDs', () => {
      const ids = Array.from({ length: 100 }, () => generateId())
      const uniqueIds = new Set(ids)
      
      expect(uniqueIds.size).toBe(100) // All IDs should be unique
    })
  })

  describe('integration tests', () => {
    test('should work with localStorage keys constants', () => {
      const exercises = [
        { id: '1', name: 'Push-ups', category: 'strength' },
        { id: '2', name: 'Running', category: 'cardio' }
      ]

      setToLocalStorage(localStorageKeys.exercises, exercises)
      const retrieved = getFromLocalStorage(localStorageKeys.exercises, [])

      expect(retrieved).toEqual(exercises)
    })

    test('should handle complex nested objects', () => {
      const complexWorkout = {
        id: generateId(),
        name: 'Complex Workout',
        exercises: [
          {
            id: generateId(),
            name: 'Bench Press',
            sets: [
              { reps: 8, weight: 185, restTime: 120 },
              { reps: 6, weight: 195, restTime: 120 }
            ]
          }
        ],
        metadata: {
          duration: 60,
          difficulty: 'advanced',
          tags: ['strength', 'upper-body']
        }
      }

      setToLocalStorage('complex_workout', complexWorkout)
      const retrieved = getFromLocalStorage('complex_workout', null)

      expect(retrieved).toEqual(complexWorkout)
    })
  })
})