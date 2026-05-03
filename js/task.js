// Variablen & Konstanten
const CATEGORY_OPTIONS = ['Technical Task', 'User Story', 'Feature Task'];
const CONTACT_OPTIONS = [
  'Maximilian Müller',
  'Sofia Schneider',
  'Benedikt Bauer',
];

let subtasks = [];
let currentPriority = 'Medium';

//  Initialisierung
function initAddTask() {
  renderPriorityButtons();
  renderCategories();
  renderContacts();
  setPriority(currentPriority);
}

//  Logik (Firebase & Daten)
async function createTask() {
  const task = getTaskObject();
  const categorySelect = document.getElementById('taskCategory');

  if (!task.title || !task.dueDate || categorySelect.selectedIndex === 0) {
    return;
  }

  try {
    await database.ref('tasks').push(task);
    showSuccessToast();
    clearForm();
  } catch (e) {}
}

function getTaskObject() {
  return {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    dueDate: document.getElementById('taskDate').value,
    category: document.getElementById('taskCategory').value,
    priority: currentPriority,
    assignedTo: document.getElementById('tasksAssigned').value,
    subtasks: subtasks,
    status: 'todo',
    createdAt: Date.now(),
  };
}

// UI & Rendering

// Priority & Dropdowns
function setPriority(prio) {
  currentPriority = prio;
  const btns = document.querySelectorAll('.prio-btn');
  btns.forEach((b) =>
    b.classList.remove('active-urgent', 'active-medium', 'active-low'),
  );
  const active = document.getElementById('prio' + prio);
  if (active) active.classList.add('active-' + prio.toLowerCase());
}

function renderPriorityButtons() {
  const container = document.getElementById('prioContainer');
  if (container) container.innerHTML = getPriorityButtonsHTML();
}

function renderCategories() {
  const select = document.getElementById('taskCategory');
  if (select)
    select.innerHTML = getSelectOptionsHTML(
      CATEGORY_OPTIONS,
      'Select task category',
    );
}

function renderContacts() {
  const select = document.getElementById('tasksAssigned');
  if (select)
    select.innerHTML = getSelectOptionsHTML(
      CONTACT_OPTIONS,
      'Select contacts to assign',
    );
}

// Subtask Logik
function handleSubtaskKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    let input = document.getElementById('subtasks');
    let title = input.value.trim();
    if (title.length > 0) {
      subtasks.push({ title: title, done: false });
      input.value = '';
      renderSubtasks();
    }
  }
}

function renderSubtasks() {
  let list = document.getElementById('subtasksList');
  if (!list) return;
  list.innerHTML = '';
  subtasks.forEach((task, index) => {
    list.innerHTML += getSubtaskHTML(task, index);
  });
}

function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

// Helper Funktionen
function clearForm() {
  ['taskTitle', 'taskDescription', 'taskDate', 'subtasks'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  subtasks = [];
  renderSubtasks();
  document.getElementById('taskCategory').selectedIndex = 0;
  document.getElementById('tasksAssigned').selectedIndex = 0;
  setPriority('Medium');
}

function showSuccessToast() {
  const toast = document.getElementById('successMessage');
  if (toast) {
    toast.classList.remove('d-none');
    setTimeout(() => toast.classList.add('d-none'), 2000);
  }
}
initAddTask();
