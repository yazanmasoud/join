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

/**
 * Adjusts the UI layout and elements based on guest status.
 */
function handleGuestLogin() {
  const container = document.getElementById('greeting-container');
  const nameElement = document.querySelector('[data-field="userName"]');

  if (dashboardData.isGuest || !dashboardData.userName) {
    container.classList.add('is-guest');
    if (nameElement) nameElement.innerText = '';
  } else {
    container.classList.remove('is-guest');
    if (nameElement) nameElement.innerText = dashboardData.userName;
  }
}

/**
 * Calculates total counts and status metrics from the task list.
 * @param {Array} tasks - The list of tasks.
 * @returns {Object} Calculated metrics and user information.
 */
function calculateMetrics(tasks) {
  return {
    todo: tasks.filter((t) => t.status === 'todo').length || 0,
    done: tasks.filter((t) => t.status === 'done').length || 0,
    urgent: tasks.filter((t) => t.priority === 'Urgent').length || 0,
    tasksInBoard: tasks.length || 0,
    tasksInProgress: tasks.filter((t) => t.status === 'inProgress').length || 0,
    awaitingFeedback:
      tasks.filter((t) => t.status === 'awaitingFeedback').length || 0,
    deadline: getNextDeadline(tasks),
    userName: 'Guest',
  };
}

/**
 * Finds and formats the earliest upcoming task deadline.
 * @param {Array} tasks - The list of tasks.
 * @returns {string} Formatted date string or fallback message.
 */
function getNextDeadline(tasks) {
  const validDates = tasks
    .map((t) => t.dueDate)
    .filter((dateStr) => dateStr && dateStr !== '');

  if (validDates.length === 0) return 'No upcoming deadline';

  const sortedDates = validDates.sort((a, b) => new Date(a) - new Date(b));
  const nextDate = new Date(sortedDates[0]);

  if (isNaN(nextDate.getTime())) return 'No upcoming deadline';

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return nextDate.toLocaleDateString('en-US', options);
}

/**
 * Updates DOM text elements mapped to metric keys.
 * @param {Object} data - The calculated metrics object.
 */
function updateUI(data) {
  const fields = document.querySelectorAll('[data-field]');
  fields.forEach((field) => {
    const key = field.getAttribute('data-field');
    if (data[key] !== undefined) {
      field.innerText = data[key];
    }
  });
}

/**
 * Sets a time-dependent greeting message in the DOM.
 */
function setGreeting() {
  const hour = new Date().getHours();
  const greetingElement = document.querySelector('.greeting-time');
  let greeting = 'Good night,';

  if (hour >= 5 && hour < 12) greeting = 'Good morning,';
  else if (hour >= 12 && hour < 18) greeting = 'Good afternoon,';
  else if (hour >= 18 && hour < 22) greeting = 'Good evening,';

  if (greetingElement) greetingElement.innerText = greeting;
}

initDashboard();
