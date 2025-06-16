'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWorkouts } from '@/hooks/useWorkouts'
import ExerciseTracker from '@/components/ExerciseTracker'
import WorkoutTimer from '@/components/WorkoutTimer'
import RestTimer from '@/components/RestTimer'

interface Exercise {
  name: string
  sets: Array<{
    reps: number
    weight: number
    completed: boolean
  }>
}

interface ActiveWorkout {
  id: string
  name: string
  template: string | null
  startTime: string
  exercises: Exercise[]
}

export default function WorkoutSessionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getWorkout, updateWorkout, loading: workoutsLoading } = useWorkouts()
  const [workout, setWorkout] = useState<ActiveWorkout | null>(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Don't try to load workout until workouts have finished loading
    if (workoutsLoading) {
      console.log('Session page - still loading workouts, waiting...')
      return
    }
    
    const workoutId = searchParams.get('workoutId')
    console.log('Session page - workoutId from URL:', workoutId)
    
    if (workoutId) {
      // Loading from a planned workout
      const plannedWorkout = getWorkout(workoutId)
      console.log('Session page - found workout:', plannedWorkout)
      
      if (plannedWorkout && plannedWorkout.status === 'planned') {
        console.log('Session page - creating active workout from planned workout')
        const activeWorkout: ActiveWorkout = {
          id: plannedWorkout.id,
          name: plannedWorkout.name,
          template: null,
          startTime: new Date().toISOString(),
          exercises: plannedWorkout.exercises.map(ex => ({
            name: ex.exercise.name,
            sets: ex.sets.map(set => ({
              reps: set.reps || 0,
              weight: set.weight || 0,
              completed: set.completed || false
            }))
          }))
        }
        setWorkout(activeWorkout)
        sessionStorage.setItem('activeWorkout', JSON.stringify(activeWorkout))
      } else {
        console.log('Session page - workout not found or not planned, redirecting to /workouts')
        router.push('/workouts')
      }
    } else {
      // Check for existing active workout
      const activeWorkout = sessionStorage.getItem('activeWorkout')
      if (activeWorkout) {
        setWorkout(JSON.parse(activeWorkout))
      } else {
        router.push('/workouts/new')
      }
    }
    setIsLoading(false)
  }, [router, searchParams, getWorkout, workoutsLoading])

  const addExercise = (exerciseName: string) => {
    if (!workout) return
    
    const updatedWorkout = {
      ...workout,
      exercises: [
        ...workout.exercises,
        {
          name: exerciseName,
          sets: []
        }
      ]
    }
    
    setWorkout(updatedWorkout)
    sessionStorage.setItem('activeWorkout', JSON.stringify(updatedWorkout))
    setCurrentExerciseIndex(updatedWorkout.exercises.length - 1)
  }

  const updateExercise = (exerciseIndex: number, updatedExercise: Exercise) => {
    if (!workout) return
    
    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((ex, idx) => 
        idx === exerciseIndex ? updatedExercise : ex
      )
    }
    
    setWorkout(updatedWorkout)
    sessionStorage.setItem('activeWorkout', JSON.stringify(updatedWorkout))
  }

  const finishWorkout = async () => {
    if (!workout) return
    
    const endTime = new Date()
    const startTime = new Date(workout.startTime)
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    
    // Calculate total volume
    const totalVolume = workout.exercises.reduce((total, exercise) => {
      return total + exercise.sets.reduce((exTotal, set) => {
        return exTotal + (set.completed ? set.weight * set.reps : 0)
      }, 0)
    }, 0)
    
    // Update the planned workout to completed status
    try {
      await updateWorkout(workout.id, {
        status: 'completed',
        exercises: workout.exercises.map((exercise, index) => ({
          id: `exercise-${workout.id}-${index}`,
          exercise: {
            id: exercise.name.toLowerCase().replace(/\s+/g, '-'),
            name: exercise.name,
            category: 'strength'
          },
          sets: exercise.sets.map((set, setIndex) => ({
            id: `set-${workout.id}-${index}-${setIndex}`,
            setNumber: setIndex + 1,
            reps: set.reps,
            weight: set.weight,
            completed: set.completed,
            duration: null,
            distance: null,
            notes: null
          }))
        }))
      })
      
      console.log('Successfully updated workout to completed status')
    } catch (error) {
      console.error('Failed to update workout status:', error)
    }
    
    // Clear session
    sessionStorage.removeItem('activeWorkout')
    
    // Navigate to workouts page
    router.push('/workouts')
  }

  const cancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      sessionStorage.removeItem('activeWorkout')
      router.push('/workouts')
    }
  }

  if (isLoading || workoutsLoading || !workout) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {workout.name}
              </h1>
              <WorkoutTimer startTime={workout.startTime} />
            </div>
            <div className="flex gap-2">
              <button
                onClick={finishWorkout}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Finish
              </button>
              <button
                onClick={cancelWorkout}
                className="text-red-500 hover:text-red-600 font-semibold px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rest Timer Modal */}
      {showRestTimer && (
        <RestTimer onClose={() => setShowRestTimer(false)} />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Exercise List */}
        {workout.exercises.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center mb-6">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No exercises added yet. Add your first exercise to start!
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            {workout.exercises.map((exercise, index) => (
              <div
                key={index}
                className={`cursor-pointer transition-all ${
                  index === currentExerciseIndex ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setCurrentExerciseIndex(index)}
              >
                <ExerciseTracker
                  exercise={exercise}
                  isActive={index === currentExerciseIndex}
                  onUpdate={(updatedExercise) => updateExercise(index, updatedExercise)}
                  onRestTimerStart={() => setShowRestTimer(true)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Add Exercise */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
      </div>
    </div>
  )
}