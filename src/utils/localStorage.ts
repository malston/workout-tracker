// localStorage helper functions for fallback storage

export const localStorageKeys = {
  exercises: 'workout_tracker_exercises',
  workouts: 'workout_tracker_workouts',
  workoutTemplates: 'workout_tracker_templates',
  workoutSessions: 'workout_tracker_sessions',
  activeSession: 'workout_tracker_active_session',
} as const;

export const safeJSONParse = <T>(value: string | null, defaultValue: T): T => {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
};

export const safeJSONStringify = (value: unknown): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return safeJSONParse(item, defaultValue);
  } catch {
    return defaultValue;
  }
};

export const setToLocalStorage = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, safeJSONStringify(value));
    return true;
  } catch {
    console.error(`Failed to save to localStorage: ${key}`);
    return false;
  }
};

export const removeFromLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    console.error(`Failed to remove from localStorage: ${key}`);
    return false;
  }
};

// Generate unique IDs for localStorage items
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};