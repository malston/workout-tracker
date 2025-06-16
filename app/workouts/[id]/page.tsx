'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWorkouts } from '@/hooks/useWorkouts'
import Link from 'next/link'

export default function WorkoutDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { getWorkout, deleteWorkout: removeWorkout, loading: workoutsLoading } = useWorkouts()
  const [workout, setWorkout] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (workoutsLoading) return
    
    const workoutId = params.id as string
    const foundWorkout = getWorkout(workoutId)
    
    if (foundWorkout) {
      setWorkout(foundWorkout)
    }
    setIsLoading(false)
  }, [params.id, getWorkout, workoutsLoading])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const handleDeleteWorkout = async () => {
    if (confirm('Are you sure you want to delete this workout?')) {
      try {
        await removeWorkout(params.id as string)
        router.push('/workouts')
      } catch (error) {
        console.error('Failed to delete workout:', error)
        alert('Failed to delete workout. Please try again.')
      }
    }
  }

  if (isLoading) {
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Workout not found
          </h2>
          <Link
            href="/workouts"
            className="text-blue-500 hover:underline"
          >
            Back to workouts
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/workouts"
            className="text-blue-500 hover:underline flex items-center gap-2"
          >
            ← Back to workouts
          </Link>
          <button
            onClick={handleDeleteWorkout}
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Delete Workout
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {workout.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date(workout.date).toLocaleDateString()} at {new Date(workout.date).toLocaleTimeString()}
          </p>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {workout.status === 'completed' ? 'Completed' : 'Planned'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {workout.exercises?.length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exercises</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {workout.exercises?.reduce((total: number, ex: any) => 
                  total + ex.sets?.reduce((setTotal: number, set: any) => 
                    setTotal + (set.completed ? (set.weight || 0) * (set.reps || 0) : 0), 0) || 0, 0) || 0} lbs
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {workout.exercises?.map((exerciseItem: any, index: number) => (
            <div key={exerciseItem.id || index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {exerciseItem.exercise?.name || exerciseItem.name}
              </h3>
              <div className="space-y-2">
                {exerciseItem.sets?.map((set: any, setIndex: number) => (
                  <div
                    key={set.id || setIndex}
                    className={`flex items-center justify-between p-3 rounded ${
                      set.completed
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Set {set.setNumber || setIndex + 1}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {set.weight || 0} lbs × {set.reps || 0} reps
                      {set.completed && <span className="ml-2 text-green-600">✓</span>}
                    </span>
                  </div>
                )) || []}
              </div>
            </div>
          )) || []}
        </div>
      </div>
    </div>
  )
}