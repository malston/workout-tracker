import { useState, useEffect } from 'react';

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

  const checkConnection = async () => {
    try {
      setStatus(prev => ({ ...prev, isChecking: true, error: null }));
      
      // Check database connection via API route
      const response = await fetch('/api/health/database');
      const data = await response.json();
      
      if (data.connected) {
        setStatus({ isConnected: true, isChecking: false, error: null });
      } else {
        console.warn('Database not connected, using localStorage fallback');
        setStatus({
          isConnected: false,
          isChecking: false,
          error: null, // Don't show error to user, just use fallback
        });
      }
    } catch (error) {
      console.warn('Database connection check failed, using localStorage fallback:', error);
      setStatus({
        isConnected: false,
        isChecking: false,
        error: null, // Don't show error to user, just use fallback
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return {
    isConnected: status.isConnected,
    loading: status.isChecking,
    isChecking: status.isChecking,
    error: status.error,
    checkConnection,
  };
};