async function initDashboard() {
  setGreeting();
  fetchSummaryData();
}

function fetchSummaryData() {
  const userId = 'guest_user'; // Standard für Testphase
  const tasksRef = database.ref(`users/${userId}/tasks`);

  // .on('value', ...) sorgt für automatische Updates bei Änderungen
  tasksRef.on('value', (snapshot) => {
    const tasksData = snapshot.val() || {};
    const tasksArray = Object.values(tasksData);

    const summaryMetrics = calculateMetrics(tasksArray);
    updateUI(summaryMetrics);
  });
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
  const futureDates = tasks
    .map((t) => t.dueDate)
    .filter(
      (dateStr) =>
        dateStr && new Date(dateStr) >= new Date().setHours(0, 0, 0, 0),
    )
    .sort((a, b) => new Date(a) - new Date(b));

  if (futureDates.length === 0) return 'No upcoming deadline';

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(futureDates[0]).toLocaleDateString('en-US', options);
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
