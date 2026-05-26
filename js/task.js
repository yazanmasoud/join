import {
  createTask as serviceCreateTask,
  updateTask as serviceUpdateTask,
} from './tasks-service.js';
import { getPriorityButtonsHTML } from './template.js';
import { getSelectOptionsHTML } from './template.js';
import { getSubtaskHTML } from './template.js';
import {
  clearActivePrioClasses,
  getPrioClass,
  CATEGORY_OPTIONS,
  CONTACT_OPTIONS,
} from './utils.js';

let subtasks = [];
let currentPriority = 'Medium';

window.toggleSubtaskStatus = toggleSubtaskStatus;
window.initAddTask = initAddTask;
window.createTask = createTask;
window.setPriority = setPriority;
window.handleSubtaskKey = handleSubtaskKey;
window.deleteSubtask = deleteSubtask;
window.prepareEditInDialog = prepareEditInDialog;

export async function initAddTask() {
  renderPriorityButtons();
  renderCategories();
  renderContacts();
  setPriority(currentPriority);
  const editId = localStorage.getItem('editTaskId');
  if (editId) {
    const editData = JSON.parse(localStorage.getItem('editTaskData'));
    fillFormForEdit(editData);
    updateButtonToSaveMode();
  }
}

function fillFormForEdit(data) {
  document.getElementById('taskTitle').value = data.title || '';
  document.getElementById('taskDescription').value = data.description || '';
  document.getElementById('taskDate').value = data.dueDate || '';
  document.getElementById('taskCategory').value = data.category || '';
  document.getElementById('tasksAssigned').value = data.assignedTo || '';
  subtasks = data.subtasks || [];
  setPriority(data.priority || 'Medium');
  renderSubtasks();
}

function updateButtonToSaveMode() {
  const btn = document.querySelector('.btn-dark');
  if (btn) {
    btn.innerHTML = 'Save Changes <img src="../assets/icons/create-task.svg">';
    btn.onclick = createTask;
  }
  const headline = document.querySelector('h2');
  if (headline) headline.innerText = 'Edit Task';
}

/**
 * Manages the task creation process, validates data, and saves it to Firebase.
 */
async function createTask() {
  const task = getTaskObject();
  if (!validateTask(task)) return;
  const editId = localStorage.getItem('editTaskId');
  try {
    if (editId) {
      await serviceUpdateTask(editId, task);
    } else {
      await serviceCreateTask(task);
    }
    handleSuccess();
  } catch (e) {
    console.error('Fehler:', e);
  }
}

function handleSuccess() {
  showSuccessToast();
  const editId = localStorage.getItem('editTaskId');

  localStorage.removeItem('editTaskId');
  localStorage.removeItem('editTaskData');

  setTimeout(async () => {
    if (editId) {
      await navigateTo('board');
    } else {
      clearForm();
    }
  }, 1000);
}

/**
 * Validates that required fields like title, date, and category are filled.
 * @param {Object} task - The task object to validate.
 * @returns {boolean} True if the task is valid, otherwise false.
 */
function validateTask(task) {
  const catSelect = document.getElementById('taskCategory');
  return task.title && task.dueDate && catSelect.selectedIndex !== 0;
}

/**
 * Gathers values from input fields and bundles them into a structured task object.
 * @returns {Object} The generated task object.
 */
function getTaskObject() {
  const editData = JSON.parse(localStorage.getItem('editTaskData') || '{}');
  return {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    dueDate: document.getElementById('taskDate').value,
    category: document.getElementById('taskCategory').value,
    priority: currentPriority,
    assignedTo: document.getElementById('tasksAssigned').value,
    subtasks: subtasks,
    status: editData.status || 'todo', // Behält den alten Status (wichtig!)
    createdAt: editData.createdAt || Date.now(),
  };
}

/**
 * Updates the global priority variable and updates the button states in the UI.
 * @param {string} prio - The priority level to set.
 */
function setPriority(prio) {
  currentPriority = prio;
  clearActivePrioClasses('.prio-btn');
  const active = document.getElementById('prio' + prio);
  if (active) active.classList.add(getPrioClass(prio));
}

/**
 * Generates and renders HTML buttons inside the priority container.
 */
function renderPriorityButtons() {
  const container = document.getElementById('prioContainer');
  if (container) container.innerHTML = getPriorityButtonsHTML();
}

/**
 * Dynamically populates the task category dropdown list.
 */
function renderCategories() {
  const select = document.getElementById('taskCategory');
  if (select)
    select.innerHTML = getSelectOptionsHTML(
      CATEGORY_OPTIONS,
      'Select task category',
    );
}

/**
 * Populates the contacts selection dropdown list in the UI.
 */
function renderContacts() {
  const select = document.getElementById('tasksAssigned');
  if (select)
    select.innerHTML = getSelectOptionsHTML(
      CONTACT_OPTIONS,
      'Select contacts to assign',
    );
}

/**
 * Adds a new subtask to the array when the Enter key is pressed.
 * @param {KeyboardEvent} event - The keyboard event.
 */
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

/**
 * Refreshes and renders the visible list of subtasks on the page.
 */
function renderSubtasks() {
  let list = document.getElementById('subtasksList');
  if (!list) return;
  list.innerHTML = '';
  subtasks.forEach((task, index) => {
    list.innerHTML += getSubtaskHTML(task, index);
  });
}

/**
 * Removes a specific subtask from the array and updates the display.
 * @param {number} index - The index of the subtask to delete.
 */
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

/**
 * Resets all input fields, arrays, and clears any active edit session data.
 */
function clearForm() {
  ['taskTitle', 'taskDescription', 'taskDate', 'subtasks'].forEach((id) => {
    let element = document.getElementById(id);
    if (element) element.value = '';
  });
  subtasks = [];
  renderSubtasks();
  document.getElementById('taskCategory').selectedIndex = 0;
  document.getElementById('tasksAssigned').selectedIndex = 0;
  setPriority('Medium');
  localStorage.removeItem('editTaskId'); // Entfernt den Edit-Status
  localStorage.removeItem('editTaskData');
  document.querySelector('h2').innerText = 'Add Task'; // UI zurücksetzen
  document.querySelector('.btn-dark').innerHTML =
    'Create Task <img src="../assets/icons/create-task.svg">';
}

/**
 * Briefly displays a success notification toast to the user.
 */
function showSuccessToast() {
  const toast = document.getElementById('successMessage');
  if (toast) {
    toast.classList.remove('d-none');
    setTimeout(() => {
      toast.style.bottom = '50px';
    }, 10);

    setTimeout(() => {
      toast.classList.add('d-none');
    }, 2000);
  }
}
function toggleSubtaskStatus(index) {
  subtasks[index].done = !subtasks[index].done;
  renderSubtasks();
}

export function prepareEditInDialog(id, data) {
  renderPriorityButtons();
  renderCategories();
  renderContacts();
  fillFormForEdit(data);

  // Überschrift auf Edit Task ändern
  const headline = document.querySelector('.edit-mode-container h2');
  if (headline) headline.innerText = 'Edit Task';

  // Button zu "Ok" ändern
  const btn = document.querySelector('.edit-mode-container .btn-dark');
  if (btn) {
    btn.innerHTML = 'Ok <img src="../assets/icons/create-task.svg">';
    btn.onclick = () => saveEditFromDialog(id);
  }

  // Clear Button entfernen
  const clearBtn = document.querySelector('.edit-mode-container .btn-light');
  if (clearBtn) clearBtn.remove();
}

async function saveEditFromDialog(id) {
  const task = getTaskObject(); // Holt die Daten aus den Input-Feldern
  if (!validateTask(task)) return;

  try {
    // Gezieltes Update statt Neu-Erstellung
    await serviceUpdateTask(id, task);

    localStorage.removeItem('editTaskData');
    document.getElementById('taskDetailDialog').close();

    if (window.initBoard) window.initBoard();
  } catch (e) {
    console.error('Update fehlgeschlagen:', e);
  }
}
