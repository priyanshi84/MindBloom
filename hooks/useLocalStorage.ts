import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Use the functional update form of the useState setter to ensure we always have the latest state.
      setStoredValue(prevStoredValue => {
        // Determine the new value by applying the updater if it's a function.
        const valueToStore = value instanceof Function ? value(prevStoredValue) : value;
        // Save the new value to local storage.
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Return the new value to update the React state.
        return valueToStore;
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key && e.newValue) {
            setStoredValue(JSON.parse(e.newValue));
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}