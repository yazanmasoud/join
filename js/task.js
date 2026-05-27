import {
  createTask as serviceCreateTask,
  updateTask as serviceUpdateTask,
  isTaskValid,
} from './tasks-service.js';

import {
  getPriorityButtonsHTML,
  getSelectOptionsHTML,
  getSubtaskHTML,
  getContactCheckboxHTML,
} from './template.js';

import {
  clearActivePrioClasses,
  getPrioClass,
  CATEGORY_OPTIONS,
  CONTACT_OPTIONS,
} from './utils.js';

import {
  showSuccessToast,
  toggleContactList,
  updateButtonToSaveMode,
  resetInputFields,
} from './ui.js';

import { getContacts } from './contacts-service.js';

let subtasks = [];
let currentPriority = 'Medium';

/** @section GLOBAL EXPORTS */
window.toggleSubtaskStatus = toggleSubtaskStatus;
window.initAddTask = initAddTask;
window.createTask = createTask;
window.setPriority = setPriority;
window.handleSubtaskKey = handleSubtaskKey;
window.deleteSubtask = deleteSubtask;
window.prepareEditInDialog = prepareEditInDialog;
window.toggleContactList = toggleContactList;
window.updateSelectedBadges = updateSelectedBadges;
window.clearForm = clearForm;

/**
 * Updates the visual initials badges for selected contacts.
 */
export async function updateSelectedBadges() {
  const container = document.getElementById('assignedBadges');
  const checked = document.querySelectorAll(
    'input[name="assignedContact"]:checked',
  );
  if (!container) return;
  const allContacts = await getContacts();
  container.innerHTML = Array.from(checked)
    .map((cb) => {
      const c = allContacts.find((c) => c.name === cb.value);
      return `<div class="user-badge" style="background-color: ${c?.color || '#2A3647'}">${c?.initials || '??'}</div>`;
    })
    .join('');
}

/**
 * Initializes the add task view and loads edit data if available.
 */
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

/**
 * Populates form fields with existing task data for editing.
 * @param {Object} data - The task data object.
 */
function fillFormForEdit(data) {
  document.getElementById('taskTitle').value = data.title || '';
  document.getElementById('taskDescription').value = data.description || '';
  document.getElementById('taskDate').value = data.dueDate || '';
  document.getElementById('taskCategory').value = data.category || '';
  subtasks = data.subtasks || [];
  setPriority(data.priority || 'Medium');
  renderSubtasks();
}

/**
 * Collects form data and saves the task to the service.
 */
async function createTask() {
  const task = getTaskObject();
  // Geändert von validateTask zu isTaskValid (passend zum Import oben)
  if (!isTaskValid(task)) return;
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
/**
 * Handles the success case after task creation or update.
 */
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
 * Assembles the task object from form inputs.
 * @returns {Object} The formatted task object.
 */
function getTaskObject() {
  const checked = document.querySelectorAll(
    'input[name="assignedContact"]:checked',
  );
  const editData = JSON.parse(localStorage.getItem('editTaskData') || '{}');
  return {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    dueDate: document.getElementById('taskDate').value,
    category: document.getElementById('taskCategory').value,
    priority: currentPriority,
    assignedTo: Array.from(checked).map((cb) => cb.value),
    subtasks: subtasks,
    status: editData.status || 'todo',
  };
}

/**
 * Sets the active task priority.
 * @param {string} prio - Priority level.
 */
function setPriority(prio) {
  currentPriority = prio;
  clearActivePrioClasses('.prio-btn');
  const active = document.getElementById('prio' + prio);
  if (active) active.classList.add(getPrioClass(prio));
}

/**
 * Renders priority selection buttons.
 */
function renderPriorityButtons() {
  const container = document.getElementById('prioContainer');
  if (container) container.innerHTML = getPriorityButtonsHTML();
}

/**
 * Renders category dropdown options.
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
 * Renders contact selection list with real contact data.
 */
async function renderContacts() {
  const list = document.getElementById('contactList');
  if (!list) return;
  try {
    const contacts = await getContacts();
    const editData = JSON.parse(localStorage.getItem('editTaskData') || '{}');
    const assigned = Array.isArray(editData.assignedTo)
      ? editData.assignedTo
      : [];
    list.innerHTML = contacts
      .map((c) => getContactCheckboxHTML(c, assigned.includes(c.name)))
      .join('');
    updateSelectedBadges();
  } catch (e) {
    console.error('Fehler:', e);
  }
}

/**
 * Handles subtask addition via keyboard event.
 * @param {KeyboardEvent} event - Key down event.
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
 * Renders the current list of subtasks.
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
 * Removes a subtask from the list.
 * @param {number} index - Index of subtask.
 */
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

/**
 * Resets the entire task form to default state.
 */
function clearForm() {
  ['taskTitle', 'taskDescription', 'taskDate', 'subtasks'].forEach((id) => {
    if (document.getElementById(id)) document.getElementById(id).value = '';
  });
  subtasks = [];
  renderSubtasks();
  document.getElementById('taskCategory').selectedIndex = 0;
  document.getElementById('tasksAssigned').selectedIndex = 0;
  setPriority('Medium');
  localStorage.removeItem('editTaskId');
  localStorage.removeItem('editTaskData');
  document.querySelector('h2').innerText = 'Add Task';
  document.querySelector('.btn-dark').innerHTML =
    'Create Task <img src="../assets/icons/create-task.svg">';
}

/**
 * Toggles the completion status of a subtask.
 * @param {number} index - Index of subtask.
 */
function toggleSubtaskStatus(index) {
  subtasks[index].done = !subtasks[index].done;
  renderSubtasks();
}

/**
 * Prepares the form for editing within a dialog window.
 * @param {string} id - Task ID.
 * @param {Object} data - Task data.
 */
export function prepareEditInDialog(id, data) {
  renderPriorityButtons();
  renderCategories();
  renderContacts();
  fillFormForEdit(data);
  const headline = document.querySelector('.edit-mode-container h2');
  if (headline) headline.innerText = 'Edit Task';
  const btn = document.querySelector('.edit-mode-container .btn-dark');
  if (btn) {
    btn.innerHTML = 'Ok <img src="../assets/icons/create-task.svg">';
    btn.onclick = () => saveEditFromDialog(id);
  }
  const clearBtn = document.querySelector('.edit-mode-container .btn-light');
  if (clearBtn) clearBtn.remove();
}

/**
 * Saves the edited task from the dialog.
 */
async function saveEditFromDialog(id) {
  const task = getTaskObject();
  if (!isTaskValid(task)) return;
  await serviceUpdateTask(id, task);
  document.getElementById('taskDetailDialog').close();
  if (window.initBoard) window.initBoard();
}
