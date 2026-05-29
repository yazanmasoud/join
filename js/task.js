import { createTask as serviceCreateTask, updateTask as serviceUpdateTask, isTaskValid } from './tasks-service.js';

import { getPriorityButtonsHTML, getSelectOptionsHTML, getSubtaskHTML, getContactCheckboxHTML, getSubtaskEditHTML } from './template.js';

import { clearActivePrioClasses, getPrioClass, CATEGORY_OPTIONS, CONTACT_OPTIONS } from './utils.js';

import { showSuccessToast, toggleContactList, updateButtonToSaveMode, resetInputFields } from './ui.js';

import { getContacts } from './contacts-service.js';

let subtasks = [];
let currentPriority = 'Medium';
let selectedContacts = [];

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
window.renderContacts = renderContacts;
window.editSubtask = editSubtask;
window.saveSubtask = saveSubtask;
window.getSubtaskEditHTML = getSubtaskEditHTML;

/**
 * Toggles the contact selection by clicking the row.
 */
window.toggleContactSelection = function (name) {
  const index = selectedContacts.indexOf(name);
  if (index === -1) {
    selectedContacts.push(name);
  } else {
    selectedContacts.splice(index, 1);
  }
  renderContacts(document.getElementById('assignedInput').value);
  updateSelectedBadges();
};

/**
 * Updates the visual initials badges for selected contacts.
 */
export async function updateSelectedBadges() {
  const container = document.getElementById('assignedBadges');
  if (!container) return;
  const allContacts = await getContacts();
  container.innerHTML = selectedContacts
    .map((item) => {
      const c = allContacts.find((contact) => contact.name === item || contact.id === item);
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
  selectedContacts = (data.assignedTo || []).map((item) => (typeof item === 'object' ? item.name || item.id : item));
  setPriority(data.priority || 'Medium');
  renderSubtasks();
  renderContacts();
}

/**
 * Collects form data and saves the task to the service.
 */
async function createTask() {
  const task = getTaskObject();

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
  const editData = JSON.parse(localStorage.getItem('editTaskData') || '{}');
  return {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    dueDate: document.getElementById('taskDate').value,
    category: document.getElementById('taskCategory').value,
    priority: currentPriority,
    assignedTo: selectedContacts, // Hier das neue Array nutzen!
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
  if (select) select.innerHTML = getSelectOptionsHTML(CATEGORY_OPTIONS, 'Select task category');
}

/**
 * Renders contact selection list filtered by the input value.
 * @param {string} searchTerm - The string to search for in names.
 */
export async function renderContacts(searchTerm = '') {
  const list = document.getElementById('contactList');
  if (!list) return;
  const contacts = await getContacts();
  const filtered = contacts.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectedNames = selectedContacts.map((item) => (typeof item === 'object' ? item.name : item));
  const selectedIds = selectedContacts.map((item) => (typeof item === 'object' ? item.id : item));
  // Nutzt das selectedContacts Array für den Status
  list.innerHTML = filtered.map((c) => getContactCheckboxHTML(c, selectedNames.includes(c.name) || selectedIds.includes(c.id))).join('');
  if (searchTerm.length > 0) list.classList.remove('d-none');
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
 * Activates the edit mode for a subtask by re-rendering it with an input.
 * @param {number} index - The index of the subtask in the array.
 */
function editSubtask(index) {
  const list = document.getElementById('subtasksList');
  if (!list) return; // Sicherheits-Check: Falls Liste nicht da, Funktion abbrechen

  const items = list.querySelectorAll('li');
  if (!items[index]) return; // Falls der Index nicht existiert, abbrechen

  items[index].outerHTML = getSubtaskEditHTML(subtasks[index].title, index);
  const input = document.getElementById(`editSubtaskInput${index}`);
  input?.focus();
}

/**
 * Saves the edited subtask title and returns to normal view.
 * @param {number} index - The index of the subtask.
 */
function saveSubtask(index) {
  const input = document.getElementById(`editSubtaskInput${index}`);
  if (input && input.value.trim() !== '') {
    subtasks[index].title = input.value.trim();
  } else if (input && input.value.trim() === '') {
    subtasks.splice(index, 1);
  }
  renderSubtasks();
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
  ['taskTitle', 'taskDescription', 'taskDate', 'subtasks', 'assignedInput'].forEach((id) => {
    if (document.getElementById(id)) document.getElementById(id).value = '';
  });
  subtasks = [];
  selectedContacts = [];
  if (window.renderSubtasks) renderSubtasks();
  if (window.renderContacts) {
    renderContacts().then(() => updateSelectedBadges());
  } else {
    updateSelectedBadges();
  }
  const list = document.getElementById('contactList');
  if (list) list.classList.add('d-none');
  document.getElementById('taskCategory') && (document.getElementById('taskCategory').selectedIndex = 0);
  document.getElementById('tasksAssigned') && (document.getElementById('tasksAssigned').selectedIndex = 0);
  if (window.setPriority) setPriority('Medium');
  ['editTaskId', 'editTaskData'].forEach((k) => localStorage.removeItem(k));
  if (document.querySelector('h2')) document.querySelector('h2').innerText = 'Add Task';
  const btn = document.querySelector('.btn-dark');
  if (btn) btn.innerHTML = 'Create Task <img src="../assets/icons/create-task.svg">';
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
  fillFormForEdit(data);
  renderPriorityButtons();
  renderCategories();
  if (data.category) document.getElementById('taskCategory').value = data.category;
  renderContacts().then(() => typeof updateSelectedBadges === 'function' && updateSelectedBadges());
  const h2 = document.querySelector('.edit-mode-container h2');
  if (h2) h2.innerText = 'Edit Task';
  const btn = document.querySelector('.edit-mode-container .btn-dark');
  if (btn) {
    btn.innerHTML = 'Ok <img src="../assets/icons/create-task.svg">';
    btn.onclick = () => saveEditFromDialog(id);
  }
  document.querySelector('.edit-mode-container .btn-light')?.remove();
}

function showDeleteToast() {
  const toast = document.getElementById('successMessage');
  const span = toast.querySelector('span');
  const img = toast.querySelector('img');

  const originalText = span.innerText;
  span.innerText = 'Task deleted';
  img.style.display = 'none';

  toast.classList.remove('d-none');

  setTimeout(() => {
    toast.classList.add('d-none');
    span.innerText = originalText;
    img.style.display = '';
  }, 1000);
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
