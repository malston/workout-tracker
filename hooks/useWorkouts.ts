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
  status: 'planned' | 'completed';
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

type NewWorkout = Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> & {
  exercises?: any[];
  templateId?: string | null;
};

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
          console.log('Loaded workouts from DB:', dbWorkouts);
          
          // Get any local workouts that might not be in the database
          const localWorkouts = getFromLocalStorage<WorkoutWithSets[]>(
            localStorageKeys.workouts,
            []
          );
          
          // Merge database workouts with any local-only workouts (by checking IDs)
          const dbIds = new Set(dbWorkouts.map((w: any) => w.id));
          const localOnlyWorkouts = localWorkouts.filter(w => !dbIds.has(w.id));
          
          // Add status field to database workouts if missing
          const normalizedDbWorkouts = dbWorkouts.map((w: any) => ({
            ...w,
            status: w.status || 'completed' // Default old workouts to completed
          }));
          
          const mergedWorkouts = [...normalizedDbWorkouts, ...localOnlyWorkouts];
          console.log('Merged workouts:', mergedWorkouts);
          
          setWorkouts(mergedWorkouts);
          // Sync to localStorage as backup
          setToLocalStorage(localStorageKeys.workouts, mergedWorkouts);
        } else {
          throw new Error('Failed to fetch workouts from database');
        }
      } else {
        // Fallback to localStorage
        const localWorkouts = getFromLocalStorage<WorkoutWithSets[]>(
          localStorageKeys.workouts,
          []
        );
        console.log('Loaded workouts from localStorage:', localWorkouts);
        
        // Ensure all workouts have a status field
        const normalizedWorkouts = localWorkouts.map(w => ({
          ...w,
          status: w.status || 'completed'
        }));
        
        setWorkouts(normalizedWorkouts);
      }
    } catch (err) {
      console.error('Failed to load workouts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workouts');
      
      // Try localStorage as fallback
      const localWorkouts = getFromLocalStorage<WorkoutWithSets[]>(
        localStorageKeys.workouts,
        []
      );
      console.log('Fallback - loaded workouts from localStorage:', localWorkouts);
      
      // Ensure all workouts have a status field
      const normalizedWorkouts = localWorkouts.map(w => ({
        ...w,
        status: w.status || 'completed'
      }));
      
      setWorkouts(normalizedWorkouts);
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
          console.warn('Failed to create workout in database, falling back to localStorage');
          // Fall back to localStorage instead of throwing error
          const newWorkout: WorkoutWithSets = {
            id: generateId(),
            ...workoutData,
            status: workoutData.status || 'planned',
            exercises: workoutData.exercises || [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const updatedWorkouts = [...workouts, newWorkout];
          setWorkouts(updatedWorkouts);
          setToLocalStorage(localStorageKeys.workouts, updatedWorkouts);
          
          return newWorkout;
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
          status: workoutData.status || 'planned',
          exercises: workoutData.exercises || [],
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

  // Update existing workout
  const updateWorkout = useCallback(async (id: string, updates: Partial<WorkoutWithSets>) => {
    setError(null);

    try {
      if (isConnected) {
        // Try to update in database via API
        const response = await fetch(`/api/workouts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          console.warn('Failed to update workout in database, falling back to localStorage');
        }
      }
      
      // Update in local state and localStorage
      const updatedWorkouts = workouts.map(workout => 
        workout.id === id 
          ? { ...workout, ...updates, updatedAt: new Date() }
          : workout
      );
      
      setWorkouts(updatedWorkouts);
      setToLocalStorage(localStorageKeys.workouts, updatedWorkouts);
      
      // Return the updated workout
      return updatedWorkouts.find(w => w.id === id);
    } catch (err) {
      console.error('Failed to update workout:', err);
      setError(err instanceof Error ? err.message : 'Failed to update workout');
      throw err;
    }
  }, [isConnected, workouts]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return {
    workouts,
    loading,
    error,
    createWorkout,
    addWorkout: createWorkout, // Alias for backward compatibility
    getWorkout,
    updateWorkout,
    refetch: loadWorkouts
  };
};