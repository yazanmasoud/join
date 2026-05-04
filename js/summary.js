async function initDashboard() {
  setGreeting();
  fetchSummaryData();
}

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

function handleGuestLogin() {
  const container = document.getElementById('greeting-container');
  const nameElement = document.querySelector('[data-field="userName"]');

  if (dashboardData.isGuest || !dashboardData.userName) {
    container.classList.add('is-guest');
    if (nameElement) nameElement.innerText = ''; // Name löschen im Gast-Modus
  } else {
    container.classList.remove('is-guest');
    if (nameElement) nameElement.innerText = dashboardData.userName; // Name setzen
  }
}

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
    userName: 'Guest', // Hier später den echten Usernamen aus Firebase Auth einsetzen
  };
}

function getNextDeadline(tasks) {
  // 1. Filtere nur valide Daten, die nicht leer sind
  const validDates = tasks
    .map((t) => t.dueDate)
    .filter((dateStr) => dateStr && dateStr !== '');

  if (validDates.length === 0) return 'No upcoming deadline';

  // 2. Sortiere alle Daten (das nächste zuerst)

  const sortedDates = validDates.sort((a, b) => new Date(a) - new Date(b));

  // 3. Formatiere das nächste Datum
  const nextDate = new Date(sortedDates[0]);

  // Check ob das Datum valide ist
  if (isNaN(nextDate.getTime())) return 'No upcoming deadline';

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return nextDate.toLocaleDateString('en-US', options);
}

function updateUI(data) {
  const fields = document.querySelectorAll('[data-field]');
  fields.forEach((field) => {
    const key = field.getAttribute('data-field');
    if (data[key] !== undefined) {
      field.innerText = data[key];
    }
  });
}

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
