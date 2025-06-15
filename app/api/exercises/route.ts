import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const exercises = await db.exercise.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Failed to fetch exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const exercise = await db.exercise.create({
      data: {
        name: data.name,
        category: data.category,
        muscleGroup: data.muscleGroup,
        equipment: data.equipment,
        difficulty: data.difficulty,
        instructions: data.instructions,
        notes: data.notes
      }
    });
    
    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Failed to create exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}