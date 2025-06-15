import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import {
  getFromLocalStorage,
  setToLocalStorage,
  localStorageKeys,
  generateId,
} from '../utils/localStorage';

// Types matching the Prisma schema
type Exercise = {
  id: string;
  name: string;
  category: string;
  muscleGroup: string[];
  equipment?: string | null;
  difficulty?: string | null;
  instructions?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type NewExercise = Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>;

export const useExercises = () => {
  const { isConnected } = useDatabase();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load exercises from database or localStorage
  const loadExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isConnected) {
        // Try to load from database via API
        const response = await fetch('/api/exercises');
        if (response.ok) {
          const dbExercises = await response.json();
          setExercises(dbExercises);
          // Sync to localStorage as backup
          setToLocalStorage(localStorageKeys.exercises, dbExercises);
        } else {
          throw new Error('Failed to fetch exercises from database');
        }
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
      setIsLoading(false);
    }
  }, [isConnected]);

  // Create new exercise
  const createExercise = useCallback(async (exerciseData: NewExercise) => {
    setError(null);

    try {
      if (isConnected) {
        // Create in database via API
        const response = await fetch('/api/exercises', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(exerciseData),
        });

        if (!response.ok) {
          throw new Error('Failed to create exercise in database');
        }

        const newExercise = await response.json();
        setExercises(prev => [...prev, newExercise]);
        
        // Update localStorage
        const updatedExercises = [...exercises, newExercise];
        setToLocalStorage(localStorageKeys.exercises, updatedExercises);
        
        return newExercise;
      } else {
        // Create in localStorage
        const newExercise: Exercise = {
          id: generateId(),
          ...exerciseData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const updatedExercises = [...exercises, newExercise];
        setExercises(updatedExercises);
        setToLocalStorage(localStorageKeys.exercises, updatedExercises);
        
        return newExercise;
      }
    } catch (err) {
      console.error('Failed to create exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to create exercise');
      throw err;
    }
  }, [isConnected, exercises]);

  // Update exercise
  const updateExercise = useCallback(async (id: string, updates: Partial<NewExercise>) => {
    setError(null);

    try {
      if (isConnected) {
        // Update in database via API
        const response = await fetch(`/api/exercises/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update exercise in database');
        }

        const updatedExercise = await response.json();
        setExercises(prev => prev.map(ex => ex.id === id ? updatedExercise : ex));
        
        // Update localStorage
        const updatedExercises = exercises.map(ex => ex.id === id ? updatedExercise : ex);
        setToLocalStorage(localStorageKeys.exercises, updatedExercises);
        
        return updatedExercise;
      } else {
        // Update in localStorage
        const updatedExercises = exercises.map(ex => 
          ex.id === id 
            ? { ...ex, ...updates, updatedAt: new Date() }
            : ex
        );
        
        setExercises(updatedExercises);
        setToLocalStorage(localStorageKeys.exercises, updatedExercises);
        
        return updatedExercises.find(ex => ex.id === id)!;
      }
    } catch (err) {
      console.error('Failed to update exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to update exercise');
      throw err;
    }
  }, [isConnected, exercises]);

  // Delete exercise
  const deleteExercise = useCallback(async (id: string) => {
    setError(null);

    try {
      if (isConnected) {
        // Delete from database via API
        const response = await fetch(`/api/exercises/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete exercise from database');
        }
      }
      
      // Remove from state and localStorage
      const updatedExercises = exercises.filter(ex => ex.id !== id);
      setExercises(updatedExercises);
      setToLocalStorage(localStorageKeys.exercises, updatedExercises);
    } catch (err) {
      console.error('Failed to delete exercise:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete exercise');
      throw err;
    }
  }, [isConnected, exercises]);

  // Get exercise by ID
  const getExercise = useCallback((id: string) => {
    return exercises.find(ex => ex.id === id);
  }, [exercises]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  return {
    exercises,
    isLoading,
    error,
    createExercise,
    updateExercise,
    deleteExercise,
    getExercise,
    refetch: loadExercises
  };
};