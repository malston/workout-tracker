import {
  parseCSVContent,
  parseJSONContent,
  parseXMLContent,
  validateExerciseData,
  validateWorkoutData
} from '@/utils/fileImport'

describe('File Import Utilities', () => {
  describe('parseCSVContent', () => {
    test('should parse valid CSV exercise data', () => {
      const csvContent = `name,category,muscleGroup,equipment,difficulty,instructions,notes
Push-ups,strength,"chest,triceps",bodyweight,beginner,"Do push-ups","Keep form strict"
Running,cardio,legs,none,intermediate,"Run at moderate pace","Good for cardio"`

      const result = parseCSVContent(csvContent, 'exercises')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        name: 'Push-ups',
        category: 'strength',
        muscleGroup: ['chest', 'triceps'],
        equipment: 'bodyweight',
        difficulty: 'beginner',
        instructions: 'Do push-ups',
        notes: 'Keep form strict'
      })
    })

    test('should parse valid CSV workout data', () => {
      const csvContent = `name,duration,caloriesBurned,notes
"Morning Workout",60,300,"Great session"
"Evening Run",30,200,"Quick cardio"`

      const result = parseCSVContent(csvContent, 'workouts')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual({
        name: 'Morning Workout',
        duration: 60,
        caloriesBurned: 300,
        notes: 'Great session'
      })
    })

    test('should handle CSV with missing optional fields', () => {
      const csvContent = `name,category,muscleGroup,equipment,difficulty,instructions,notes
Push-ups,strength,chest,bodyweight,beginner,"Do push-ups",`

      const result = parseCSVContent(csvContent, 'exercises')
      expect(result.success).toBe(true)
      expect(result.data[0].notes).toBe('')
    })

    test('should handle invalid CSV format', () => {
      const csvContent = `invalid csv content without proper headers`

      const result = parseCSVContent(csvContent, 'exercises')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid CSV format')
    })

    test('should handle empty CSV content', () => {
      const csvContent = ``

      const result = parseCSVContent(csvContent, 'exercises')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Empty CSV file')
    })

    test('should convert string numbers to numbers for workout data', () => {
      const csvContent = `name,duration,caloriesBurned,notes
"Test Workout","60","300","Notes"`

      const result = parseCSVContent(csvContent, 'workouts')
      expect(result.success).toBe(true)
      expect(result.data[0].duration).toBe(60)
      expect(result.data[0].caloriesBurned).toBe(300)
      expect(typeof result.data[0].duration).toBe('number')
      expect(typeof result.data[0].caloriesBurned).toBe('number')
    })
  })

  describe('parseJSONContent', () => {
    test('should parse valid JSON exercise data', () => {
      const jsonContent = JSON.stringify([
        {
          name: 'Push-ups',
          category: 'strength',
          muscleGroup: ['chest', 'triceps'],
          equipment: 'bodyweight',
          difficulty: 'beginner',
          instructions: 'Do push-ups',
          notes: 'Keep form strict'
        },
        {
          name: 'Running',
          category: 'cardio',
          muscleGroup: ['legs'],
          equipment: 'none',
          difficulty: 'intermediate',
          instructions: 'Run at moderate pace',
          notes: 'Good for cardio'
        }
      ])

      const result = parseJSONContent(jsonContent, 'exercises')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Push-ups')
    })

    test('should parse valid JSON workout data', () => {
      const jsonContent = JSON.stringify([
        {
          name: 'Morning Workout',
          duration: 60,
          caloriesBurned: 300,
          notes: 'Great session'
        }
      ])

      const result = parseJSONContent(jsonContent, 'workouts')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].duration).toBe(60)
    })

    test('should handle invalid JSON', () => {
      const jsonContent = `{ invalid json `

      const result = parseJSONContent(jsonContent, 'exercises')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid JSON format')
    })

    test('should handle JSON that is not an array', () => {
      const jsonContent = JSON.stringify({
        name: 'Single Exercise',
        category: 'strength'
      })

      const result = parseJSONContent(jsonContent, 'exercises')
      expect(result.success).toBe(false)
      expect(result.error).toContain('must be an array')
    })

    test('should handle empty JSON array', () => {
      const jsonContent = JSON.stringify([])

      const result = parseJSONContent(jsonContent, 'exercises')
      expect(result.success).toBe(false)
      expect(result.error).toContain('No data found')
    })
  })

  describe('parseXMLContent', () => {
    test('should parse valid XML exercise data', () => {
      const xmlContent = `
        <exercises>
          <exercise>
            <name>Push-ups</name>
            <category>strength</category>
            <muscleGroup>chest,triceps</muscleGroup>
            <equipment>bodyweight</equipment>
            <difficulty>beginner</difficulty>
            <instructions>Do push-ups</instructions>
            <notes>Keep form strict</notes>
          </exercise>
          <exercise>
            <name>Running</name>
            <category>cardio</category>
            <muscleGroup>legs</muscleGroup>
            <equipment>none</equipment>
            <difficulty>intermediate</difficulty>
            <instructions>Run at moderate pace</instructions>
            <notes>Good for cardio</notes>
          </exercise>
        </exercises>
      `

      const result = parseXMLContent(xmlContent, 'exercises')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data[0].name).toBe('Push-ups')
      expect(result.data[0].muscleGroup).toEqual(['chest', 'triceps'])
    })

    test('should parse valid XML workout data', () => {
      const xmlContent = `
        <workouts>
          <workout>
            <name>Morning Workout</name>
            <duration>60</duration>
            <caloriesBurned>300</caloriesBurned>
            <notes>Great session</notes>
          </workout>
        </workouts>
      `

      const result = parseXMLContent(xmlContent, 'workouts')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].duration).toBe(60)
      expect(result.data[0].caloriesBurned).toBe(300)
    })

    test('should handle invalid XML', () => {
      const xmlContent = `<invalid xml without closing tag`

      const result = parseXMLContent(xmlContent, 'exercises')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid XML')
    })

    test('should handle XML with wrong root element', () => {
      const xmlContent = `<wrongroot><item>data</item></wrongroot>`

      const result = parseXMLContent(xmlContent, 'exercises')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid XML structure')
    })

    test('should convert string numbers to numbers in XML workout data', () => {
      const xmlContent = `
        <workouts>
          <workout>
            <name>Test Workout</name>
            <duration>60</duration>
            <caloriesBurned>300</caloriesBurned>
            <notes>Test</notes>
          </workout>
        </workouts>
      `

      const result = parseXMLContent(xmlContent, 'workouts')
      expect(result.success).toBe(true)
      expect(typeof result.data[0].duration).toBe('number')
      expect(typeof result.data[0].caloriesBurned).toBe('number')
    })
  })

  describe('validateExerciseData', () => {
    test('should validate valid exercise data', () => {
      const exerciseData = {
        name: 'Push-ups',
        category: 'strength',
        muscleGroup: ['chest', 'triceps'],
        equipment: 'bodyweight',
        difficulty: 'beginner',
        instructions: 'Do push-ups',
        notes: 'Keep form strict'
      }

      const result = validateExerciseData(exerciseData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should detect missing required fields', () => {
      const exerciseData = {
        category: 'strength',
        muscleGroup: ['chest'],
        equipment: 'bodyweight',
        difficulty: 'beginner'
        // Missing name and instructions
      }

      const result = validateExerciseData(exerciseData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing required field: name')
      expect(result.errors).toContain('Missing required field: instructions')
    })

    test('should validate field types', () => {
      const exerciseData = {
        name: 123, // Should be string
        category: 'strength',
        muscleGroup: 'chest', // Should be array
        equipment: 'bodyweight',
        difficulty: 'beginner',
        instructions: 'Do push-ups',
        notes: ''
      }

      const result = validateExerciseData(exerciseData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('name must be a string')
      expect(result.errors).toContain('muscleGroup must be an array')
    })

    test('should validate enum values', () => {
      const exerciseData = {
        name: 'Test Exercise',
        category: 'invalid_category',
        muscleGroup: ['chest'],
        equipment: 'bodyweight',
        difficulty: 'invalid_difficulty',
        instructions: 'Test instructions',
        notes: ''
      }

      const result = validateExerciseData(exerciseData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid category')
      expect(result.errors).toContain('Invalid difficulty')
    })

    test('should handle optional fields', () => {
      const exerciseData = {
        name: 'Push-ups',
        category: 'strength',
        muscleGroup: ['chest'],
        equipment: 'bodyweight',
        difficulty: 'beginner',
        instructions: 'Do push-ups'
        // notes is optional
      }

      const result = validateExerciseData(exerciseData)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateWorkoutData', () => {
    test('should validate valid workout data', () => {
      const workoutData = {
        name: 'Morning Workout',
        duration: 60,
        caloriesBurned: 300,
        notes: 'Great session'
      }

      const result = validateWorkoutData(workoutData)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should detect missing required fields', () => {
      const workoutData = {
        duration: 60,
        caloriesBurned: 300
        // Missing name
      }

      const result = validateWorkoutData(workoutData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Missing required field: name')
    })

    test('should validate numeric fields', () => {
      const workoutData = {
        name: 'Test Workout',
        duration: '60', // Should be number
        caloriesBurned: 'invalid', // Should be number
        notes: 'Test'
      }

      const result = validateWorkoutData(workoutData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('duration must be a number')
      expect(result.errors).toContain('caloriesBurned must be a number')
    })

    test('should validate positive numbers', () => {
      const workoutData = {
        name: 'Test Workout',
        duration: -10,
        caloriesBurned: -50,
        notes: 'Test'
      }

      const result = validateWorkoutData(workoutData)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('duration must be positive')
      expect(result.errors).toContain('caloriesBurned must be positive')
    })

    test('should handle optional fields', () => {
      const workoutData = {
        name: 'Simple Workout',
        duration: 30,
        caloriesBurned: 150
        // notes is optional
      }

      const result = validateWorkoutData(workoutData)
      expect(result.valid).toBe(true)
    })
  })

  describe('Integration tests', () => {
    test('should handle complete exercise import workflow', () => {
      const csvContent = `name,category,muscleGroup,equipment,difficulty,instructions,notes
Push-ups,strength,"chest,triceps",bodyweight,beginner,"Do push-ups","Keep form strict"
Invalid Exercise,invalid_category,chest,bodyweight,beginner,"Test","Test"`

      const parseResult = parseCSVContent(csvContent, 'exercises')
      expect(parseResult.success).toBe(true)

      // Validate each exercise
      const validationResults = parseResult.data.map(validateExerciseData)
      expect(validationResults[0].valid).toBe(true)
      expect(validationResults[1].valid).toBe(false)

      // Filter valid exercises
      const validExercises = parseResult.data.filter((_, index) => validationResults[index].valid)
      expect(validExercises).toHaveLength(1)
      expect(validExercises[0].name).toBe('Push-ups')
    })

    test('should handle complete workout import workflow', () => {
      const jsonContent = JSON.stringify([
        {
          name: 'Valid Workout',
          duration: 60,
          caloriesBurned: 300,
          notes: 'Good workout'
        },
        {
          name: 'Invalid Workout',
          duration: -10, // Invalid
          caloriesBurned: 200,
          notes: 'Bad duration'
        }
      ])

      const parseResult = parseJSONContent(jsonContent, 'workouts')
      expect(parseResult.success).toBe(true)

      const validationResults = parseResult.data.map(validateWorkoutData)
      expect(validationResults[0].valid).toBe(true)
      expect(validationResults[1].valid).toBe(false)

      const validWorkouts = parseResult.data.filter((_, index) => validationResults[index].valid)
      expect(validWorkouts).toHaveLength(1)
      expect(validWorkouts[0].name).toBe('Valid Workout')
    })
  })
})