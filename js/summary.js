import { ref, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { isGuestUser, getLocalTasks } from './storage.js';
import { calculateMetrics } from './utils.js';
import { setGreeting, updateUI, setGreetingName } from './ui.js';
import { auth, database } from './firebase-config.js';
import { getCurrentUserData } from './auth-service.js';

window.initSummary = initSummary;

const MOBILE_GREETING_PLAYED_KEY = 'mobileGreetingPlayed';

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
 * Orchestrates the data retrieval and attaches navigation events to cards.
 */
async function fetchSummaryData() {
  const tasks = isGuestUser() ? getLocalTasks() : await getFirebaseTasks();
  updateUI(calculateMetrics(tasks));
  setupCardNavigation(); // Fügt die Klick-Events hinzu
}

/**
 * Attaches the click event to all summary cards to navigate to the board.
 */
function setupCardNavigation() {
  // Wir wählen einfach ALLE Elemente mit der Klasse .card-base aus
  const cards = document.querySelectorAll('.card-base');

  cards.forEach((card) => {
    card.onclick = () => navigateTo('board');
  });
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
  if (!userData) {
    throw new Error('No user data available.');
  }
  setGreetingName(userData.name);
}

/**
 * Handles the visibility and auto-removal of the greeting message on mobile devices.
 * @returns {void}
 */
function handleMobileGreeting() {
  const element = document.getElementById('mobile-greeting');

  if (!element) return;

  if (window.innerWidth > 1100 || sessionStorage.getItem(MOBILE_GREETING_PLAYED_KEY)) {
    element.remove();
    return;
  }

  sessionStorage.setItem(MOBILE_GREETING_PLAYED_KEY, 'true');

  setTimeout(() => {
    element.style.opacity = '0';
    setTimeout(() => element.remove(), 300);
  }, 2000);
}
