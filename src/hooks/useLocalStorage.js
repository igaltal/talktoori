import { useState } from 'react';

/**
 * Custom hook for managing localStorage with React state
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value if nothing exists in localStorage
 * @returns {[value, setValue]} - Current value and setter function
 */
export function useLocalStorage(key, initialValue) {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook for managing complex data structures in localStorage
 * Provides common operations like add, update, delete
 */
export function useLocalStorageArray(key, initialValue = []) {
  const [items, setItems] = useLocalStorage(key, initialValue);

  const addItem = (item) => {
    const newItem = {
      ...item,
      id: item.id || Date.now().toString(),
      createdAt: item.createdAt || new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateItem = (id, updates) => {
    setItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const getItem = (id) => {
    return items.find(item => item.id === id);
  };

  const clear = () => {
    setItems([]);
  };

  return {
    items,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    clear,
    count: items.length
  };
}