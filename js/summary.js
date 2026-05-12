/**
 * @file Summary management script handling dashboard state and real-time metrics data.
 */

import { getCurrentUserId } from './storage.js'; // Stellt sicher, dass die Funktion geladen wird
import { calculateMetrics } from './utils.js';
import { setGreeting, updateUI } from './ui.js';

/**
 * Initializes the dashboard by setting the greeting and fetching data.
 */
async function initDashboard() {
  setGreeting();
  fetchSummaryData();
}

/**
 * Fetches task data from Firebase and updates metrics in real-time.
 */
function fetchSummaryData() {
  const userId = getCurrentUserId();
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
