class LocalStorageManager<T> {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  /**
   * Save data to localStorage
   */
  set(data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(this.key, serializedData);
    } catch (error) {
      console.error(`Error saving data to localStorage for key "${this.key}":`, error);
      throw new Error('Failed to save data to localStorage');
    }
  }

  /**
   * Get data from localStorage
   */
  get(): T | null {
    try {
      const serializedData = localStorage.getItem(this.key);
      if (serializedData === null) {
        return null;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error(`Error reading data from localStorage for key "${this.key}":`, error);
      return null;
    }
  }

  /**
   * Remove data from localStorage
   */
  remove(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error(`Error removing data from localStorage for key "${this.key}":`, error);
      throw new Error('Failed to remove data from localStorage');
    }
  }

  /**
   * Check if data exists in localStorage
   */
  exists(): boolean {
    return localStorage.getItem(this.key) !== null;
  }

  /**
   * Clear all data from localStorage (use with caution!)
   */
  static clearAll(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw new Error('Failed to clear localStorage');
    }
  }

  /**
   * Get all keys from localStorage
   */
  static getAllKeys(): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      console.error('Error getting localStorage keys:', error);
      return [];
    }
  }

  /**
   * Update specific properties of stored data (partial update)
   */
  update(updates: Partial<T>): void {
    try {
      const currentData = this.get();
      if (currentData === null) {
        throw new Error('No data found to update');
      }
      
      const updatedData = { ...currentData, ...updates };
      this.set(updatedData);
    } catch (error) {
      console.error(`Error updating data in localStorage for key "${this.key}":`, error);
      throw new Error('Failed to update data in localStorage');
    }
  }

  /**
   * Get the size of stored data in bytes
   */
  getSize(): number {
    try {
      const data = localStorage.getItem(this.key);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      console.error(`Error calculating size for key "${this.key}":`, error);
      return 0;
    }
  }
}

export default LocalStorageManager;