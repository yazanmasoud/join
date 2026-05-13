import { guestContacts, guestTasks } from './guest-data.js';
import { database } from './firebase-config.js';

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
    (user && (user.name === 'Guest' || user === 'Gast'))
  );
}

/**
 * Retrieves the current authenticated user ID or returns a fallback for guests.
 * @returns {string} The active user identifier.
 */
export function getCurrentUserId() {
  return isGuest()
    ? 'guest_user'
    : localStorage.getItem('currentUserId') || 'guest_user';
}

/**
 * Fetches default guest templates from Firebase and mirrors them into LocalStorage.
 * @returns {Promise<boolean>} True when synchronization finishes.
 */
export async function initializeGuestData() {
  if (!localStorage.getItem('tasks') || !localStorage.getItem('contacts')) {
    try {
      const snap = await database.ref('defaultGuestData').once('value');
      const dbData = snap.val();
      localStorage.setItem(
        'tasks',
        JSON.stringify(dbData?.tasks || guestTasks),
      );
      localStorage.setItem(
        'contacts',
        JSON.stringify(dbData?.contacts || guestContacts),
      );
    } catch (e) {
      localStorage.setItem('tasks', JSON.stringify(guestTasks));
      localStorage.setItem('contacts', JSON.stringify(guestContacts));
    }
  }
  return true;
}

/**
 * Saves data safely to either LocalStorage or Firebase Realtime Database.
 * @param {string} key - The data path key ('tasks' or 'contacts').
 * @param {Array} data - The array containing the updated elements.
 */
export async function saveData(key, data) {
  if (isGuest()) {
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    await database.ref(`${getCurrentUserId()}/${key}`).set(data);
  }
}

/**
 * Loads data from LocalStorage or Firebase based on user authentication.
 * KORREKTUR: Sicherer JSON.parse Fallback verhindert Anwendungsabstürze bei leeren Keys.
 * @param {string} key - The data path key ('tasks' or 'contacts').
 * @returns {Promise<Array>} The retrieved array of elements.
 */
export async function loadData(key) {
  if (isGuest()) {
    const localData = localStorage.getItem(key);
    return localData ? JSON.parse(localData) : [];
  }
  const snapshot = await database
    .ref(`${getCurrentUserId()}/${key}`)
    .once('value');
  return snapshot.val() || [];
}

/**
 * Backward-compatible helper to synchronously retrieve contacts.
 */
export function getStoredContacts() {
  const data = localStorage.getItem('contacts');
  return data ? JSON.parse(data) : [];
}

/**
 * Backward-compatible helper to synchronously retrieve tasks.
 */
export function getStoredTasks() {
  const data = localStorage.getItem('tasks');
  return data ? JSON.parse(data) : [];
}

/** @section GLOBAL EXPORTS FOR HTML ONCLICK */
window.getCurrentUserId = getCurrentUserId;
window.getStoredContacts = getStoredContacts;
window.getStoredTasks = getStoredTasks;
window.isGuest = isGuest;
window.saveData = saveData;
window.loadData = loadData;
window.initializeGuestData = initializeGuestData;
