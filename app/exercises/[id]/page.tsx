'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExercises } from '@/hooks/useExercises';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, LoadingSpinner } from '@/components';

const EXERCISE_CATEGORIES = [
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'balance', label: 'Balance' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' }
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const COMMON_MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'core', 'abs', 'obliques', 'quadriceps', 'hamstrings', 'glutes',
  'calves', 'full body', 'cardio'
];

export default function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { getExercise, updateExercise, deleteExercise } = useExercises();
  
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [exercise, setExercise] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editData, setEditData] = useState({
    name: '',
    category: 'strength',
    muscleGroup: [] as string[],
    equipment: '',
    difficulty: 'beginner',
    instructions: '',
    notes: ''
  });

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setIsLoading(true);
        const { id } = await params;
        setExerciseId(id);
        const foundExercise = getExercise(id);
        
        if (!foundExercise) {
          // Try to fetch from API if not in local state
          const response = await fetch(`/api/exercises/${id}`);
          if (response.ok) {
            const apiExercise = await response.json();
            setExercise(apiExercise);
            setEditData({
              name: apiExercise.name || '',
              category: apiExercise.category || 'strength',
              muscleGroup: apiExercise.muscleGroup || [],
              equipment: apiExercise.equipment || '',
              difficulty: apiExercise.difficulty || 'beginner',
              instructions: apiExercise.instructions || '',
              notes: apiExercise.notes || ''
            });
          } else {
            setError('Exercise not found');
          }
        } else {
          setExercise(foundExercise);
          setEditData({
            name: foundExercise.name || '',
            category: foundExercise.category || 'strength',
            muscleGroup: foundExercise.muscleGroup || [],
            equipment: foundExercise.equipment || '',
            difficulty: foundExercise.difficulty || 'beginner',
            instructions: foundExercise.instructions || '',
            notes: foundExercise.notes || ''
          });
        }
      } catch (err) {
        setError('Failed to load exercise');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercise();
  }, [params, getExercise]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      if (!exerciseId) return;
      await updateExercise(exerciseId, editData);
      setIsEditing(false);
      
      // Refresh exercise data
      const updatedExercise = getExercise(exerciseId);
      if (updatedExercise) {
        setExercise(updatedExercise);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exercise');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      if (!exerciseId) return;
      await deleteExercise(exerciseId);
      router.push('/exercises');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exercise');
    }
  };

  const toggleMuscleGroup = (muscleGroup: string) => {
    setEditData(prev => ({
      ...prev,
      muscleGroup: prev.muscleGroup.includes(muscleGroup)
        ? prev.muscleGroup.filter(mg => mg !== muscleGroup)
        : [...prev.muscleGroup, muscleGroup]
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      strength: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      cardio: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      flexibility: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      balance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sports: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !exercise) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link href="/exercises">
              <Button>← Back to Exercises</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/exercises">
                <Button variant="outline" size="sm">
                  ← Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {exercise?.name || 'Exercise Details'}
              </h1>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Exercise Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exercise Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                {isEditing ? (
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Exercise name"
                  />
                ) : (
                  <p className="text-lg font-semibold">{exercise?.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                {isEditing ? (
                  <Select
                    options={EXERCISE_CATEGORIES}
                    value={editData.category}
                    onChange={(value) => setEditData(prev => ({ ...prev, category: value }))}
                  />
                ) : (
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(exercise?.category)}`}>
                    {exercise?.category}
                  </span>
                )}
              </div>

              {/* Muscle Groups */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Muscle Groups
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COMMON_MUSCLE_GROUPS.map(mg => (
                      <button
                        key={mg}
                        type="button"
                        onClick={() => toggleMuscleGroup(mg)}
                        className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                          editData.muscleGroup.includes(mg)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        {mg}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {exercise?.muscleGroup?.map((mg: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm"
                      >
                        {mg}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Equipment
                </label>
                {isEditing ? (
                  <Input
                    value={editData.equipment}
                    onChange={(e) => setEditData(prev => ({ ...prev, equipment: e.target.value }))}
                    placeholder="Equipment needed"
                  />
                ) : (
                  <p>{exercise?.equipment || 'None'}</p>
                )}
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                {isEditing ? (
                  <Select
                    options={DIFFICULTY_LEVELS}
                    value={editData.difficulty}
                    onChange={(value) => setEditData(prev => ({ ...prev, difficulty: value }))}
                  />
                ) : (
                  <p className="capitalize">{exercise?.difficulty}</p>
                )}
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructions
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.instructions}
                    onChange={(e) => setEditData(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="Step-by-step instructions..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{exercise?.instructions || 'No instructions provided'}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{exercise?.notes || 'No notes'}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Workout History */}
          <Card>
            <CardHeader>
              <CardTitle>Workout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No workout history available yet.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  History will appear here after you use this exercise in workouts.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}