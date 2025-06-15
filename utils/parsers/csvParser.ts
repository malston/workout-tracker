import { ImportedExercise, ImportedWorkout, ParseResult } from './types';
import { validateExercise, validateWorkout, normalizeExercise, normalizeWorkout } from './validators';

export function parseExerciseCSV(csvContent: string): ParseResult<ImportedExercise> {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  const exercises: ImportedExercise[] = [];

  if (lines.length < 2) {
    return { success: false, errors: ['CSV file must have a header row and at least one data row'] };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const requiredHeaders = ['name', 'category', 'musclegroup'];
  
  const missingHeaders = requiredHeaders.filter(h => !headers.some(header => header.includes(h)));
  if (missingHeaders.length > 0) {
    return { success: false, errors: [`Missing required headers: ${missingHeaders.join(', ')}`] };
  }

  // Find column indices
  const nameIdx = headers.findIndex(h => h.includes('name'));
  const categoryIdx = headers.findIndex(h => h.includes('category'));
  const muscleGroupIdx = headers.findIndex(h => h.includes('musclegroup') || h.includes('muscle group'));
  const notesIdx = headers.findIndex(h => h.includes('notes'));

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    
    try {
      const exercise = {
        name: values[nameIdx]?.trim() || '',
        category: values[categoryIdx]?.trim() || '',
        muscleGroup: parseMuscleGroups(values[muscleGroupIdx] || ''),
        notes: notesIdx !== -1 ? values[notesIdx]?.trim() : undefined
      };

      const validation = validateExercise(exercise);
      if (!validation.valid) {
        errors.push(`Row ${i + 1}: ${validation.errors.join('; ')}`);
      } else {
        exercises.push(normalizeExercise(exercise));
      }
    } catch (error) {
      errors.push(`Row ${i + 1}: Failed to parse - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    success: errors.length === 0,
    data: exercises,
    errors: errors.length > 0 ? errors : undefined
  };
}

export function parseWorkoutCSV(csvContent: string): ParseResult<ImportedWorkout> {
  const lines = csvContent.trim().split('\n');
  const errors: string[] = [];
  const workouts: Map<string, ImportedWorkout> = new Map();

  if (lines.length < 2) {
    return { success: false, errors: ['CSV file must have a header row and at least one data row'] };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const requiredHeaders = ['workout', 'date', 'exercise', 'set', 'reps'];
  
  const missingHeaders = requiredHeaders.filter(h => !headers.some(header => header.includes(h)));
  if (missingHeaders.length > 0) {
    return { success: false, errors: [`Missing required headers: ${missingHeaders.join(', ')}`] };
  }

  // Find column indices
  const workoutIdx = headers.findIndex(h => h.includes('workout'));
  const dateIdx = headers.findIndex(h => h.includes('date'));
  const notesIdx = headers.findIndex(h => h.includes('notes'));
  const exerciseIdx = headers.findIndex(h => h.includes('exercise'));
  const setIdx = headers.findIndex(h => h.includes('set'));
  const repsIdx = headers.findIndex(h => h.includes('reps'));
  const weightIdx = headers.findIndex(h => h.includes('weight'));
  const durationIdx = headers.findIndex(h => h.includes('duration'));
  const distanceIdx = headers.findIndex(h => h.includes('distance'));
  const setNotesIdx = headers.findIndex(h => h === 'set notes' || h === 'setnotes');

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    
    try {
      const workoutName = values[workoutIdx]?.trim() || '';
      const date = values[dateIdx]?.trim() || '';
      const exerciseName = values[exerciseIdx]?.trim() || '';
      
      // Create or get workout
      let workout = workouts.get(workoutName);
      if (!workout) {
        workout = {
          name: workoutName,
          date: date,
          notes: notesIdx !== -1 ? values[notesIdx]?.trim() : undefined,
          exercises: []
        };
        workouts.set(workoutName, workout);
      }

      // Find or create exercise
      let exercise = workout.exercises.find(e => e.exerciseName === exerciseName);
      if (!exercise) {
        exercise = {
          exerciseName: exerciseName,
          order: workout.exercises.length,
          sets: []
        };
        workout.exercises.push(exercise);
      }

      // Add set
      const set = {
        setNumber: parseInt(values[setIdx] || '0') || exercise.sets.length + 1,
        reps: values[repsIdx] ? parseInt(values[repsIdx]) : undefined,
        weight: values[weightIdx] ? parseFloat(values[weightIdx]) : undefined,
        duration: values[durationIdx] ? parseInt(values[durationIdx]) : undefined,
        distance: values[distanceIdx] ? parseFloat(values[distanceIdx]) : undefined,
        notes: setNotesIdx !== -1 ? values[setNotesIdx]?.trim() : undefined
      };

      exercise.sets.push(set);
    } catch (error) {
      errors.push(`Row ${i + 1}: Failed to parse - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Validate all workouts
  const validatedWorkouts: ImportedWorkout[] = [];
  workouts.forEach((workout, name) => {
    const validation = validateWorkout(workout);
    if (!validation.valid) {
      errors.push(`Workout "${name}": ${validation.errors.join('; ')}`);
    } else {
      validatedWorkouts.push(normalizeWorkout(workout));
    }
  });

  return {
    success: errors.length === 0,
    data: validatedWorkouts,
    errors: errors.length > 0 ? errors : undefined
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function parseMuscleGroups(value: string): string[] {
  // Handle various delimiters: comma, semicolon, pipe
  const groups = value.split(/[,;|]/)
    .map(g => g.trim())
    .filter(g => g.length > 0);
  
  return groups.length > 0 ? groups : ['full body'];
}