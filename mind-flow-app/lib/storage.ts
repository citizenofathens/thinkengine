// Helper functions for local storage

// Save data to local storage
export function saveToLocalStorage(key: string, data: any): void {
  try {
    const serializedData = JSON.stringify(data)
    localStorage.setItem(key, serializedData)
  } catch (error) {
    console.error(`Error saving ${key} to local storage:`, error)
  }
}

// Load data from local storage
export function loadFromLocalStorage(key: string): any {
  try {
    const serializedData = localStorage.getItem(key)
    if (serializedData === null) {
      return null
    }
    return JSON.parse(serializedData)
  } catch (error) {
    console.error(`Error loading ${key} from local storage:`, error)
    return null
  }
}

// Clear data from local storage
export function clearFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error clearing ${key} from local storage:`, error)
  }
}

// Check if data exists in local storage
export function existsInLocalStorage(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null
  } catch (error) {
    console.error(`Error checking if ${key} exists in local storage:`, error)
    return false
  }
}
