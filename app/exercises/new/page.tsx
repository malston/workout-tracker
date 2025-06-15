'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useExercises } from '@/hooks/useExercises'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from '@/components'

const EXERCISE_CATEGORIES = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'balance', label: 'Balance' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' }
]

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

const COMMON_MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'core', 'abs', 'obliques', 'quadriceps', 'hamstrings', 'glutes',
  'calves', 'full body', 'cardio'
]

export default function NewExercisePage() {
  const router = useRouter()
  const { createExercise } = useExercises()
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'strength',
    muscleGroup: [] as string[],
    equipment: '',
    difficulty: 'beginner',
    instructions: '',
    notes: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Exercise name is required')
      return
    }
    
    if (formData.muscleGroup.length === 0) {
      setError('At least one muscle group is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createExercise({
        name: formData.name.trim(),
        category: formData.category,
        muscleGroup: formData.muscleGroup,
        equipment: formData.equipment.trim() || undefined,
        difficulty: formData.difficulty,
        instructions: formData.instructions.trim() || undefined,
        notes: formData.notes.trim() || undefined
      })
      
      router.push('/exercises')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create exercise')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMuscleGroup = (muscleGroup: string) => {
    setFormData(prev => ({
      ...prev,
      muscleGroup: prev.muscleGroup.includes(muscleGroup)
        ? prev.muscleGroup.filter(mg => mg !== muscleGroup)
        : [...prev.muscleGroup, muscleGroup]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Add New Exercise
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new exercise to use in your workouts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Exercise Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Exercise Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Exercise Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Bench Press, Running, Push-ups"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <Select
                  options={EXERCISE_CATEGORIES}
                  value={formData.category}
                  onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                />
              </div>

              {/* Muscle Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Muscle Groups * (select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_MUSCLE_GROUPS.map(mg => (
                    <button
                      key={mg}
                      type="button"
                      onClick={() => toggleMuscleGroup(mg)}
                      className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                        formData.muscleGroup.includes(mg)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                    >
                      {mg}
                    </button>
                  ))}
                </div>
                {formData.muscleGroup.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Selected: {formData.muscleGroup.join(', ')}
                  </p>
                )}
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Equipment
                </label>
                <Input
                  value={formData.equipment}
                  onChange={(e) => setFormData(prev => ({ ...prev, equipment: e.target.value }))}
                  placeholder="e.g., Barbell, Dumbbells, None"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty Level
                </label>
                <Select
                  options={DIFFICULTY_LEVELS}
                  value={formData.difficulty}
                  onChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Step-by-step instructions for performing this exercise..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes, tips, or variations..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Exercise'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}