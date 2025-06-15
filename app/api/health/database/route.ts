import { NextResponse } from 'next/server';
import { checkDatabaseConnection } from '@/lib/db';

export async function GET() {
  try {
    const isConnected = await checkDatabaseConnection();
    
    return NextResponse.json({
      connected: isConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Database health check failed:', error);
    
    return NextResponse.json({
      connected: false,
      error: 'Connection check failed',
      timestamp: new Date().toISOString()
    });
  }
}