import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { WorkoutSession, NewWorkoutSession, SessionExercise, NewSessionExercise } from '../lib/db/schema';
import { useDatabase } from './useDatabase';
import {
  getFromLocalStorage,
  setToLocalStorage,
  localStorageKeys,
  generateId,
} from '../utils/localStorage';

interface WorkoutSessionWithExercises extends WorkoutSession {
  exercises?: SessionExercise[];
}

export const useWorkoutSessions = () => {
  const { isConnected } = useDatabase();
  const [sessions, setSessions] = useState<WorkoutSessionWithExercises[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSessionWithExercises | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from database or localStorage
  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isConnected) {
        // Try to load from database
        const dbSessions = await db
          .selectFrom('workoutSessions')
          .selectAll()
          .orderBy('startedAt', 'desc')
          .execute();
        
        // Load exercises for each session
        const sessionsWithExercises = await Promise.all(
          dbSessions.map(async (session) => {
            const exercises = await db
              .selectFrom('sessionExercises')
              .selectAll()
              .where('sessionId', '=', session.id)
              .orderBy('orderIndex')
              .execute();
            
            return { ...session, exercises };
          })
        );
        
        setSessions(sessionsWithExercises);
        // Sync to localStorage as backup
        setToLocalStorage(localStorageKeys.workoutSessions, sessionsWithExercises);
        
        // Check for active session
        const active = sessionsWithExercises.find(s => s.status === 'active');
        setActiveSession(active || null);
        setToLocalStorage(localStorageKeys.activeSession, active || null);
      } else {
        // Fallback to localStorage
        const localSessions = getFromLocalStorage<WorkoutSessionWithExercises[]>(
          localStorageKeys.workoutSessions,
          []
        );
        setSessions(localSessions);
        
        const localActive = getFromLocalStorage<WorkoutSessionWithExercises | null>(
          localStorageKeys.activeSession,
          null
        );
        setActiveSession(localActive);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      
      // Try localStorage as fallback
      const localSessions = getFromLocalStorage<WorkoutSessionWithExercises[]>(
        localStorageKeys.workoutSessions,
        []
      );
      setSessions(localSessions);
      
      const localActive = getFromLocalStorage<WorkoutSessionWithExercises | null>(
        localStorageKeys.activeSession,
        null
      );
      setActiveSession(localActive);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  // Start a new session
  const startSession = useCallback(
    async (session: NewWorkoutSession, exercises: NewSessionExercise[]): Promise<WorkoutSession | null> => {
      try {
        // End any active sessions first
        if (activeSession) {
          await endSession(activeSession.id);
        }

        if (isConnected) {
          // Try to insert into database
          const [newSession] = await db
            .insertInto('workoutSessions')
            .values({ ...session, status: 'active', startedAt: new Date() })
            .returningAll()
            .execute();
          
          // Insert exercises
          if (exercises.length > 0) {
            await db
              .insertInto('sessionExercises')
              .values(exercises.map((ex, index) => ({ 
                ...ex, 
                sessionId: newSession.id,
                orderIndex: index,
                completedSets: 0,
                completedReps: [],
                completedWeights: [],
              })))
              .execute();
          }
          
          await loadSessions();
          return newSession;
        } else {
          // Fallback to localStorage
          const newSession: WorkoutSessionWithExercises = {
            id: generateId(),
            ...session,
            status: 'active',
            startedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            exercises: exercises.map((ex, index) => ({
              id: generateId(),
              sessionId: generateId(), // Will be replaced
              orderIndex: index,
              completedSets: 0,
              completedReps: [],
              completedWeights: [],
              ...ex,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          };
          
          const updatedSessions = [newSession, ...sessions];
          setSessions(updatedSessions);
          setToLocalStorage(localStorageKeys.workoutSessions, updatedSessions);
          
          setActiveSession(newSession);
          setToLocalStorage(localStorageKeys.activeSession, newSession);
          
          return newSession;
        }
      } catch (err) {
        console.error('Failed to start session:', err);
        setError(err instanceof Error ? err.message : 'Failed to start session');
        return null;
      }
    },
    [isConnected, sessions, activeSession, loadSessions]
  );

  // Update session exercise progress
  const updateExerciseProgress = useCallback(
    async (
      sessionId: string,
      exerciseId: string,
      updates: Partial<SessionExercise>
    ): Promise<boolean> => {
      try {
        if (isConnected) {
          // Try to update in database
          await db
            .updateTable('sessionExercises')
            .set({ ...updates, updatedAt: new Date() })
            .where('id', '=', exerciseId)
            .where('sessionId', '=', sessionId)
            .execute();
          
          await loadSessions();
          return true;
        } else {
          // Fallback to localStorage
          const updatedSessions = sessions.map((session) => {
            if (session.id === sessionId) {
              return {
                ...session,
                exercises: session.exercises?.map((ex) =>
                  ex.id === exerciseId
                    ? { ...ex, ...updates, updatedAt: new Date() }
                    : ex
                ),
              };
            }
            return session;
          });
          
          setSessions(updatedSessions);
          setToLocalStorage(localStorageKeys.workoutSessions, updatedSessions);
          
          // Update active session if needed
          if (activeSession?.id === sessionId) {
            const updated = updatedSessions.find((s) => s.id === sessionId);
            setActiveSession(updated || null);
            setToLocalStorage(localStorageKeys.activeSession, updated || null);
          }
          
          return true;
        }
      } catch (err) {
        console.error('Failed to update exercise progress:', err);
        setError(err instanceof Error ? err.message : 'Failed to update progress');
        return false;
      }
    },
    [isConnected, sessions, activeSession, loadSessions]
  );

  // End a session
  const endSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        if (isConnected) {
          // Try to update in database
          await db
            .updateTable('workoutSessions')
            .set({ 
              status: 'completed',
              endedAt: new Date(),
              updatedAt: new Date()
            })
            .where('id', '=', sessionId)
            .execute();
          
          await loadSessions();
          return true;
        } else {
          // Fallback to localStorage
          const updatedSessions = sessions.map((session) =>
            session.id === sessionId
              ? { 
                  ...session, 
                  status: 'completed' as const,
                  endedAt: new Date(),
                  updatedAt: new Date()
                }
              : session
          );
          
          setSessions(updatedSessions);
          setToLocalStorage(localStorageKeys.workoutSessions, updatedSessions);
          
          // Clear active session if it's the one being ended
          if (activeSession?.id === sessionId) {
            setActiveSession(null);
            setToLocalStorage(localStorageKeys.activeSession, null);
          }
          
          return true;
        }
      } catch (err) {
        console.error('Failed to end session:', err);
        setError(err instanceof Error ? err.message : 'Failed to end session');
        return false;
      }
    },
    [isConnected, sessions, activeSession, loadSessions]
  );

  // Cancel a session
  const cancelSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        if (isConnected) {
          // Try to update in database
          await db
            .updateTable('workoutSessions')
            .set({ 
              status: 'cancelled',
              endedAt: new Date(),
              updatedAt: new Date()
            })
            .where('id', '=', sessionId)
            .execute();
          
          await loadSessions();
          return true;
        } else {
          // Fallback to localStorage
          const updatedSessions = sessions.map((session) =>
            session.id === sessionId
              ? { 
                  ...session, 
                  status: 'cancelled' as const,
                  endedAt: new Date(),
                  updatedAt: new Date()
                }
              : session
          );
          
          setSessions(updatedSessions);
          setToLocalStorage(localStorageKeys.workoutSessions, updatedSessions);
          
          // Clear active session if it's the one being cancelled
          if (activeSession?.id === sessionId) {
            setActiveSession(null);
            setToLocalStorage(localStorageKeys.activeSession, null);
          }
          
          return true;
        }
      } catch (err) {
        console.error('Failed to cancel session:', err);
        setError(err instanceof Error ? err.message : 'Failed to cancel session');
        return false;
      }
    },
    [isConnected, sessions, activeSession, loadSessions]
  );

  // Load sessions when connection status changes
  useEffect(() => {
    if (!loading) {
      loadSessions();
    }
  }, [isConnected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => {
    loadSessions();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    sessions,
    activeSession,
    loading,
    error,
    startSession,
    updateExerciseProgress,
    endSession,
    cancelSession,
    refreshSessions: loadSessions,
  };
};