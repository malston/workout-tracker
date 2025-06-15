'use client'

import { useState } from 'react'

interface Set {
  reps: number
  weight: number
  completed: boolean
}

interface Exercise {
  name: string
  sets: Set[]
}

interface ExerciseTrackerProps {
  exercise: Exercise
  isActive: boolean
  onUpdate: (exercise: Exercise) => void
  onRestTimerStart: () => void
}

export default function ExerciseTracker({ 
  exercise, 
  isActive, 
  onUpdate,
  onRestTimerStart 
}: ExerciseTrackerProps) {
  const [newReps, setNewReps] = useState('')
  const [newWeight, setNewWeight] = useState('')

  const addSet = () => {
    if (!newReps || !newWeight) return
    
    const updatedExercise = {
      ...exercise,
      sets: [
        ...exercise.sets,
        {
          reps: parseInt(newReps),
          weight: parseFloat(newWeight),
          completed: false
        }
      ]
    }
    
    onUpdate(updatedExercise)
    
    // Keep the same weight for convenience
    setNewReps('')
  }

  const toggleSet = (setIndex: number) => {
    const updatedExercise = {
      ...exercise,
      sets: exercise.sets.map((set, idx) => 
        idx === setIndex ? { ...set, completed: !set.completed } : set
      )
    }
    
    onUpdate(updatedExercise)
    
    // Start rest timer if set was just completed
    if (!exercise.sets[setIndex].completed) {
      onRestTimerStart()
    }
  }

  const removeSet = (setIndex: number) => {
    const updatedExercise = {
      ...exercise,
      sets: exercise.sets.filter((_, idx) => idx !== setIndex)
    }
    
    onUpdate(updatedExercise)
  }

  const completedSets = exercise.sets.filter(set => set.completed).length

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
      isActive ? 'ring-2 ring-blue-500' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {exercise.name}
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {completedSets}/{exercise.sets.length} sets
        </span>
      </div>

      {/* Existing Sets */}
      {exercise.sets.length > 0 && (
        <div className="space-y-2 mb-4">
          {exercise.sets.map((set, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                set.completed
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleSet(index)}
                  className={`w-6 h-6 rounded-full border-2 transition-colors ${
                    set.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-400 dark:border-gray-500 hover:border-blue-500'
                  }`}
                >
                  {set.completed && (
                    <svg className="w-4 h-4 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Set {index + 1}
                </span>
                <span className="text-gray-900 dark:text-white">
                  {set.weight} lbs × {set.reps} reps
                </span>
              </div>
              <button
                onClick={() => removeSet(index)}
                className="text-red-500 hover:text-red-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Set */}
      {isActive && (
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Weight"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
          />
          <input
            type="number"
            placeholder="Reps"
            value={newReps}
            onChange={(e) => setNewReps(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
          />
          <button
            onClick={addSet}
            disabled={!newReps || !newWeight}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Add Set
          </button>
        </div>
      )}
    </div>
  )
}