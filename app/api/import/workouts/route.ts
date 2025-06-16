import { NextRequest, NextResponse } from 'next/server';
import { parseFile, detectFileType, getFileTypeFromMimeType, ImportedWorkout } from '../../../../utils/parsers';
import { generateId } from '../../../../utils/localStorage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Detect file type
    let fileType = detectFileType(file.name);
    if (!fileType) {
      fileType = getFileTypeFromMimeType(file.type);
    }
    
    if (!fileType) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a CSV, JSON, or XML file.' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();
    
    // Parse the file
    const result = parseFile(content, fileType, 'workout');
    
    if (!result.success || !result.data) {
      return NextResponse.json(
        { 
          error: 'Failed to parse file',
          details: result.errors 
        },
        { status: 400 }
      );
    }

    // Convert parsed workouts to the format expected by useWorkouts hook
    const workouts = result.data as ImportedWorkout[];
    const imported: any[] = [];

    for (const workout of workouts) {
      const workoutData = {
        id: generateId(),
        name: workout.name,
        date: workout.date instanceof Date ? workout.date : new Date(workout.date),
        notes: workout.notes || '',
        status: workout.status || 'planned', // Default to 'planned'
        exercises: workout.exercises.map((exercise, index) => ({
          id: `exercise-${generateId()}-${index}`,
          exercise: {
            id: exercise.exerciseName.toLowerCase().replace(/\s+/g, '-'),
            name: exercise.exerciseName,
            category: 'strength' // Default category
          },
          sets: exercise.sets.map((set, setIndex) => ({
            id: `set-${generateId()}-${index}-${setIndex}`,
            setNumber: set.setNumber,
            reps: set.reps || 0,
            weight: set.weight || 0,
            duration: set.duration || null,
            distance: set.distance || null,
            notes: set.notes || null,
            completed: workout.status === 'completed' // Mark as completed if workout is completed
          }))
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      imported.push(workoutData);
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: workouts.length,
        imported: imported.length,
        errors: 0
      },
      imported,
      workouts: imported // Return formatted workouts for frontend to handle
    });

  } catch (error) {
    console.error('Workout import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}