'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import WorkoutTemplateSelector from '@/components/WorkoutTemplateSelector'

function NewWorkoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isQuickStart = searchParams.get('quick') === 'true'
  
  const [workoutName, setWorkoutName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const startWorkout = () => {
    const workoutData = {
      id: Date.now().toString(),
      name: workoutName || (selectedTemplate ? `${selectedTemplate} Workout` : 'Custom Workout'),
      template: selectedTemplate,
      startTime: new Date().toISOString(),
      exercises: []
    }
    
    // Save to session storage for active workout
    sessionStorage.setItem('activeWorkout', JSON.stringify(workoutData))
    
    // Navigate to session page
    router.push('/workouts/session')
  }

  useEffect(() => {
    if (isQuickStart) {
      startWorkout()
    }
  }, [isQuickStart])

  if (isQuickStart) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Starting workout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          New Workout
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Workout Name (Optional)
          </label>
          <input
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="e.g., Monday Upper Body"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Choose a Template
          </h2>
          <WorkoutTemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={startWorkout}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            Start Workout
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function NewWorkoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewWorkoutContent />
    </Suspense>
  )
}