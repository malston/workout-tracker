'use client'

import Link from 'next/link'
import { useWorkouts } from '@/hooks/useWorkouts'
import WorkoutCard from '@/components/WorkoutCard'
import { LoadingSpinner } from '@/components'

export default function WorkoutsPage() {
  const { workouts, loading, error } = useWorkouts()
  
  const plannedWorkouts = workouts.filter(w => w.status === 'planned')
  const completedWorkouts = workouts.filter(w => w.status === 'completed')

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
              Create New Workout
            </Link>
            <Link
              href="/templates"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg text-center font-semibold text-lg transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
            <p className="text-red-600 dark:text-red-400">
              Error loading workouts: {error}
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : workouts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className="text-xl font-semibold mb-2">No workouts yet!</h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
              Start your fitness journey by creating your first workout.
            </p>
            <div className="space-y-3">
              <Link
                href="/workouts/new"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Your First Workout
              </Link>
              <div className="text-gray-400">or</div>
              <Link
                href="/import"
                className="inline-block text-blue-500 hover:text-blue-600 underline"
              >
                Import existing workout data
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Planned Workouts */}
            {plannedWorkouts.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Planned Workouts
                </h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {plannedWorkouts.map((workout) => (
                    <WorkoutCard 
                      key={workout.id} 
                      workout={{
                        id: workout.id,
                        name: workout.name,
                        date: workout.date.toString(),
                        duration: 0,
                        exercises: workout.exercises.length,
                        totalVolume: 0,
                        status: workout.status
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Completed Workouts */}
            {completedWorkouts.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Workouts
                </h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {completedWorkouts.map((workout) => (
                    <WorkoutCard 
                      key={workout.id} 
                      workout={{
                        id: workout.id,
                        name: workout.name,
                        date: workout.date.toString(),
                        duration: 0, // Will be calculated from exercises
                        exercises: workout.exercises.length,
                        totalVolume: 0, // Will be calculated from sets
                        status: workout.status
                      }} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}