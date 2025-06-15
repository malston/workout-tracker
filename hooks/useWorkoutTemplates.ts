import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { WorkoutTemplate, NewWorkoutTemplate, TemplateExercise, NewTemplateExercise } from '../lib/db/schema';
import { useDatabase } from './useDatabase';
import {
  getFromLocalStorage,
  setToLocalStorage,
  localStorageKeys,
  generateId,
} from '../utils/localStorage';

interface WorkoutTemplateWithExercises extends WorkoutTemplate {
  exercises?: TemplateExercise[];
}

export const useWorkoutTemplates = () => {
  const { isConnected } = useDatabase();
  const [templates, setTemplates] = useState<WorkoutTemplateWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates from database or localStorage
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isConnected) {
        // Try to load from database
        const dbTemplates = await db
          .selectFrom('workoutTemplates')
          .selectAll()
          .orderBy('name')
          .execute();
        
        // Load exercises for each template
        const templatesWithExercises = await Promise.all(
          dbTemplates.map(async (template) => {
            const exercises = await db
              .selectFrom('templateExercises')
              .selectAll()
              .where('templateId', '=', template.id)
              .orderBy('orderIndex')
              .execute();
            
            return { ...template, exercises };
          })
        );
        
        setTemplates(templatesWithExercises);
        // Sync to localStorage as backup
        setToLocalStorage(localStorageKeys.workoutTemplates, templatesWithExercises);
      } else {
        // Fallback to localStorage
        const localTemplates = getFromLocalStorage<WorkoutTemplateWithExercises[]>(
          localStorageKeys.workoutTemplates,
          []
        );
        setTemplates(localTemplates);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      
      // Try localStorage as fallback
      const localTemplates = getFromLocalStorage<WorkoutTemplateWithExercises[]>(
        localStorageKeys.workoutTemplates,
        []
      );
      setTemplates(localTemplates);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Create a new template
  const createTemplate = useCallback(
    async (template: NewWorkoutTemplate, exercises: NewTemplateExercise[]): Promise<WorkoutTemplate | null> => {
      try {
        if (isConnected) {
          // Try to insert into database
          const [newTemplate] = await db
            .insertInto('workoutTemplates')
            .values(template)
            .returningAll()
            .execute();
          
          // Insert exercises
          if (exercises.length > 0) {
            await db
              .insertInto('templateExercises')
              .values(exercises.map((ex, index) => ({ 
                ...ex, 
                templateId: newTemplate.id,
                orderIndex: index
              })))
              .execute();
          }
          
          await loadTemplates();
          return newTemplate;
        } else {
          // Fallback to localStorage
          const newTemplate: WorkoutTemplateWithExercises = {
            id: generateId(),
            ...template,
            createdAt: new Date(),
            updatedAt: new Date(),
            exercises: exercises.map((ex, index) => ({
              id: generateId(),
              templateId: generateId(), // Will be replaced
              orderIndex: index,
              ...ex,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          };
          
          const updatedTemplates = [...templates, newTemplate];
          setTemplates(updatedTemplates);
          setToLocalStorage(localStorageKeys.workoutTemplates, updatedTemplates);
          
          return newTemplate;
        }
      } catch (err) {
        console.error('Failed to create template:', err);
        setError(err instanceof Error ? err.message : 'Failed to create template');
        return null;
      }
    },
    [isConnected, templates, loadTemplates]
  );

  // Update a template
  const updateTemplate = useCallback(
    async (id: string, updates: Partial<NewWorkoutTemplate>): Promise<boolean> => {
      try {
        if (isConnected) {
          // Try to update in database
          await db
            .updateTable('workoutTemplates')
            .set({ ...updates, updatedAt: new Date() })
            .where('id', '=', id)
            .execute();
          
          await loadTemplates();
          return true;
        } else {
          // Fallback to localStorage
          const updatedTemplates = templates.map((template) =>
            template.id === id
              ? { ...template, ...updates, updatedAt: new Date() }
              : template
          );
          
          setTemplates(updatedTemplates);
          setToLocalStorage(localStorageKeys.workoutTemplates, updatedTemplates);
          return true;
        }
      } catch (err) {
        console.error('Failed to update template:', err);
        setError(err instanceof Error ? err.message : 'Failed to update template');
        return false;
      }
    },
    [isConnected, templates, loadTemplates]
  );

  // Delete a template
  const deleteTemplate = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        if (isConnected) {
          // Try to delete from database (cascade will handle exercises)
          await db
            .deleteFrom('workoutTemplates')
            .where('id', '=', id)
            .execute();
          
          await loadTemplates();
          return true;
        } else {
          // Fallback to localStorage
          const updatedTemplates = templates.filter((template) => template.id !== id);
          setTemplates(updatedTemplates);
          setToLocalStorage(localStorageKeys.workoutTemplates, updatedTemplates);
          return true;
        }
      } catch (err) {
        console.error('Failed to delete template:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete template');
        return false;
      }
    },
    [isConnected, templates, loadTemplates]
  );

  // Duplicate a template
  const duplicateTemplate = useCallback(
    async (id: string, newName: string): Promise<WorkoutTemplate | null> => {
      const template = templates.find((t) => t.id === id);
      if (!template) return null;

      const newTemplate: NewWorkoutTemplate = {
        name: newName,
        description: template.description,
        userId: template.userId,
      };

      const newExercises: NewTemplateExercise[] = (template.exercises || []).map((ex) => ({
        exerciseId: ex.exerciseId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        restSeconds: ex.restSeconds,
        notes: ex.notes,
      }));

      return createTemplate(newTemplate, newExercises);
    },
    [templates, createTemplate]
  );

  // Load templates when connection status changes
  useEffect(() => {
    if (!loading) {
      loadTemplates();
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => {
    loadTemplates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    refreshTemplates: loadTemplates,
  };
};