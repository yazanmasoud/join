/**
 * @file Summary management script handling dashboard state and real-time metrics data.
 */

import { getCurrentUserId } from './storage.js';
import { calculateMetrics } from './utils.js';
import { setGreeting, updateUI } from './ui.js';
import { database } from './firebase-config.js';

/**
 * Initializes the dashboard by setting the greeting and fetching data.
 */
async function initDashboard() {
  setGreeting();
  fetchSummaryData();
}

/**
 * Fetches task data from Firebase or LocalStorage (for guests) and updates metrics.
 */
function fetchSummaryData() {
  const userId = getCurrentUserId();

  if (!userId || userId === 'guest_user') {
    console.log('Loading summary data from LocalStorage (Guest Session)...');
    const localTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const tasksArray = Array.isArray(localTasks)
      ? localTasks
      : Object.values(localTasks);
    const summaryMetrics = calculateMetrics(tasksArray);
    updateUI(summaryMetrics);
    return;
  }

  // Für registrierte Firebase-Nutzer: Live-Daten laden
  console.log(`Connecting to Firebase Realtime Database for User: ${userId}`);
  const tasksRef = database.ref(`users/${userId}/tasks`);

  tasksRef.on('value', (snapshot) => {
    const tasksData = snapshot.val() || {};
    const tasksArray = Object.values(tasksData);
    const summaryMetrics = calculateMetrics(tasksArray);
    updateUI(summaryMetrics);
  });
}

// Sofortiger Start beim Laden des Moduls
initDashboard();

/** @section GLOBAL EXPORTS FOR HTML */
window.initDashboard = initDashboard;
