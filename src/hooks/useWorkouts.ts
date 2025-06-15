import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { Workout, NewWorkout, WorkoutSet, NewWorkoutSet } from '../lib/db/schema';
import { useDatabase } from './useDatabase';
import {
  getFromLocalStorage,
  setToLocalStorage,
  localStorageKeys,
  generateId,
} from '../utils/localStorage';

interface WorkoutWithSets extends Workout {
  sets?: WorkoutSet[];
}

export const useWorkouts = () => {
  const { isConnected } = useDatabase();
  const [workouts, setWorkouts] = useState<WorkoutWithSets[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workouts from database or localStorage
  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isConnected) {
        // Try to load from database
        const dbWorkouts = await db
          .selectFrom('workouts')
          .selectAll()
          .orderBy('completedAt', 'desc')
          .execute();
        
        // Load sets for each workout
        const workoutsWithSets = await Promise.all(
          dbWorkouts.map(async (workout) => {
            const sets = await db
              .selectFrom('workoutSets')
              .selectAll()
              .where('workoutId', '=', workout.id)
              .orderBy('setNumber')
              .execute();
            
            return { ...workout, sets };
          })
        );
        
        setWorkouts(workoutsWithSets);
        // Sync to localStorage as backup
        setToLocalStorage(localStorageKeys.workouts, workoutsWithSets);
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

  // Create a new workout
  const createWorkout = useCallback(
    async (workout: NewWorkout, sets: NewWorkoutSet[]): Promise<Workout | null> => {
      try {
        if (isConnected) {
          // Try to insert into database
          const [newWorkout] = await db
            .insertInto('workouts')
            .values(workout)
            .returningAll()
            .execute();
          
          // Insert sets
          if (sets.length > 0) {
            await db
              .insertInto('workoutSets')
              .values(sets.map(set => ({ ...set, workoutId: newWorkout.id })))
              .execute();
          }
          
          await loadWorkouts();
          return newWorkout;
        } else {
          // Fallback to localStorage
          const newWorkout: WorkoutWithSets = {
            id: generateId(),
            ...workout,
            createdAt: new Date(),
            updatedAt: new Date(),
            sets: sets.map((set, index) => ({
              id: generateId(),
              workoutId: generateId(), // Will be replaced
              setNumber: index + 1,
              ...set,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          };
          
          const updatedWorkouts = [newWorkout, ...workouts];
          setWorkouts(updatedWorkouts);
          setToLocalStorage(localStorageKeys.workouts, updatedWorkouts);
          
          return newWorkout;
        }
      } catch (err) {
        console.error('Failed to create workout:', err);
        setError(err instanceof Error ? err.message : 'Failed to create workout');
        return null;
      }
    },
    [isConnected, workouts, loadWorkouts]
  );

  // Update a workout
  const updateWorkout = useCallback(
    async (id: string, updates: Partial<NewWorkout>): Promise<boolean> => {
      try {
        if (isConnected) {
          // Try to update in database
          await db
            .updateTable('workouts')
            .set({ ...updates, updatedAt: new Date() })
            .where('id', '=', id)
            .execute();
          
          await loadWorkouts();
          return true;
        } else {
          // Fallback to localStorage
          const updatedWorkouts = workouts.map((workout) =>
            workout.id === id
              ? { ...workout, ...updates, updatedAt: new Date() }
              : workout
          );
          
          setWorkouts(updatedWorkouts);
          setToLocalStorage(localStorageKeys.workouts, updatedWorkouts);
          return true;
        }
      } catch (err) {
        console.error('Failed to update workout:', err);
        setError(err instanceof Error ? err.message : 'Failed to update workout');
        return false;
      }
    },
    [isConnected, workouts, loadWorkouts]
  );

  // Delete a workout
  const deleteWorkout = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        if (isConnected) {
          // Try to delete from database (cascade will handle sets)
          await db
            .deleteFrom('workouts')
            .where('id', '=', id)
            .execute();
          
          await loadWorkouts();
          return true;
        } else {
          // Fallback to localStorage
          const updatedWorkouts = workouts.filter((workout) => workout.id !== id);
          setWorkouts(updatedWorkouts);
          setToLocalStorage(localStorageKeys.workouts, updatedWorkouts);
          return true;
        }
      } catch (err) {
        console.error('Failed to delete workout:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete workout');
        return false;
      }
    },
    [isConnected, workouts, loadWorkouts]
  );

  // Get workouts by date range
  const getWorkoutsByDateRange = useCallback(
    (startDate: Date, endDate: Date): WorkoutWithSets[] => {
      return workouts.filter((workout) => {
        const completedAt = workout.completedAt ? new Date(workout.completedAt) : null;
        return (
          completedAt &&
          completedAt >= startDate &&
          completedAt <= endDate
        );
      });
    },
    [workouts]
  );

  // Load workouts when connection status changes
  useEffect(() => {
    if (!loading) {
      loadWorkouts();
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => {
    loadWorkouts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    workouts,
    loading,
    error,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutsByDateRange,
    refreshWorkouts: loadWorkouts,
  };
};