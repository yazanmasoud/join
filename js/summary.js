/**
 * @file Summary management script handling dashboard state and real-time metrics data.
 */
import { ref, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { getCurrentUserId, isGuestUser } from './storage.js';
import { calculateMetrics } from './utils.js';
import { setGreeting, updateUI, setGreetingName, normalizeObjectToArray } from './ui.js';
import { database } from './firebase-config.js';
import { getCurrentUserData } from './auth-service.js';


/**
 * Initializes the dashboard by setting the greeting and fetching data.
 */
export async function initSummary() {
  setGreeting();
  fetchSummaryData();
  handleMobileGreeting();
  await renderGreetingName();
}

/**
 * Fetches task data from Firebase or LocalStorage (for guests) and updates metrics.
 */
function fetchSummaryData() {
  const userId = getCurrentUserId();

  if (!userId || userId === 'guest_user') {
    console.log('Loading summary data from LocalStorage (Guest Session)...');
    const localTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const tasksArray = normalizeObjectToArray(localTasks);
    const summaryMetrics = calculateMetrics(tasksArray);
    updateUI(summaryMetrics);
    return;
  }

  // Für registrierte Firebase-Nutzer: Live-Daten laden
  console.log(`Connecting to Firebase Realtime Database for User: ${userId}`);
  const tasksRef = ref(database, `tasks/${userId}`);

  onValue(tasksRef, (snapshot) => {
    const tasksData = snapshot.val() || {};
    const tasksArray = normalizeObjectToArray(tasksData);
    const summaryMetrics = calculateMetrics(tasksArray);
    updateUI(summaryMetrics);
  });
}

/** @section GLOBAL EXPORTS FOR HTML */
window.initSummary = initSummary;

function handleMobileGreeting() {
  const mobileGreeting = document.getElementById('mobile-greeting');

  if (!mobileGreeting) return;

  if (window.innerWidth > 1100) {
    mobileGreeting.remove();
    return;
  }

  setTimeout(() => {
    mobileGreeting.style.opacity = '0';

    setTimeout(() => {
      mobileGreeting.remove();
    }, 300);
  }, 2000);
}


/**
 * Renders the authenticated user's greeting name.
 */
async function renderGreetingName() {
  if (isGuestUser()) {throw new Error('User is wrongly cosidered as Guest.')};
  const userData = await getCurrentUserData();
  if (!userData) {throw new Error('No user data available.')};
  setGreetingName(userData.name);
}