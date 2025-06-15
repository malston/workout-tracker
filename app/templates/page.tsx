'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components'
import { WORKOUT_TEMPLATES } from '@/data/workout-templates'

const DIFFICULTY_COLORS = {
  'Beginner': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Advanced': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const selectedTemplateData = WORKOUT_TEMPLATES.find(t => t.id === selectedTemplate)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Workout Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Choose from pre-built workout templates or create your own custom routines
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {WORKOUT_TEMPLATES.map((template) => (
            <Card 
              key={template.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{template.emoji}</span>
                    <div>
                      <CardTitle className="text-xl">{template.name}</CardTitle>
                      <CardDescription>{template.duration}</CardDescription>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[template.difficulty as keyof typeof DIFFICULTY_COLORS]}`}>
                    {template.difficulty}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Exercises ({template.exercises.length}):
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {template.exercises.slice(0, 3).map((exercise, index) => (
                      <li key={index}>• {exercise.name}</li>
                    ))}
                    {template.exercises.length > 3 && (
                      <li className="text-blue-500">+ {template.exercises.length - 3} more...</li>
                    )}
                  </ul>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to start workout with this template
                      window.location.href = `/workouts/new?template=${template.id}`;
                    }}
                  >
                    Start Workout
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template.id);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Template Options */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Create Your Own
          </h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Custom Workout</CardTitle>
                <CardDescription>Build a workout from scratch with your own exercises</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/workouts/new">
                  <Button className="w-full">
                    Create Custom Workout
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browse Exercises</CardTitle>
                <CardDescription>Explore all available exercises to build your routine</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/exercises">
                  <Button variant="outline" className="w-full">
                    Browse All Exercises
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Template Detail Modal */}
        {selectedTemplate && selectedTemplateData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{selectedTemplateData.emoji}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedTemplateData.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {selectedTemplateData.duration} • {selectedTemplateData.difficulty}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedTemplate(null)}
                  >
                    ✕
                  </Button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {selectedTemplateData.description}
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Exercise List
                  </h3>
                  <div className="space-y-3">
                    {selectedTemplateData.exercises.map((exercise, index) => (
                      <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {exercise.name}
                          </h4>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {exercise.sets}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {exercise.muscles.map((muscle, muscleIndex) => (
                            <span
                              key={muscleIndex}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      window.location.href = `/workouts/new?template=${selectedTemplateData.id}`;
                    }}
                  >
                    Start This Workout
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}