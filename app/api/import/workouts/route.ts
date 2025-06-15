import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';
import { parseFile, detectFileType, getFileTypeFromMimeType, ImportedWorkout } from '../../../../utils/parsers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
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

    // Import workouts to database
    const workouts = result.data as ImportedWorkout[];
    const imported: any[] = [];
    const errors: string[] = [];

    for (const workout of workouts) {
      try {
        // Start a transaction for each workout
        const importedWorkout = await prisma.$transaction(async (tx) => {
          // Create the workout
          const createdWorkout = await tx.workout.create({
            data: {
              name: workout.name,
              date: workout.date instanceof Date ? workout.date : new Date(workout.date),
              notes: workout.notes,
              userId: userId
            }
          });

          // Create workout exercises and sets
          for (const exercise of workout.exercises) {
            // Find or create the exercise
            let exerciseRecord = await tx.exercise.findUnique({
              where: { name: exercise.exerciseName }
            });

            if (!exerciseRecord) {
              // If exercise doesn't exist, create a basic one
              exerciseRecord = await tx.exercise.create({
                data: {
                  name: exercise.exerciseName,
                  category: 'other',
                  muscleGroup: ['full body'],
                  notes: 'Auto-created during workout import'
                }
              });
            }

            // Create workout exercise
            const workoutExercise = await tx.workoutExercise.create({
              data: {
                workoutId: createdWorkout.id,
                exerciseId: exerciseRecord.id,
                order: exercise.order
              }
            });

            // Create sets
            for (const set of exercise.sets) {
              await tx.set.create({
                data: {
                  workoutExerciseId: workoutExercise.id,
                  setNumber: set.setNumber,
                  reps: set.reps,
                  weight: set.weight,
                  duration: set.duration,
                  distance: set.distance,
                  notes: set.notes
                }
              });
            }
          }

          return createdWorkout;
        });

        imported.push({
          id: importedWorkout.id,
          name: importedWorkout.name,
          date: importedWorkout.date,
          exerciseCount: workout.exercises.length,
          totalSets: workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
        });
      } catch (error) {
        errors.push(`Failed to import workout "${workout.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: workouts.length,
        imported: imported.length,
        errors: errors.length
      },
      imported,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Workout import error:', error);
    return NextResponse.json(
      { error: 'Internal server error during import' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
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