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

async function createTask() {
  const userId = 'guest_user';
  const newTask = {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    dueDate: document.getElementById('taskDate').value,
    category: document.getElementById('taskCategory').value,
    priority: currentPriority,
    assignedTo: document.getElementById('tasksAssigned').value,
    createdAt: Date.now(),
  };

  try {
    await database.ref(`users/${userId}/tasks`).push(newTask);
    alert('Task gespeichert!');
    if (typeof window.clearForm === 'function') clearForm();
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
  }
}

initAddTask();
