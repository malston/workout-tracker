'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Exercise {
  name: string
  sets: Array<{
    reps: number
    weight: number
    completed: boolean
  }>
}

interface WorkoutDetails {
  id: string
  name: string
  date: string
  duration: number
  exercises: Exercise[]
  totalVolume: number
}

export default function WorkoutDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [workout, setWorkout] = useState<WorkoutDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load workout from localStorage
    const workouts = localStorage.getItem('workouts')
    if (workouts) {
      const allWorkouts = JSON.parse(workouts)
      const foundWorkout = allWorkouts.find((w: WorkoutDetails) => w.id === params.id)
      if (foundWorkout) {
        setWorkout(foundWorkout)
      }
    }
    setIsLoading(false)
  }, [params.id])

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

  const deleteWorkout = () => {
    if (confirm('Are you sure you want to delete this workout?')) {
      const workouts = JSON.parse(localStorage.getItem('workouts') || '[]')
      const filtered = workouts.filter((w: WorkoutDetails) => w.id !== params.id)
      localStorage.setItem('workouts', JSON.stringify(filtered))
      router.push('/workouts')
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
            onClick={deleteWorkout}
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
                {formatDuration(workout.duration)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {workout.exercises.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exercises</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {workout.totalVolume.toLocaleString()} lbs
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {workout.exercises.map((exercise, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {exercise.name}
              </h3>
              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className={`flex items-center justify-between p-3 rounded ${
                      set.completed
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Set {setIndex + 1}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {set.weight} lbs × {set.reps} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}