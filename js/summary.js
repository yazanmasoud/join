// 1. Daten-Konfiguration (Mock-Up)
const dashboardData = {
  todo: 5,
  done: 12,
  urgent: 1,
  deadline: 'October 16, 2022',
  tasksInBoard: 18,
  tasksInProgress: 2,
  awaitingFeedback: 4,
  userName: 'Sofia Müller', // Falls leerer String "", wird Gast-Modus aktiv
  isGuest: false,
};

// 2. Initialisierungs-Funktion
function initDashboard() {
  // 1. Zeitbasierte Begrüßung setzen
  const greetingElement = document.querySelector('.greeting-time');
  if (greetingElement) {
    greetingElement.innerText = getGreetingByTime();
  }

  // 2. Deine bestehende data-field Logik
  const fields = document.querySelectorAll('[data-field]');
  fields.forEach((field) => {
    const key = field.getAttribute('data-field');
    if (dashboardData[key] !== undefined) {
      field.innerText = dashboardData[key];
    }
  });

  handleGuestLogin();
}

function handleGuestLogin() {
  const container = document.getElementById('greeting-container');
  if (dashboardData.isGuest || !dashboardData.userName) {
    container.classList.add('is-guest');
  } else {
    container.classList.remove('is-guest');
  }
}

// Start der Anwendung
initDashboard();

function getGreetingByTime() {
  const hour = new Date().getHours(); // Holt die aktuelle Stunde (0-23)
  let greeting = '';

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning,';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Good afternoon,';
  } else if (hour >= 18 && hour < 22) {
    greeting = 'Good evening,';
  } else {
    greeting = 'Good night,';
  }

  return greeting;
}
