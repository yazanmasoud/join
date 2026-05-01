// 1. GLOBALE VARIABLEN & DATEN
const CATEGORY_OPTIONS = ['Technical Task', 'User Story', 'Feature Task'];
const CONTACT_OPTIONS = [
  'Maximilian Müller',
  'Sofia Schneider',
  'Benedikt Bauer',
];
let currentPriority = 'Medium';

// 2. INITIALISIERUNG
function initAddTask() {
  renderPriorityButtons();
  renderCategories();
  renderContacts();
  setPriority(currentPriority);
}

// 3. RENDER FUNKTIONEN
function renderPriorityButtons() {
  const container = document.getElementById('prioContainer');
  if (container) container.innerHTML = getPriorityButtonsHTML();
}

function renderCategories() {
  const select = document.getElementById('taskCategory');
  if (select) {
    select.innerHTML = getSelectOptionsHTML(
      CATEGORY_OPTIONS,
      'Select task category',
    );
  }
}

function renderContacts() {
  const select = document.getElementById('tasksAssigned');
  if (select) {
    select.innerHTML = getSelectOptionsHTML(
      CONTACT_OPTIONS,
      'Select contacts to assign',
    );
  }
}

// 4. LOGIK & INTERAKTION
function setPriority(prio) {
  currentPriority = prio;
  const buttons = document.querySelectorAll('.priority-btn-content button');
  buttons.forEach((btn) =>
    btn.classList.remove('active-urgent', 'active-medium', 'active-low'),
  );

  const activeBtn = document.getElementById('prio' + prio);
  if (activeBtn) activeBtn.classList.add('active-' + prio.toLowerCase());
}

function clearForm() {
  // Text-Felder leeren
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDescription').value = '';
  document.getElementById('taskDate').value = '';
  document.getElementById('subtasks').value = '';

  // Dropdowns zurücksetzen (erster Eintrag: "Select...")
  document.getElementById('taskCategory').selectedIndex = 0;
  document.getElementById('tasksAssigned').selectedIndex = 0;

  // Priorität auf Standard zurücksetzen
  setPriority('Medium');

  console.log('Formular wurde geleert.');
}

async function createTask() {
  const userId = 'guest_user';

  // Hole die Werte aus dem Formular
  const title = document.getElementById('taskTitle').value;
  const date = document.getElementById('taskDate').value;
  const category = document.getElementById('taskCategory').value;

  // Pflichtfelder prüfen
  if (!title || !date || category === 'Select task category') {
    alert('Please fill in all required fields (*)');
    return;
  }

  const newTask = {
    title: title,
    description: document.getElementById('taskDescription').value,
    dueDate: date,
    category: category,
    priority: currentPriority,
    assignedTo: document.getElementById('tasksAssigned').value,
    createdAt: Date.now(),
  };

  try {
    // In Firebase speichern
    await database.ref(`users/${userId}/tasks`).push(newTask);

    // Feedback und Formular leeren
    alert('Task erfolgreich gespeichert!');
    clearForm();
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
    alert('Fehler beim Speichern des Tasks.');
  }
}

initAddTask();
