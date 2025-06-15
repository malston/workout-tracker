import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';
import { parseFile, detectFileType, getFileTypeFromMimeType, ImportedExercise } from '../../../../utils/parsers';

const prisma = new PrismaClient();

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
    const result = parseFile(content, fileType, 'exercise');
    
    if (!result.success || !result.data) {
      return NextResponse.json(
        { 
          error: 'Failed to parse file',
          details: result.errors 
        },
        { status: 400 }
      );
    }

    // Import exercises to database
    const exercises = result.data as ImportedExercise[];
    const imported: any[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const exercise of exercises) {
      try {
        // Check if exercise already exists
        const existing = await prisma.exercise.findUnique({
          where: { name: exercise.name }
        });

        if (existing) {
          skipped.push(`${exercise.name} (already exists)`);
          continue;
        }

        // Create new exercise
        const created = await prisma.exercise.create({
          data: {
            name: exercise.name,
            category: exercise.category,
            muscleGroup: exercise.muscleGroup,
            notes: exercise.notes
          }
        });

        imported.push({
          id: created.id,
          name: created.name,
          category: created.category,
          muscleGroup: created.muscleGroup
        });
      } catch (error) {
        errors.push(`Failed to import ${exercise.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: exercises.length,
        imported: imported.length,
        skipped: skipped.length,
        errors: errors.length
      },
      imported,
      skipped,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Exercise import error:', error);
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