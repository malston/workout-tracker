import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import {
  getFromLocalStorage,
  setToLocalStorage,
  localStorageKeys,
  generateId,
} from '../utils/localStorage';

// Types for workouts
type Workout = {
  id: string;
  name: string;
  date: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type WorkoutWithSets = Workout & {
  exercises: Array<{
    id: string;
    exercise: {
      id: string;
      name: string;
      category: string;
    };
    sets: Array<{
      id: string;
      setNumber: number;
      reps?: number | null;
      weight?: number | null;
      duration?: number | null;
      distance?: number | null;
      notes?: string | null;
    }>;
  }>;
};

type NewWorkout = Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>;

export const useWorkouts = () => {
  const { isConnected } = useDatabase();
  const [workouts, setWorkouts] = useState<WorkoutWithSets[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workouts from API or localStorage
  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isConnected) {
        // Try to load from database via API
        const response = await fetch('/api/workouts');
        if (response.ok) {
          const dbWorkouts = await response.json();
          setWorkouts(dbWorkouts);
          // Sync to localStorage as backup
          setToLocalStorage(localStorageKeys.workouts, dbWorkouts);
        } else {
          throw new Error('Failed to fetch workouts from database');
        }
      } else {
        // Fallback to localStorage
        const localWorkouts = getFromLocalStorage<WorkoutWithSets[]>(
          localStorageKeys.workouts,
          []
        );
        setWorkouts(localWorkouts);
      }
    } catch (err) {
      console.error('Failed to load workouts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workouts');
      
      // Try localStorage as fallback
      const localWorkouts = getFromLocalStorage<WorkoutWithSets[]>(
        localStorageKeys.workouts,
        []
      );
      setWorkouts(localWorkouts);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Create new workout
  const createWorkout = useCallback(async (workoutData: NewWorkout) => {
    setError(null);

    try {
      if (isConnected) {
        // Create in database via API
        const response = await fetch('/api/workouts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(workoutData),
        });

        if (!response.ok) {
          throw new Error('Failed to create workout in database');
        }

        const newWorkout = await response.json();
        setWorkouts(prev => [...prev, newWorkout]);
        
        // Update localStorage
        const updatedWorkouts = [...workouts, newWorkout];
        setToLocalStorage(localStorageKeys.workouts, updatedWorkouts);
        
        return newWorkout;
      } else {
        // Create in localStorage
        const newWorkout: WorkoutWithSets = {
          id: generateId(),
          ...workoutData,
          exercises: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const updatedWorkouts = [...workouts, newWorkout];
        setWorkouts(updatedWorkouts);
        setToLocalStorage(localStorageKeys.workouts, updatedWorkouts);
        
        return newWorkout;
      }
    } catch (err) {
      console.error('Failed to create workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to create workout');
      throw err;
    }
  }, [isConnected, workouts]);

  // Get workout by ID
  const getWorkout = useCallback((id: string) => {
    return workouts.find(w => w.id === id);
  }, [workouts]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return {
    workouts,
    loading,
    error,
    createWorkout,
    getWorkout,
    refetch: loadWorkouts
  };
};