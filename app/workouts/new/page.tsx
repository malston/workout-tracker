'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import WorkoutTemplateSelector from '@/components/WorkoutTemplateSelector'
import { WORKOUT_TEMPLATES } from '@/data/workout-templates'
import { useWorkouts } from '@/hooks/useWorkouts'

// Helper function to parse template sets and create actual set objects
function parseTemplateSets(setsString: string) {
  // Parse strings like "4 sets x 8-12 reps", "3 sets x 10-12 reps", "2 sets to failure"
  const setMatch = setsString.match(/(\d+)\s+sets?/i)
  const numberOfSets = setMatch ? parseInt(setMatch[1]) : 3 // Default to 3 sets if can't parse
  
  // Create empty sets that user will fill in during workout
  return Array.from({ length: numberOfSets }, () => ({
    reps: 0,
    weight: 0,
    completed: false
  }))
}

function NewWorkoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isQuickStart = searchParams.get('quick') === 'true'
  const templateFromUrl = searchParams.get('template')
  
  const [workoutName, setWorkoutName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateFromUrl)
  const [isSaving, setIsSaving] = useState(false)
  const { addWorkout } = useWorkouts()

  const createWorkout = async () => {
    if (isSaving) return
    
    try {
      setIsSaving(true)
      console.log('Creating workout...')
      
      // Find the selected template
      const template = selectedTemplate ? WORKOUT_TEMPLATES.find(t => t.id === selectedTemplate) : null
      console.log('Selected template:', template)
      
      // Convert template exercises to workout exercises with pre-created sets
      const exercises = template ? template.exercises.map((exercise, exerciseIndex) => ({
        id: `exercise-${Date.now()}-${exerciseIndex}`,
        exercise: {
          id: `${exercise.name.toLowerCase().replace(/\s+/g, '-')}`,
          name: exercise.name,
          category: 'strength' // Default category, could be enhanced based on muscles
        },
        sets: parseTemplateSets(exercise.sets).map((set, setIndex) => ({
          id: `set-${Date.now()}-${exerciseIndex}-${setIndex}`,
          setNumber: setIndex + 1,
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
          duration: null,
          distance: null,
          notes: null
        }))
      })) : []
      
      console.log('Exercises to create:', exercises)
      
      const workoutData = {
        name: workoutName || (template ? `${template.name} Workout` : 'Custom Workout'),
        date: new Date(), // Add the required date field
        notes: template ? `Created from ${template.name} template` : '',
        status: 'planned' as const, // Mark as planned, not started
        exercises: exercises,
        templateId: selectedTemplate || null
      }
      
      console.log('Workout data to save:', workoutData)
      
      // Save the workout using the hook
      const newWorkout = await addWorkout(workoutData)
      console.log('Created workout:', newWorkout)
      
      // Navigate back to workouts list
      router.push('/workouts')
      
    } catch (error) {
      console.error('Failed to create workout:', error)
      // Don't show error if it's just using localStorage fallback
      if (error instanceof Error && error.message.includes('database')) {
        console.log('Using localStorage fallback for workout creation')
      } else {
        alert('Failed to create workout. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Quick start will immediately create and save a basic workout
  useEffect(() => {
    if (isQuickStart) {
      createWorkout()
    }
  }, [isQuickStart])

  if (isQuickStart) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Creating workout...</p>
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

        {/* Template Preview */}
        {selectedTemplate && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Workout Preview
            </h3>
            {(() => {
              const template = WORKOUT_TEMPLATES.find(t => t.id === selectedTemplate)
              if (!template) return null
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                      {template.emoji} {template.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{template.difficulty}</span>
                      <span>•</span>
                      <span>{template.duration}</span>
                      <span>•</span>
                      <span>{template.exercises.length} exercises</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {template.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Exercises included:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {template.exercises.map((exercise, index) => {
                        const setCount = parseTemplateSets(exercise.sets).length
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {exercise.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {setCount} sets ({exercise.sets})
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={createWorkout}
            disabled={isSaving}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
          >
            {isSaving ? 'Creating...' : 'Create Workout'}
          </button>
          <button
            onClick={() => router.back()}
            disabled={isSaving}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
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