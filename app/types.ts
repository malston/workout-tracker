export type ExerciseCategory = 'strength' | 'cardio' | 'flexibility' | 'balance' | 'sports' | 'other';

export interface ExerciseFormData {
  name: string;
  category: ExerciseCategory;
  muscleGroup: string[];
  notes?: string;
}

export interface StrengthSetData {
  setNumber: number;
  reps?: number;
  weight?: number;
  notes?: string;
}

export interface CardioSetData {
  setNumber: number;
  duration?: number; // in minutes
  distance?: number; // in miles
  notes?: string;
}

export interface OtherSetData {
  setNumber: number;
  duration?: number; // in minutes
  notes?: string;
}

export type SetData = StrengthSetData | CardioSetData | OtherSetData;

export interface ExerciseWithDetails {
  id: string;
  name: string;
  category: string;
  muscleGroup: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseFilters {
  category?: ExerciseCategory;
  muscleGroup?: string;
  searchTerm?: string;
}