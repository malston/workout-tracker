'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import WorkoutCard from '@/components/WorkoutCard'

interface Workout {
  id: string
  name: string
  date: string
  duration: number
  exercises: number
  totalVolume: number
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load workouts from localStorage
    const savedWorkouts = localStorage.getItem('workouts')
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts))
    }
    setIsLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Workouts
          </h1>
          
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link
              href="/workouts/new"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg text-center font-semibold text-lg transition-colors"
            >
              Start New Workout
            </Link>
            <Link
              href="/workouts/new?quick=true"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg text-center font-semibold text-lg transition-colors"
            >
              Quick Start
            </Link>
          </div>
        </div>

        {/* Workout History */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Workouts
          </h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No workouts yet. Start your first workout!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {workouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}