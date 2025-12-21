/**
 * @file mock-storage.ts
 * @description Wrapper around localStorage to persist mock data changes across page refreshes.
 * Provides CRUD operations for typed entities with browser-safety checks.
 * @path /lib/mock-storage.ts
 */

export class MockStorage {
  private static isBrowser = typeof window !== 'undefined';

  /**
   * Initialize a storage key with default data if it doesn't exist
   */
  static initialize<T>(key: string, defaultData: T[]): T[] {
    if (!this.isBrowser) return defaultData;

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
      
      this.save(key, defaultData);
      return defaultData;
    } catch (error) {
      console.error(`Error initializing MockStorage for ${key}:`, error);
      return defaultData;
    }
  }

  /**
   * Get all items for a key
   */
  static getAll<T>(key: string): T[] {
    if (!this.isBrowser) return [];
    
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error reading MockStorage for ${key}:`, error);
      return [];
    }
  }

  /**
   * Save all items for a key
   */
  static save<T>(key: string, data: T[]): void {
    if (!this.isBrowser) return;
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving MockStorage for ${key}:`, error);
    }
  }

  /**
   * Add a new item
   */
  static add<T>(key: string, item: T): void {
    const data = this.getAll<T>(key);
    data.push(item);
    this.save(key, data);
  }

  /**
   * Update an item by ID
   */
  static update<T extends { id: string | number }>(
    key: string, 
    id: string | number, 
    partial: Partial<T>
  ): T | null {
    const data = this.getAll<T>(key);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    const updated = { ...data[index], ...partial };
    data[index] = updated;
    this.save(key, data);
    return updated;
  }

  /**
   * Remove an item by ID
   */
  static remove<T extends { id: string | number }>(
    key: string, 
    id: string | number
  ): boolean {
    const data = this.getAll<T>(key);
    const filtered = data.filter(item => item.id !== id);
    
    if (filtered.length === data.length) return false;
    
    this.save(key, filtered);
    return true;
  }

  /**
   * Clear all items for a key
   */
  static clear(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  /**
   * Force refresh a storage key with new data, overwriting any cached data.
   * Use this when the source data has changed and cached data is stale.
   */
  static refresh<T>(key: string, newData: T[]): T[] {
    this.save(key, newData);
    return newData;
  }
}

export const STORAGE_KEYS = {
  INVENTORY: 'it_inventory_data',
  EMPLOYEES: 'it_employee_data',
  MAINTENANCE: 'it_maintenance_data',
  ACTIVITIES: 'it_activity_data',
  MODELS: 'it_models_data',
};
