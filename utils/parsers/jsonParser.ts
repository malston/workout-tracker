import { ImportedExercise, ImportedWorkout, ParseResult } from './types';
import { validateExercise, validateWorkout, normalizeExercise, normalizeWorkout } from './validators';

export function parseExerciseJSON(jsonContent: string): ParseResult<ImportedExercise> {
  const errors: string[] = [];
  const exercises: ImportedExercise[] = [];

  try {
    const parsed = JSON.parse(jsonContent);
    
    // Handle both single object and array
    const data = Array.isArray(parsed) ? parsed : [parsed];

    if (data.length === 0) {
      return { success: false, errors: ['JSON file contains no exercise data'] };
    }

    data.forEach((item, index) => {
      // Check if it's wrapped in an exercises property
      const exerciseData = item.exercises || item;
      const exercisesToProcess = Array.isArray(exerciseData) ? exerciseData : [exerciseData];

      exercisesToProcess.forEach((exercise, exerciseIndex) => {
        const validation = validateExercise(exercise);
        if (!validation.valid) {
          const prefix = data.length > 1 ? `Item ${index + 1}, ` : '';
          const exercisePrefix = exercisesToProcess.length > 1 ? `Exercise ${exerciseIndex + 1}: ` : '';
          errors.push(`${prefix}${exercisePrefix}${validation.errors.join('; ')}`);
        } else {
          exercises.push(normalizeExercise(exercise));
        }
      });
    });

    return {
      success: errors.length === 0,
      data: exercises,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

export function parseWorkoutJSON(jsonContent: string): ParseResult<ImportedWorkout> {
  const errors: string[] = [];
  const workouts: ImportedWorkout[] = [];

  try {
    const parsed = JSON.parse(jsonContent);
    
    // Handle both single object and array
    const data = Array.isArray(parsed) ? parsed : [parsed];

    if (data.length === 0) {
      return { success: false, errors: ['JSON file contains no workout data'] };
    }

    data.forEach((item, index) => {
      // Check if it's wrapped in a workouts property
      const workoutData = item.workouts || item;
      const workoutsToProcess = Array.isArray(workoutData) ? workoutData : [workoutData];

      workoutsToProcess.forEach((workout, workoutIndex) => {
        // Transform data if needed
        const transformedWorkout = transformWorkoutData(workout);
        
        const validation = validateWorkout(transformedWorkout);
        if (!validation.valid) {
          const prefix = data.length > 1 ? `Item ${index + 1}, ` : '';
          const workoutPrefix = workoutsToProcess.length > 1 ? `Workout ${workoutIndex + 1}: ` : '';
          errors.push(`${prefix}${workoutPrefix}${validation.errors.join('; ')}`);
        } else {
          workouts.push(normalizeWorkout(transformedWorkout));
        }
      });
    });

    return {
      success: errors.length === 0,
      data: workouts,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

function transformWorkoutData(workout: any): any {
  // Handle different JSON structures
  const transformed = { ...workout };

  // Handle exercises that might be named differently
  if (!transformed.exercises && transformed.workoutExercises) {
    transformed.exercises = transformed.workoutExercises;
  }

  // Transform exercises if needed
  if (transformed.exercises) {
    transformed.exercises = transformed.exercises.map((exercise: any) => {
      const transformedExercise = { ...exercise };

      // Handle exercise name variations
      if (!transformedExercise.exerciseName) {
        if (transformedExercise.exercise?.name) {
          transformedExercise.exerciseName = transformedExercise.exercise.name;
        } else if (transformedExercise.name) {
          transformedExercise.exerciseName = transformedExercise.name;
        }
      }

      // Ensure sets is an array
      if (!transformedExercise.sets && transformedExercise.set) {
        transformedExercise.sets = Array.isArray(transformedExercise.set) 
          ? transformedExercise.set 
          : [transformedExercise.set];
      }

      return transformedExercise;
    });
  }

  return transformed;
}