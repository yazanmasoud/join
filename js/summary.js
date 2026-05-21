/**
 * @file Summary management script handling dashboard state and real-time metrics data.
 */
import {
  ref,
  onValue,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { getCurrentUserId, isGuestUser, getLocalTasks } from './storage.js';
import { calculateMetrics } from './utils.js';
import {
  setGreeting,
  updateUI,
  setGreetingName,
  normalizeObjectToArray,
} from './ui.js';
import { auth, database } from './firebase-config.js';
import { getCurrentUserData } from './auth-service.js';
import {
  ref,
  get,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

/**
 * Initializes the dashboard by setting the greeting, handling mobile view,
 * rendering the username, and fetching task data.
 * @returns {Promise<void>}
 */
export async function initSummary() {
  setGreeting();
  handleMobileGreeting();
  await renderGreetingName();
  await fetchSummaryData();
}

/**
 * Orchestrates the data retrieval based on user type and updates the UI with calculated metrics.
 * @returns {Promise<void>}
 */
async function fetchSummaryData() {
  const tasks = isGuestUser() ? getLocalTasks() : await getFirebaseTasks();
  updateUI(calculateMetrics(tasks));
}

/**
 * Retrieves task data from Firebase for authenticated users or falls back to local data.
 * @returns {Promise<Array>} A promise that resolves to an array of tasks.
 */
async function getFirebaseTasks() {
  const uid = auth.currentUser?.uid;
  if (!uid) return getLocalTasks();
  const snapshot = await get(ref(database, `tasks/${uid}`));
  return snapshot.exists() ? Object.values(snapshot.val()) : getLocalTasks();
}

/**
 * Fetches and displays the authenticated user's name in the greeting section.
 * @returns {Promise<void>}
 */
async function renderGreetingName() {
  if (isGuestUser()) return;
  const userData = await getCurrentUserData();
  if (userData) setGreetingName(userData.name);
}

/**
 * Handles the visibility and auto-removal of the greeting message on mobile devices.
 * @returns {void}
 */
function handleMobileGreeting() {
  const el = document.getElementById('mobile-greeting');
  if (!el || window.innerWidth > 1100) return el?.remove();
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, 2000);
}

window.initSummary = initSummary;
