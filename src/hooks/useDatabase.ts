import { useState, useEffect } from 'react';
import { db } from '../lib/db';

interface DatabaseStatus {
  isConnected: boolean;
  isChecking: boolean;
  error: string | null;
}

export const useDatabase = () => {
  const [status, setStatus] = useState<DatabaseStatus>({
    isConnected: false,
    isChecking: true,
    error: null,
  });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus({ isConnected: false, isChecking: true, error: null });
        
        // Try a simple query to check if database is accessible
        await db.selectFrom('exercises').select('id').limit(1).execute();
        
        setStatus({ isConnected: true, isChecking: false, error: null });
      } catch (error) {
        console.error('Database connection check failed:', error);
        setStatus({
          isConnected: false,
          isChecking: false,
          error: error instanceof Error ? error.message : 'Unknown database error',
        });
      }
    };

    checkConnection();
  }, []);

  return status;
};