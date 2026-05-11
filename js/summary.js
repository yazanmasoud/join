async function initDashboard() {
  setGreeting();

  // 1. Prüfen: Ist ein registrierter Firebase-User da?
  const user = firebase.auth().currentUser;

  // 2. Den Pfad bestimmen
  let userId;
  if (user) {
    userId = user.uid; // Die echte ID vom Login
  } else {
    userId = 'guest_user'; // Fallback auf Gast
  }

  fetchSummaryData(userId);
}

function fetchSummaryData(userId) {
  // Pfad muss EXAKT wie in board.js sein: users/guest_user/tasks
  const tasksRef = firebase.database().ref(`users/${userId}/tasks`);

  // .on sorgt dafür, dass die Zahlen live springen, wenn du im Board schiebst
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
    // WICHTIG: Prüfe in board.js ob der Status 'progress' oder 'inProgress' heißt!
    // Wenn board.js 'progress' nutzt, hier auch 'progress' eintragen:
    tasksInProgress:
      tasks.filter((t) => t.status === 'progress' || t.status === 'inProgress')
        .length || 0,
    awaitingFeedback:
      tasks.filter(
        (t) => t.status === 'feedback' || t.status === 'awaitingFeedback',
      ).length || 0,
    deadline: getNextDeadline(tasks),
    userName: 'Guest',
  };
}

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

function updateUI(data) {
  const fields = document.querySelectorAll('[data-field]');
  if (fields.length === 0) return; // Falls HTML noch nicht da ist, abbrechen

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
  if (!greetingElement) return;

  let greeting = 'Good night,';
  if (hour >= 5 && hour < 12) greeting = 'Good morning,';
  else if (hour >= 12 && hour < 18) greeting = 'Good afternoon,';
  else if (hour >= 18 && hour < 22) greeting = 'Good evening,';

  greetingElement.innerText = greeting;
}
