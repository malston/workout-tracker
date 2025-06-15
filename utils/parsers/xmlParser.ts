import { ImportedExercise, ImportedWorkout, ParseResult } from './types';
import { validateExercise, validateWorkout, normalizeExercise, normalizeWorkout } from './validators';

export function parseExerciseXML(xmlContent: string): ParseResult<ImportedExercise> {
  const errors: string[] = [];
  const exercises: ImportedExercise[] = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return {
        success: false,
        errors: [`XML parsing error: ${parserError.textContent}`]
      };
    }

    // Find exercise elements - try different possible root/container names
    const exerciseElements = findExerciseElements(xmlDoc);

    if (exerciseElements.length === 0) {
      return { success: false, errors: ['No exercise elements found in XML'] };
    }

    exerciseElements.forEach((element, index) => {
      try {
        const exercise = parseExerciseElement(element);
        const validation = validateExercise(exercise);
        
        if (!validation.valid) {
          errors.push(`Exercise ${index + 1}: ${validation.errors.join('; ')}`);
        } else {
          exercises.push(normalizeExercise(exercise));
        }
      } catch (error) {
        errors.push(`Exercise ${index + 1}: Failed to parse - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return {
      success: errors.length === 0,
      data: exercises,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

export function parseWorkoutXML(xmlContent: string): ParseResult<ImportedWorkout> {
  const errors: string[] = [];
  const workouts: ImportedWorkout[] = [];

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      return {
        success: false,
        errors: [`XML parsing error: ${parserError.textContent}`]
      };
    }

    // Find workout elements
    const workoutElements = findWorkoutElements(xmlDoc);

    if (workoutElements.length === 0) {
      return { success: false, errors: ['No workout elements found in XML'] };
    }

    workoutElements.forEach((element, index) => {
      try {
        const workout = parseWorkoutElement(element);
        const validation = validateWorkout(workout);
        
        if (!validation.valid) {
          errors.push(`Workout ${index + 1}: ${validation.errors.join('; ')}`);
        } else {
          workouts.push(normalizeWorkout(workout));
        }
      } catch (error) {
        errors.push(`Workout ${index + 1}: Failed to parse - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return {
      success: errors.length === 0,
      data: workouts,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

function findExerciseElements(xmlDoc: Document): Element[] {
  // Try different possible element names
  const possibleNames = ['exercise', 'Exercise', 'exercises>exercise', 'Exercises>Exercise'];
  
  for (const name of possibleNames) {
    const elements = Array.from(xmlDoc.querySelectorAll(name));
    if (elements.length > 0) return elements;
  }
  
  // If no standard names found, look for root element with exercise-like children
  const root = xmlDoc.documentElement;
  if (root && root.children.length > 0) {
    const firstChild = root.children[0];
    if (hasExerciseProperties(firstChild)) {
      return Array.from(root.children);
    }
  }
  
  return [];
}

function findWorkoutElements(xmlDoc: Document): Element[] {
  // Try different possible element names
  const possibleNames = ['workout', 'Workout', 'workouts>workout', 'Workouts>Workout'];
  
  for (const name of possibleNames) {
    const elements = Array.from(xmlDoc.querySelectorAll(name));
    if (elements.length > 0) return elements;
  }
  
  // If no standard names found, look for root element with workout-like children
  const root = xmlDoc.documentElement;
  if (root && root.children.length > 0) {
    const firstChild = root.children[0];
    if (hasWorkoutProperties(firstChild)) {
      return Array.from(root.children);
    }
  }
  
  return [];
}

function hasExerciseProperties(element: Element): boolean {
  const hasName = getElementText(element, ['name', 'Name', 'exerciseName', 'ExerciseName']) !== null;
  const hasCategory = getElementText(element, ['category', 'Category']) !== null;
  return hasName && hasCategory;
}

function hasWorkoutProperties(element: Element): boolean {
  const hasName = getElementText(element, ['name', 'Name', 'workoutName', 'WorkoutName']) !== null;
  const hasDate = getElementText(element, ['date', 'Date']) !== null;
  return hasName && hasDate;
}

function parseExerciseElement(element: Element): any {
  const name = getElementText(element, ['name', 'Name', 'exerciseName', 'ExerciseName']) || '';
  const category = getElementText(element, ['category', 'Category']) || '';
  const muscleGroupText = getElementText(element, ['muscleGroup', 'MuscleGroup', 'muscleGroups', 'MuscleGroups']) || '';
  const notes = getElementText(element, ['notes', 'Notes', 'description', 'Description']);

  // Parse muscle groups - could be comma-separated or as individual elements
  let muscleGroup: string[] = [];
  const muscleGroupElements = element.querySelectorAll('muscleGroup, MuscleGroup, muscle, Muscle');
  
  if (muscleGroupElements.length > 0) {
    muscleGroup = Array.from(muscleGroupElements).map(el => el.textContent?.trim() || '').filter(g => g);
  } else if (muscleGroupText) {
    muscleGroup = muscleGroupText.split(/[,;|]/).map(g => g.trim()).filter(g => g);
  }

  return {
    name,
    category,
    muscleGroup: muscleGroup.length > 0 ? muscleGroup : ['full body'],
    notes
  };
}

function parseWorkoutElement(element: Element): any {
  const name = getElementText(element, ['name', 'Name', 'workoutName', 'WorkoutName']) || '';
  const date = getElementText(element, ['date', 'Date', 'workoutDate', 'WorkoutDate']) || '';
  const notes = getElementText(element, ['notes', 'Notes', 'description', 'Description']);

  // Parse exercises
  const exercises: any[] = [];
  const exerciseContainers = element.querySelectorAll('exercises, Exercises, workoutExercises, WorkoutExercises');
  
  let exerciseElements: Element[] = [];
  if (exerciseContainers.length > 0) {
    // Exercises are in a container
    exerciseContainers.forEach(container => {
      exerciseElements.push(...Array.from(container.querySelectorAll('exercise, Exercise, workoutExercise, WorkoutExercise')));
    });
  } else {
    // Exercises are direct children
    exerciseElements = Array.from(element.querySelectorAll('exercise, Exercise, workoutExercise, WorkoutExercise'));
  }

  exerciseElements.forEach((exerciseEl, index) => {
    const exercise = parseWorkoutExerciseElement(exerciseEl, index);
    exercises.push(exercise);
  });

  return {
    name,
    date,
    notes,
    exercises
  };
}

function parseWorkoutExerciseElement(element: Element, defaultOrder: number): any {
  const exerciseName = getElementText(element, ['name', 'Name', 'exerciseName', 'ExerciseName']) || '';
  const orderText = getElementText(element, ['order', 'Order', 'position', 'Position']);
  const order = orderText ? parseInt(orderText) : defaultOrder;

  // Parse sets
  const sets: any[] = [];
  const setContainers = element.querySelectorAll('sets, Sets');
  
  let setElements: Element[] = [];
  if (setContainers.length > 0) {
    // Sets are in a container
    setContainers.forEach(container => {
      setElements.push(...Array.from(container.querySelectorAll('set, Set')));
    });
  } else {
    // Sets are direct children
    setElements = Array.from(element.querySelectorAll('set, Set'));
  }

  setElements.forEach((setEl, index) => {
    const set = parseSetElement(setEl, index + 1);
    sets.push(set);
  });

  return {
    exerciseName,
    order,
    sets
  };
}

function parseSetElement(element: Element, defaultNumber: number): any {
  const setNumberText = getElementText(element, ['number', 'Number', 'setNumber', 'SetNumber']);
  const setNumber = setNumberText ? parseInt(setNumberText) : defaultNumber;

  const repsText = getElementText(element, ['reps', 'Reps', 'repetitions', 'Repetitions']);
  const weightText = getElementText(element, ['weight', 'Weight']);
  const durationText = getElementText(element, ['duration', 'Duration', 'time', 'Time']);
  const distanceText = getElementText(element, ['distance', 'Distance']);
  const notes = getElementText(element, ['notes', 'Notes']);

  return {
    setNumber,
    reps: repsText ? parseInt(repsText) : undefined,
    weight: weightText ? parseFloat(weightText) : undefined,
    duration: durationText ? parseInt(durationText) : undefined,
    distance: distanceText ? parseFloat(distanceText) : undefined,
    notes
  };
}

function getElementText(parent: Element, possibleNames: string[]): string | null {
  for (const name of possibleNames) {
    // Try as child element
    const element = parent.querySelector(name);
    if (element?.textContent) {
      return element.textContent.trim();
    }
    
    // Try as attribute
    const attr = parent.getAttribute(name);
    if (attr) {
      return attr.trim();
    }
  }
  
  return null;
}