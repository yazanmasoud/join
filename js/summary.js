/**
 * @file Summary management script handling dashboard state and real-time metrics data.
 */
import { getCurrentUserId, isGuest, loadData } from './storage.js';
import { calculateMetrics } from './utils.js';
import { setGreeting, updateUI } from './ui.js';

/**
 * Initializes the dashboard by setting the greeting and fetching data.
 * @param {Array} [preloadedTasks] - Optional preloaded task dataset array.
 */
export async function initDashboard(preloadedTasks) {
  setGreeting();
  if (preloadedTasks && Array.isArray(preloadedTasks)) {
    updateUI(calculateMetrics(preloadedTasks));
  } else {
    await fetchSummaryData();
  }
}

/**
 * Fetches task data from the unified storage layer and updates metrics interface.
 * @returns {Promise<void>}
 */
async function fetchSummaryData() {
  const tasks = await loadData('tasks');
  const tasksArray = Array.isArray(tasks) ? tasks : Object.values(tasks);
  updateUI(calculateMetrics(tasksArray));
}

/** @section GLOBAL EXPORTS FOR HTML */
window.initDashboard = initDashboard;
window.fetchSummaryData = fetchSummaryData;
