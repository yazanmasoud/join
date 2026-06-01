/**
 * Builds the base database path for a user.
 *
 * @param {string} uid - The Firebase user ID.
 * @returns {string} The user base path.
 */
export function userPath(uid) {
  return `users/${uid}`;
}

/**
 * Builds the database path for a user's profile.
 *
 * @param {string} uid - The Firebase user ID.
 * @returns {string} The user profile path.
 */
export function userProfilePath(uid) {
  return `${userPath(uid)}/profile`;
}

/**
 * Builds the database path for a user's contacts collection.
 *
 * @param {string} uid - The Firebase user ID.
 * @returns {string} The user contacts path.
 */
export function userContactsPath(uid) {
  return `${userPath(uid)}/contacts`;
}

/**
 * Builds the database path for a single user contact.
 *
 * @param {string} uid - The Firebase user ID.
 * @param {string} contactId - The contact ID.
 * @returns {string} The user contact path.
 */
export function userContactPath(uid, contactId) {
  return `${userContactsPath(uid)}/${contactId}`;
}

/**
 * Builds the database path for a user's tasks collection.
 *
 * @param {string} uid - The Firebase user ID.
 * @returns {string} The user tasks path.
 */
export function userTasksPath(uid) {
  return `${userPath(uid)}/tasks`;
}

/**
 * Builds the database path for a single user task.
 *
 * @param {string} uid - The Firebase user ID.
 * @param {string} taskId - The task ID.
 * @returns {string} The user task path.
 */
export function userTaskPath(uid, taskId) {
  return `${userTasksPath(uid)}/${taskId}`;
}

/**
 * Builds the database path for a single subtask on a user task.
 *
 * @param {string} uid - The Firebase user ID.
 * @param {string} taskId - The task ID.
 * @param {number} subtaskIndex - The subtask index.
 * @returns {string} The user subtask path.
 */
export function userSubtaskPath(uid, taskId, subtaskIndex) {
  return `${userTaskPath(uid, taskId)}/subtasks/${subtaskIndex}`;
}
