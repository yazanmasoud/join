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
export function isGuestUser() {
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
  if (isGuestUser()) {
    return 'guest_user';
  }
  return localStorage.getItem('currentUserId') || 'guest_user';
}


/**
 * Retrieves guest tasks from localStorage.
 * @returns {Array} Stored guest tasks.
 */
export function getLocalTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}


/**
 * Retrieves guest contacts from localStorage.
 * @returns {Array} Stored guest contacts.
 */
export function getLocalContacts() {
  return JSON.parse(localStorage.getItem('contacts')) || [];
}


/**
 * Saves guest contacts to localStorage.
 * @param {Array} contacts - Updated guest contact array.
 * @returns {void}
 */
export function setLocalContacts(contacts) {
  localStorage.setItem('contacts', JSON.stringify(contacts));
}


/**
 * Saves guest tasks to localStorage.
 * @param {Array} contacts - Updated guest contact array.
 * @returns {void}
 */
export function setLocalTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}


/** @section GLOBAL EXPORTS FOR HTML ONCLICK */
window.getCurrentUserId = getCurrentUserId;