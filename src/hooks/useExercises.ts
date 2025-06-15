import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { Exercise, NewExercise } from '../lib/db/schema';
import { useDatabase } from './useDatabase';
import {
  getFromLocalStorage,
  setToLocalStorage,
  localStorageKeys,
  generateId,
} from '../utils/localStorage';

export const useExercises = () => {
  const { isConnected } = useDatabase();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load exercises from database or localStorage
  const loadExercises = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isConnected) {
        // Try to load from database
        const dbExercises = await db
          .selectFrom('exercises')
          .selectAll()
          .orderBy('name')
          .execute();
        
        setExercises(dbExercises);
        // Sync to localStorage as backup
        setToLocalStorage(localStorageKeys.exercises, dbExercises);
      } else {
        // Fallback to localStorage
        const localExercises = getFromLocalStorage<Exercise[]>(
          localStorageKeys.exercises,
          []
        );
        setExercises(localExercises);
      }
    } catch (err) {
      console.error('Failed to load exercises:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
      
      // Try localStorage as fallback
      const localExercises = getFromLocalStorage<Exercise[]>(
        localStorageKeys.exercises,
        []
      );
      setExercises(localExercises);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Create a new exercise
  const createExercise = useCallback(
    async (exercise: NewExercise): Promise<Exercise | null> => {
      try {
        if (isConnected) {
          // Try to insert into database
          const [newExercise] = await db
            .insertInto('exercises')
            .values(exercise)
            .returningAll()
            .execute();
          
          await loadExercises();
          return newExercise;
        } else {
          // Fallback to localStorage
          const newExercise: Exercise = {
            id: generateId(),
            ...exercise,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          const updatedExercises = [...exercises, newExercise];
          setExercises(updatedExercises);
          setToLocalStorage(localStorageKeys.exercises, updatedExercises);
          
          return newExercise;
        }
      } catch (err) {
        console.error('Failed to create exercise:', err);
        setError(err instanceof Error ? err.message : 'Failed to create exercise');
        return null;
      }
    },
    [isConnected, exercises, loadExercises]
  );

  // Update an exercise
  const updateExercise = useCallback(
    async (id: string, updates: Partial<NewExercise>): Promise<boolean> => {
      try {
        if (isConnected) {
          // Try to update in database
          await db
            .updateTable('exercises')
            .set({ ...updates, updatedAt: new Date() })
            .where('id', '=', id)
            .execute();
          
          await loadExercises();
          return true;
        } else {
          // Fallback to localStorage
          const updatedExercises = exercises.map((ex) =>
            ex.id === id
              ? { ...ex, ...updates, updatedAt: new Date() }
              : ex
          );
          
          setExercises(updatedExercises);
          setToLocalStorage(localStorageKeys.exercises, updatedExercises);
          return true;
        }
      } catch (err) {
        console.error('Failed to update exercise:', err);
        setError(err instanceof Error ? err.message : 'Failed to update exercise');
        return false;
      }
    },
    [isConnected, exercises, loadExercises]
  );

  // Delete an exercise
  const deleteExercise = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        if (isConnected) {
          // Try to delete from database
          await db
            .deleteFrom('exercises')
            .where('id', '=', id)
            .execute();
          
          await loadExercises();
          return true;
        } else {
          // Fallback to localStorage
          const updatedExercises = exercises.filter((ex) => ex.id !== id);
          setExercises(updatedExercises);
          setToLocalStorage(localStorageKeys.exercises, updatedExercises);
          return true;
        }
      } catch (err) {
        console.error('Failed to delete exercise:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete exercise');
        return false;
      }
    },
    [isConnected, exercises, loadExercises]
  );

  // Load exercises when connection status changes
  useEffect(() => {
    if (!loading) {
      loadExercises();
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => {
    loadExercises();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    exercises,
    loading,
    error,
    createExercise,
    updateExercise,
    deleteExercise,
    refreshExercises: loadExercises,
  };
};