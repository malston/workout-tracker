import { ImportedExercise, ImportedWorkout, ImportedSet } from './types';
import { ExerciseCategory } from '../../app/types';

const VALID_CATEGORIES: ExerciseCategory[] = ['strength', 'cardio', 'flexibility', 'balance', 'sports', 'other'];

const VALID_MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'obliques', 'lower back', 'glutes', 'quadriceps', 'hamstrings',
  'calves', 'hip flexors', 'adductors', 'abductors', 'neck', 'full body'
];

export function validateExercise(exercise: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate name
  if (!exercise.name || typeof exercise.name !== 'string' || exercise.name.trim().length === 0) {
    errors.push('Exercise name is required and must be a non-empty string');
  }

  // Validate category
  if (!exercise.category || !VALID_CATEGORIES.includes(exercise.category as ExerciseCategory)) {
    errors.push(`Exercise category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate muscle groups
  if (!exercise.muscleGroup || !Array.isArray(exercise.muscleGroup) || exercise.muscleGroup.length === 0) {
    errors.push('Exercise must have at least one muscle group');
  } else {
    const invalidGroups = exercise.muscleGroup.filter((group: string) => 
      !VALID_MUSCLE_GROUPS.includes(group.toLowerCase())
    );
    if (invalidGroups.length > 0) {
      errors.push(`Invalid muscle groups: ${invalidGroups.join(', ')}. Valid options: ${VALID_MUSCLE_GROUPS.join(', ')}`);
    }
  }

  // Validate notes (optional)
  if (exercise.notes !== undefined && typeof exercise.notes !== 'string') {
    errors.push('Exercise notes must be a string');
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorkout(workout: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate name
  if (!workout.name || typeof workout.name !== 'string' || workout.name.trim().length === 0) {
    errors.push('Workout name is required and must be a non-empty string');
  }

  // Validate date
  if (!workout.date) {
    errors.push('Workout date is required');
  } else {
    const date = new Date(workout.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid workout date format');
    }
  }

  // Validate notes (optional)
  if (workout.notes !== undefined && typeof workout.notes !== 'string') {
    errors.push('Workout notes must be a string');
  }

  // Validate exercises
  if (!workout.exercises || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
    errors.push('Workout must have at least one exercise');
  } else {
    workout.exercises.forEach((exercise: any, index: number) => {
      const exerciseErrors = validateWorkoutExercise(exercise, index);
      errors.push(...exerciseErrors);
    });
  }

  return { valid: errors.length === 0, errors };
}

function validateWorkoutExercise(exercise: any, index: number): string[] {
  const errors: string[] = [];
  const prefix = `Exercise ${index + 1}: `;

  // Validate exercise name
  if (!exercise.exerciseName || typeof exercise.exerciseName !== 'string' || exercise.exerciseName.trim().length === 0) {
    errors.push(prefix + 'Exercise name is required');
  }

  // Validate order
  if (exercise.order === undefined || typeof exercise.order !== 'number' || exercise.order < 0) {
    errors.push(prefix + 'Exercise order must be a non-negative number');
  }

  // Validate sets
  if (!exercise.sets || !Array.isArray(exercise.sets) || exercise.sets.length === 0) {
    errors.push(prefix + 'Exercise must have at least one set');
  } else {
    exercise.sets.forEach((set: any, setIndex: number) => {
      const setErrors = validateSet(set, setIndex, prefix);
      errors.push(...setErrors);
    });
  }

  return errors;
}

function validateSet(set: any, index: number, prefix: string): string[] {
  const errors: string[] = [];
  const setPrefix = prefix + `Set ${index + 1}: `;

  // Validate set number
  if (set.setNumber === undefined || typeof set.setNumber !== 'number' || set.setNumber < 1) {
    errors.push(setPrefix + 'Set number must be a positive number');
  }

  // At least one metric should be present
  const hasMetric = set.reps !== undefined || set.weight !== undefined || 
                   set.duration !== undefined || set.distance !== undefined;
  
  if (!hasMetric) {
    errors.push(setPrefix + 'At least one metric (reps, weight, duration, or distance) is required');
  }

  // Validate individual metrics if present
  if (set.reps !== undefined && (typeof set.reps !== 'number' || set.reps < 0)) {
    errors.push(setPrefix + 'Reps must be a non-negative number');
  }

  if (set.weight !== undefined && (typeof set.weight !== 'number' || set.weight < 0)) {
    errors.push(setPrefix + 'Weight must be a non-negative number');
  }

  if (set.duration !== undefined && (typeof set.duration !== 'number' || set.duration < 0)) {
    errors.push(setPrefix + 'Duration must be a non-negative number');
  }

  if (set.distance !== undefined && (typeof set.distance !== 'number' || set.distance < 0)) {
    errors.push(setPrefix + 'Distance must be a non-negative number');
  }

  if (set.notes !== undefined && typeof set.notes !== 'string') {
    errors.push(setPrefix + 'Notes must be a string');
  }

  return errors;
}

export function normalizeExercise(exercise: any): ImportedExercise {
  return {
    name: exercise.name.trim(),
    category: exercise.category.toLowerCase(),
    muscleGroup: exercise.muscleGroup.map((group: string) => group.toLowerCase()),
    notes: exercise.notes?.trim()
  };
}

export function normalizeWorkout(workout: any): ImportedWorkout {
  return {
    name: workout.name.trim(),
    date: new Date(workout.date),
    notes: workout.notes?.trim(),
    exercises: workout.exercises.map((exercise: any, index: number) => ({
      exerciseName: exercise.exerciseName.trim(),
      order: exercise.order !== undefined ? exercise.order : index,
      sets: exercise.sets.map((set: any, setIndex: number) => ({
        setNumber: set.setNumber !== undefined ? set.setNumber : setIndex + 1,
        reps: set.reps,
        weight: set.weight,
        duration: set.duration,
        distance: set.distance,
        notes: set.notes?.trim()
      }))
    }))
  };
}