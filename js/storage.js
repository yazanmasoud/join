window.getCurrentUserId = getCurrentUserId;

/**
 * Checks if the current session is a guest session.
 * @returns {boolean} True if guest, false otherwise.
 */
export function isGuestUser() {
  return localStorage.getItem('isGuest') === 'true';
}


/**
 * Retrieves the current authenticated user ID or returns a fallback for guests.
 * @returns {string} The active user identifier.
 */
export function getCurrentUserId() {
  if (isGuestUser()) {
    return 'guest_user';
  }

  const userId = localStorage.getItem('currentUserId');

  if (!userId) {
    throw new Error('No authenticated user ID found.');
  }

  return userId;
}


/**
 * Retrieves guest tasks from localStorage.
 * @returns {Array} Stored guest tasks.
 */
export function getLocalTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}


/**
 * Saves guest tasks to localStorage.
 * @param {Array} contacts - Updated guest contact array.
 * @returns {void}
 */
export function setLocalTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
