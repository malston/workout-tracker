'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useWorkouts } from '@/hooks/useWorkouts'
import { useExercises } from '@/hooks/useExercises'

interface EditableSet {
  id: string
  setNumber: number
  reps: number
  weight: number
  completed: boolean
}

interface EditableExercise {
  id: string
  exercise: {
    id: string
    name: string
    category: string
  }
  sets: EditableSet[]
}

export default function EditWorkoutPage() {
  const router = useRouter()
  const params = useParams()
  const { getWorkout } = useWorkouts()
  const { exercises: allExercises } = useExercises()
  const [workout, setWorkout] = useState<any>(null)
  const [workoutName, setWorkoutName] = useState('')
  const [workoutExercises, setWorkoutExercises] = useState<EditableExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const workoutId = params.id as string
    const foundWorkout = getWorkout(workoutId)
    
    if (foundWorkout && foundWorkout.status === 'planned') {
      setWorkout(foundWorkout)
      setWorkoutName(foundWorkout.name)
      setWorkoutExercises(foundWorkout.exercises)
    } else {
      router.push('/workouts')
    }
    setLoading(false)
  }, [params.id, getWorkout, router])

  const updateExerciseSet = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setWorkoutExercises(prev => prev.map((exercise, exIdx) => 
      exIdx === exerciseIndex 
        ? {
            ...exercise,
            sets: exercise.sets.map((set, setIdx) =>
              setIdx === setIndex ? { ...set, [field]: value } : set
            )
          }
        : exercise
    ))
  }

  const addSet = (exerciseIndex: number) => {
    setWorkoutExercises(prev => prev.map((exercise, exIdx) => 
      exIdx === exerciseIndex 
        ? {
            ...exercise,
            sets: [
              ...exercise.sets,
              {
                id: `set-${Date.now()}`,
                setNumber: exercise.sets.length + 1,
                reps: 0,
                weight: 0,
                completed: false
              }
            ]
          }
        : exercise
    ))
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setWorkoutExercises(prev => prev.map((exercise, exIdx) => 
      exIdx === exerciseIndex 
        ? {
            ...exercise,
            sets: exercise.sets.filter((_, setIdx) => setIdx !== setIndex)
              .map((set, idx) => ({ ...set, setNumber: idx + 1 }))
          }
        : exercise
    ))
  }

  const removeExercise = (exerciseIndex: number) => {
    setWorkoutExercises(prev => prev.filter((_, exIdx) => exIdx !== exerciseIndex))
  }

  const addExercise = (exerciseName: string) => {
    const newExercise: EditableExercise = {
      id: `exercise-${Date.now()}`,
      exercise: {
        id: exerciseName.toLowerCase().replace(/\s+/g, '-'),
        name: exerciseName,
        category: 'strength'
      },
      sets: [
        {
          id: `set-${Date.now()}`,
          setNumber: 1,
          reps: 0,
          weight: 0,
          completed: false
        }
      ]
    }
    setWorkoutExercises(prev => [...prev, newExercise])
  }

  const saveWorkout = async () => {
    if (!workout) return
    
    setSaving(true)
    try {
      // Update the workout in localStorage
      const updatedWorkout = {
        ...workout,
        name: workoutName,
        exercises: workoutExercises,
        updatedAt: new Date()
      }
      
      // Get current workouts from localStorage
      const stored = localStorage.getItem('workout_tracker_workouts')
      if (stored) {
        const workouts = JSON.parse(stored)
        const updatedWorkouts = workouts.map((w: any) => 
          w.id === workout.id ? updatedWorkout : w
        )
        localStorage.setItem('workout_tracker_workouts', JSON.stringify(updatedWorkouts))
      }
      
      router.push('/workouts')
    } catch (error) {
      console.error('Failed to save workout:', error)
      alert('Failed to save workout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Workout Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The workout you're trying to edit doesn't exist or isn't editable.</p>
          <button
            onClick={() => router.push('/workouts')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Edit Workout
          </h1>
          
          {/* Workout Name */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Workout Name
            </label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Exercises */}
          <div className="space-y-6">
            {workoutExercises.map((exercise, exerciseIndex) => (
              <div key={exercise.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {exercise.exercise.name}
                  </h3>
                  <button
                    onClick={() => removeExercise(exerciseIndex)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="Remove exercise"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Sets */}
                <div className="space-y-2 mb-4">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-16">
                        Set {set.setNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => updateExerciseSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                          placeholder="Weight"
                        />
                        <span className="text-sm text-gray-500">lbs ×</span>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => updateExerciseSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-600 dark:text-white"
                          placeholder="Reps"
                        />
                        <span className="text-sm text-gray-500">reps</span>
                      </div>
                      <button
                        onClick={() => removeSet(exerciseIndex, setIndex)}
                        className="text-red-500 hover:text-red-600 p-1 ml-auto"
                        title="Remove set"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addSet(exerciseIndex)}
                  className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  + Add Set
                </button>
              </div>
            ))}
          </div>

          {/* Add Exercise */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Exercise
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Exercise name"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    addExercise(e.currentTarget.value.trim())
                    e.currentTarget.value = ''
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  if (input.value.trim()) {
                    addExercise(input.value.trim())
                    input.value = ''
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Save/Cancel Actions */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={saveWorkout}
              disabled={saving}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save Workout'}
            </button>
            <button
              onClick={() => router.push('/workouts')}
              disabled={saving}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}