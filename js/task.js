import {
  getPriorityButtonsHTML,
  getSelectOptionsHTML,
  getSubtaskHTML,
} from './template.js';

import {
  CATEGORY_OPTIONS,
  CONTACT_OPTIONS,
  getPrioClass,
  clearActivePrioClasses,
  getCurrentUserId,
} from './utils.js';

let subtasks = [];
let currentPriority = 'Medium';

/**
 * Initializes the page by rendering dropdowns, buttons, and setting the default priority.
 */
function initAddTask() {
  renderPriorityButtons();
  renderCategories();
  renderContacts();
  setPriority(currentPriority);
}

/**
 * Manages the task creation process, validates data, and saves it to Firebase.
 */
async function createTask() {
  const task = getTaskObject();
  if (!validateTask(task)) return;

  const userId = getCurrentUserId();
  try {
    await database.ref(`users/${userId}/tasks`).push(task);
    showSuccessToast();
    clearForm();
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
  }
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

/**
 * Updates the global priority variable and updates the button states in the UI.
 * @param {string} prio - The priority level to set.
 */
function setPriority(prio) {
  currentPriority = prio;
  clearActivePrioClasses('.prio-btn');

  const mediumIcon = document.getElementById('prioMediumIcon');
  if (mediumIcon) {
    mediumIcon.src = '../assets/icons/medium-icon-orange.svg';
  }

  const active = document.getElementById('prio' + prio);
  if (active) {
    active.classList.add(getPrioClass(prio));

    if (prio === 'Medium' && mediumIcon) {
      mediumIcon.src = '../assets/icons/prio-medium-icon.svg';
    }
  }
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
 * Resets all input fields, arrays, and priority levels to defaults.
 */
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

/**
 * Briefly displays a success notification toast to the user.
 */
function showSuccessToast() {
  const toast = document.getElementById('successMessage');
  if (toast) {
    toast.classList.remove('d-none');
    setTimeout(() => toast.classList.add('d-none'), 2000);
  }
}

window.createTask = createTask;
window.initAddTask = initAddTask;
window.setPriority = setPriority;
window.handleSubtaskKey = handleSubtaskKey;
window.deleteSubtask = deleteSubtask;
window.clearForm = clearForm;
