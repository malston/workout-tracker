import { parseExerciseCSV, parseWorkoutCSV } from './csvParser';
import { parseExerciseJSON, parseWorkoutJSON } from './jsonParser';
import { parseExerciseXML, parseWorkoutXML } from './xmlParser';
import { ImportedExercise, ImportedWorkout, ParseResult, SupportedFileType } from './types';

export * from './types';
export * from './validators';

export function parseFile(
  content: string,
  fileType: SupportedFileType,
  dataType: 'exercise' | 'workout'
): ParseResult<ImportedExercise | ImportedWorkout> {
  switch (fileType) {
    case 'csv':
      return dataType === 'exercise' 
        ? parseExerciseCSV(content) as ParseResult<ImportedExercise | ImportedWorkout>
        : parseWorkoutCSV(content) as ParseResult<ImportedExercise | ImportedWorkout>;
    
    case 'json':
      return dataType === 'exercise'
        ? parseExerciseJSON(content) as ParseResult<ImportedExercise | ImportedWorkout>
        : parseWorkoutJSON(content) as ParseResult<ImportedExercise | ImportedWorkout>;
    
    case 'xml':
      return dataType === 'exercise'
        ? parseExerciseXML(content) as ParseResult<ImportedExercise | ImportedWorkout>
        : parseWorkoutXML(content) as ParseResult<ImportedExercise | ImportedWorkout>;
    
    default:
      return {
        success: false,
        errors: [`Unsupported file type: ${fileType}`]
      };
  }
}

export function detectFileType(filename: string): SupportedFileType | null {
  const extension = filename.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'csv':
      return 'csv';
    case 'json':
      return 'json';
    case 'xml':
      return 'xml';
    default:
      return null;
  }
}

export function getFileTypeFromMimeType(mimeType: string): SupportedFileType | null {
  switch (mimeType) {
    case 'text/csv':
    case 'application/csv':
      return 'csv';
    case 'application/json':
    case 'text/json':
      return 'json';
    case 'application/xml':
    case 'text/xml':
      return 'xml';
    default:
      return null;
  }
}