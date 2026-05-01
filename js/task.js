const CATEGORY_OPTIONS = ['Technical Task', 'User Story', 'Feature Task'];
const CONTACT_OPTIONS = [
  'Maximilian Müller',
  'Sofia Schneider',
  'Benedikt Bauer',
];
let currentPriority = 'Medium';

function initAddTask() {
  renderPriorityButtons();
  renderCategories();
  renderContacts();
  setPriority(currentPriority);
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

function setPriority(prio) {
  currentPriority = prio;
  const btns = document.querySelectorAll('.prio-btn');
  btns.forEach((b) =>
    b.classList.remove('active-urgent', 'active-medium', 'active-low'),
  );
  const active = document.getElementById('prio' + prio);
  if (active) active.classList.add('active-' + prio.toLowerCase());
}

function getTaskObject() {
  return {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    dueDate: document.getElementById('taskDate').value,
    category: document.getElementById('taskCategory').value,
    priority: currentPriority,
    assignedTo: document.getElementById('tasksAssigned').value,
    status: 'todo',
    createdAt: Date.now(),
  };
}

async function createTask() {
  const task = getTaskObject();
  if (
    !task.title ||
    !task.dueDate ||
    task.category === 'Select task category'
  ) {
    return alert('Please fill in all required fields (*)');
  }
  try {
    await database.ref('tasks').push(task);
    alert('Task erfolgreich gespeichert!');
    window.location.href = 'board.html';
  } catch (e) {
    console.error('Fehler:', e);
  }
}

function clearForm() {
  ['taskTitle', 'taskDescription', 'taskDate', 'subtasks'].forEach(
    (id) => (document.getElementById(id).value = ''),
  );
  document.getElementById('taskCategory').selectedIndex = 0;
  document.getElementById('tasksAssigned').selectedIndex = 0;
  setPriority('Medium');
}

initAddTask();
