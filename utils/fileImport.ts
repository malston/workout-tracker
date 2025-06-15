// File import utilities for parsing CSV, JSON, and XML exercise/workout data

export interface ParseResult<T> {
  success: boolean;
  data: T[];
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Valid categories and difficulties for validation
const VALID_CATEGORIES = ['strength', 'cardio', 'flexibility', 'balance', 'sports', 'other'];
const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export function parseCSVContent(content: string, type: 'exercises' | 'workouts'): ParseResult<any> {
  try {
    if (!content.trim()) {
      return { success: false, data: [], error: 'Empty CSV file' };
    }

    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, data: [], error: 'Invalid CSV format - missing header or data' };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      const item: any = {};
      headers.forEach((header, index) => {
        let value = index < values.length ? values[index] : '';
        
        if (type === 'exercises' && header === 'muscleGroup') {
          item[header] = value ? value.split(',').map(mg => mg.trim()) : [];
        } else if (type === 'workouts' && (header === 'duration' || header === 'caloriesBurned')) {
          item[header] = parseInt(value) || 0;
        } else {
          item[header] = value || '';
        }
      });

      data.push(item);
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: 'Invalid CSV format' };
  }
}

export function parseJSONContent(content: string, type: 'exercises' | 'workouts'): ParseResult<any> {
  try {
    const data = JSON.parse(content);
    
    if (!Array.isArray(data)) {
      return { success: false, data: [], error: 'JSON content must be an array' };
    }

    if (data.length === 0) {
      return { success: false, data: [], error: 'No data found in JSON file' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, data: [], error: 'Invalid JSON format' };
  }
}

export function parseXMLContent(content: string, type: 'exercises' | 'workouts'): ParseResult<any> {
  try {
    // Simple XML parser for this specific use case
    const rootElement = type === 'exercises' ? 'exercises' : 'workouts';
    const itemElement = type === 'exercises' ? 'exercise' : 'workout';
    
    if (!content.includes(`<${rootElement}>`)) {
      return { success: false, data: [], error: 'Invalid XML structure - missing root element' };
    }

    const itemRegex = new RegExp(`<${itemElement}>(.*?)</${itemElement}>`, 'gs');
    const items = [];
    let match;

    while ((match = itemRegex.exec(content)) !== null) {
      const itemContent = match[1];
      const item: any = {};

      // Extract all XML elements within this item
      const elementRegex = /<(\w+)>(.*?)<\/\1>/g;
      let elementMatch;

      while ((elementMatch = elementRegex.exec(itemContent)) !== null) {
        const key = elementMatch[1];
        let value = elementMatch[2].trim();

        if (type === 'exercises' && key === 'muscleGroup') {
          item[key] = value.split(',').map(mg => mg.trim());
        } else if (type === 'workouts' && (key === 'duration' || key === 'caloriesBurned')) {
          item[key] = parseInt(value) || 0;
        } else {
          item[key] = value;
        }
      }

      if (Object.keys(item).length > 0) {
        items.push(item);
      }
    }

    return { success: true, data: items };
  } catch (error) {
    return { success: false, data: [], error: 'Invalid XML format' };
  }
}

export function validateExerciseData(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  const requiredFields = ['name', 'category', 'muscleGroup', 'equipment', 'difficulty', 'instructions'];
  
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Type validations
  if (data.name && typeof data.name !== 'string') {
    errors.push('name must be a string');
  }

  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    errors.push('Invalid category');
  }

  if (data.difficulty && !VALID_DIFFICULTIES.includes(data.difficulty)) {
    errors.push('Invalid difficulty');
  }

  if (data.muscleGroup && !Array.isArray(data.muscleGroup)) {
    errors.push('muscleGroup must be an array');
  }

  if (data.instructions && typeof data.instructions !== 'string') {
    errors.push('instructions must be a string');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateWorkoutData(data: any): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  const requiredFields = ['name', 'duration', 'caloriesBurned'];
  
  requiredFields.forEach(field => {
    if (data[field] === undefined || data[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Type validations
  if (data.name && typeof data.name !== 'string') {
    errors.push('name must be a string');
  }

  if (data.duration !== undefined && (typeof data.duration !== 'number' || isNaN(data.duration))) {
    errors.push('duration must be a number');
  }

  if (data.caloriesBurned !== undefined && (typeof data.caloriesBurned !== 'number' || isNaN(data.caloriesBurned))) {
    errors.push('caloriesBurned must be a number');
  }

  // Value validations
  if (typeof data.duration === 'number' && data.duration <= 0) {
    errors.push('duration must be positive');
  }

  if (typeof data.caloriesBurned === 'number' && data.caloriesBurned <= 0) {
    errors.push('caloriesBurned must be positive');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper function to parse CSV lines handling quoted values
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}