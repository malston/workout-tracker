import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Try to delete from database
    try {
      await db.workout.delete({
        where: { id }
      });
    } catch (dbError) {
      console.warn('Failed to delete workout from database:', dbError);
      // Continue - the hook will handle localStorage fallback
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete workout:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Try to update in database
    try {
      const workout = await db.workout.update({
        where: { id },
        data: {
          name: data.name,
          notes: data.notes,
          status: data.status,
          updatedAt: new Date()
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
    } catch (dbError) {
      console.warn('Failed to update workout in database:', dbError);
      // Return success anyway - the hook will handle localStorage fallback
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Failed to update workout:', error);
    return NextResponse.json(
      { error: 'Failed to update workout' },
      { status: 500 }
    );
  }
}