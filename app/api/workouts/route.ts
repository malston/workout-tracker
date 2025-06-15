import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const workouts = await db.workout.findMany({
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true
              }
            },
            sets: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
    
    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Failed to fetch workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const workout = await db.workout.create({
      data: {
        name: data.name,
        date: new Date(data.date),
        notes: data.notes,
        userId: null // No user system for now
      },
      include: {
        exercises: {
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                category: true
              }
            },
            sets: true
          }
        }
      }
    });
    
    return NextResponse.json(workout);
  } catch (error) {
    console.error('Failed to create workout:', error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}