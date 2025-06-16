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
  const [editingSet, setEditingSet] = useState<number | null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [editReps, setEditReps] = useState('')

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

  const startEditingSet = (setIndex: number) => {
    setEditingSet(setIndex)
    setEditWeight(exercise.sets[setIndex].weight.toString())
    setEditReps(exercise.sets[setIndex].reps.toString())
  }

  const saveSetEdit = (setIndex: number) => {
    if (!editWeight || !editReps) return
    
    const updatedExercise = {
      ...exercise,
      sets: exercise.sets.map((set, idx) => 
        idx === setIndex 
          ? { ...set, weight: parseFloat(editWeight), reps: parseInt(editReps) }
          : set
      )
    }
    
    onUpdate(updatedExercise)
    setEditingSet(null)
  }

  const cancelEdit = () => {
    setEditingSet(null)
    setEditWeight('')
    setEditReps('')
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
              <div className="flex items-center gap-4 flex-1">
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
                {editingSet === index ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="Weight"
                    />
                    <span className="text-sm text-gray-500">lbs ×</span>
                    <input
                      type="number"
                      value={editReps}
                      onChange={(e) => setEditReps(e.target.value)}
                      className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      placeholder="Reps"
                    />
                    <span className="text-sm text-gray-500">reps</span>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditingSet(index)}
                    className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {set.weight} lbs × {set.reps} reps
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                {editingSet === index ? (
                  <>
                    <button
                      onClick={() => saveSetEdit(index)}
                      className="text-green-500 hover:text-green-600 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-500 hover:text-gray-600 p-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditingSet(index)}
                      className="text-blue-500 hover:text-blue-600 p-1"
                      title="Edit set"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeSet(index)}
                      className="text-red-500 hover:text-red-600 p-1"
                      title="Remove set"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
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