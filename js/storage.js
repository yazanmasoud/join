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
  const user = JSON.parse(localStorage.getItem('currentUser'));
  return (
    localStorage.getItem('isGuest') === 'true' ||
    (user && user.name === 'Guest')
  );
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
    // Geändert auf 'contacts', da main.js es dort speichert
    return JSON.parse(localStorage.getItem('contacts')) || [];
  }
  return typeof contacts !== 'undefined' ? contacts : [];
}

/**
 * Retrieves tasks from local storage or returns the default task array.
 * @returns {Array} List of stored or default tasks.
 */
export function getStoredTasks() {
  if (isGuest()) {
    // Geändert auf 'tasks', da main.js es dort speichert
    return JSON.parse(localStorage.getItem('tasks')) || [];
  }
  return typeof tasks !== 'undefined' ? tasks : [];
}

/** @section GLOBAL EXPORTS FOR HTML ONCLICK */
window.getCurrentUserId = getCurrentUserId;
window.getStoredContacts = getStoredContacts;
window.getStoredTasks = getStoredTasks;
window.isGuest = isGuest;


//----------Hier die Sachen für Datenbank Handling-------------//
// prüft ob der User Gast ist
export function isGuestUser() {
  return localStorage.getItem('isGuest') === 'true';
}

// holt die User ID
export function getCurrentUserId() {
  return localStorage.getItem('currentUserId');
}

//holt die Tasks aus dem Local Storage für den Gast
export function getLocalTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

//Speichert eine Task in Local Storage für den Gast
export function setLocalTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}