/**
 * @file Storage management script handling local storage and user state retrieval.
 */

const categoryOptions = ['Technical Task', 'User Story', 'Feature Task'];

const contactOptions = [
  'Maximilian Müller',
  'Sofia Schneider',
  'Benedikt Bauer',
];

/**
 * Checks if the current session is a guest session.
 * @returns {boolean} True if guest, false otherwise.
 */
export function isGuest() {
  // Hinweis: Falls diese Funktion in einer anderen Datei liegt, passe sie hier an.
  return localStorage.getItem('isGuest') === 'true';
}

/**
 * Retrieves the current authenticated user ID or returns a fallback for guests.
 * @returns {string} The active user identifier.
 */
export function getCurrentUserId() {
  if (isGuest()) {
    return 'guest_user';
  }
  return localStorage.getItem('currentUserId') || 'guest_user';
}

/**
 * Retrieves contacts from local storage or returns the default contact array.
 * @returns {Array} List of stored or default contacts.
 */
export function getStoredContacts() {
  if (isGuest()) {
    return JSON.parse(localStorage.getItem('guestContacts')) || [];
  }
  // Fallback falls 'contacts' global definiert ist, sonst leeres Array
  return typeof contacts !== 'undefined' ? contacts : [];
}

/**
 * Retrieves tasks from local storage or returns the default task array.
 * @returns {Array} List of stored or default tasks.
 */
export function getStoredTasks() {
  if (isGuest()) {
    return JSON.parse(localStorage.getItem('guestTasks')) || [];
  }
  // Fallback falls 'tasks' global definiert ist, sonst leeres Array
  return typeof tasks !== 'undefined' ? tasks : [];
}

/** @section GLOBAL EXPORTS FOR HTML ONCLICK */
window.getCurrentUserId = getCurrentUserId;
window.getStoredContacts = getStoredContacts;
window.getStoredTasks = getStoredTasks;
window.isGuest = isGuest;
