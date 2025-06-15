export interface ImportedExercise {
  name: string;
  category: string;
  muscleGroup: string[];
  notes?: string;
}

export interface ImportedWorkout {
  name: string;
  date: string | Date;
  notes?: string;
  exercises: ImportedWorkoutExercise[];
}

export interface ImportedWorkoutExercise {
  exerciseName: string;
  order: number;
  sets: ImportedSet[];
}

export interface ImportedSet {
  setNumber: number;
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
  notes?: string;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T[];
  errors?: string[];
}

export interface FileImportOptions {
  type: 'exercise' | 'workout';
  userId?: string;
}

export type SupportedFileType = 'csv' | 'json' | 'xml';