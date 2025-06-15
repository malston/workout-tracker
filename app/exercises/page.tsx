'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useExercises } from '@/hooks/useExercises'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, LoadingSpinner } from '@/components'

const EXERCISE_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'balance', label: 'Balance' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' }
]

const MUSCLE_GROUPS = [
  'all', 'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'calves'
]

export default function ExercisesPage() {
  const { exercises, isLoading, error } = useExercises()
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('all')

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter
    const matchesMuscleGroup = muscleGroupFilter === 'all' || 
      exercise.muscleGroup.some(mg => mg.toLowerCase().includes(muscleGroupFilter.toLowerCase()))
    
    return matchesSearch && matchesCategory && matchesMuscleGroup
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      strength: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cardio: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      flexibility: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      balance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sports: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Exercises
            </h1>
            <Link href="/exercises/new">
              <Button>Add Exercise</Button>
            </Link>
          </div>
          
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Exercises</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  options={EXERCISE_CATEGORIES}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  placeholder="Category"
                />
                <Select
                  options={MUSCLE_GROUPS.map(mg => ({ 
                    value: mg, 
                    label: mg === 'all' ? 'All Muscle Groups' : mg.charAt(0).toUpperCase() + mg.slice(1)
                  }))}
                  value={muscleGroupFilter}
                  onChange={setMuscleGroupFilter}
                  placeholder="Muscle Group"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">
              Error loading exercises: {error}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredExercises.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {exercises.length === 0 ? (
                <>
                  <div className="text-6xl mb-4">💪</div>
                  <h3 className="text-xl font-semibold mb-2">No exercises yet!</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Add your first exercise to get started with tracking workouts.
                  </p>
                  <div className="space-y-3">
                    <Link href="/exercises/new">
                      <Button>Add Your First Exercise</Button>
                    </Link>
                    <div className="text-gray-400">or</div>
                    <Link href="/import">
                      <Button variant="outline">Import Exercises</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold mb-2">No exercises match your filters</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search terms or filters.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {filteredExercises.length} of {exercises.length} exercises
              </p>
            </div>

            {/* Exercise Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredExercises.map((exercise) => (
                <Link key={exercise.id} href={`/exercises/${exercise.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
                          {exercise.category}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Muscle Groups:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {exercise.muscleGroup.map((mg, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                              >
                                {mg}
                              </span>
                            ))}
                          </div>
                        </div>
                        {exercise.notes && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {exercise.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}