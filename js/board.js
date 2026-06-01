import { ref, onValue, get, child, update, remove } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { auth, database } from './firebase-config.js';

import {
  highlight,
  removeHighlight,
  setEditPriority,
  closeTaskDetail,
  setupDialogClose,
  clearElementsByIds,
  normalizeObjectToArray,
  showSuccessToast,
} from './ui.js';

import {
  getNoTaskPlaceholder,
  generateTaskHTML,
  generateTaskDetailHTML,
  generateEditTaskHTML,
  getSubtaskHTML,
  getSubtaskEditHTML,
} from './template.js';

import { isGuestUser, getLocalTasks, setLocalTasks } from './storage.js';
import { getContacts } from './contacts-service.js';
import { userSubtaskPath, userTaskPath, userTasksPath } from './database-paths.js';

/** @section GLOBAL VARIABLES */
let CURRENT_TASKS = {};
let CURRENT_DRAGGED_ELEMENT;
let editPriority;
let currentSearchTerm = '';
let currentStatus = 'todo';

/** @section GLOBAL EXPORTS FOR HTML ONCLICK */
window.initBoard = initBoard;
window.openAddTask = openAddTask;
window.openTaskDetail = openTaskDetail;
window.toggleSubtask = toggleSubtask;
window.startDragging = startDragging;
window.allowDrop = allowDrop;
window.moveTo = moveTo;
window.editTask = editTask;
window.saveEdit = saveEdit;
window.handleEditSubtaskKey = handleEditSubtaskKey;
window.addEditSubtask = addEditSubtask;
window.deleteEditSubtask = deleteEditSubtask;
window.toggleEditSubtask = toggleEditSubtask;
window.deleteTask = deleteTask;
window.closeTaskDetail = closeTaskDetail;
window.editEditSubtask = editEditSubtask;
window.saveEditSubtask = saveEditSubtask;
window.highlight = highlight;
window.removeHighlight = removeHighlight;

/**
 * Initializes the board data, contacts and live task rendering.
 *
 * @returns {Promise<void>}
 */
export async function initBoard() {
  setupTaskSearch();
  window.contacts = await getContacts();
  /**
   * Applies loaded task data to the board state and renders the board.
   *
   * @param {Object|Array} data - The loaded task data.
   * @returns {void}
   */
  const setup = (data) => {
    CURRENT_TASKS = data || {};
    renderFilteredTasks();
    setupDialogClose(closeTaskDetail);
  };
  if (isGuestUser()) return setup(convertTaskArrayToObject(getLocalTasks()));
  onValue(ref(database, userTasksPath(auth.currentUser.uid)), (snap) => setup(snap.val()));
}

/**
 * Connects the task search field with realtime board filtering.
 *
 * @returns {void}
 */
function setupTaskSearch() {
  const searchInput = document.getElementById('searchTask');

  if (!searchInput || searchInput.dataset.searchInitialized === 'true') return;

  currentSearchTerm = searchInput.value.trim().toLowerCase();
  searchInput.dataset.searchInitialized = 'true';

  searchInput.addEventListener('input', () => {
    currentSearchTerm = searchInput.value.trim().toLowerCase();
    renderFilteredTasks();
  });
}

/**
 * Filters the current tasks and updates the board columns.
 *
 * @returns {void}
 */
function renderFilteredTasks() {
  const filteredTasks = filterTasksBySearchTerm(CURRENT_TASKS);

  renderAllTasks(filteredTasks);
  updateNoSearchResults(filteredTasks);
}

/**
 * Returns tasks whose title or description matches the current search term.
 *
 * @param {Object|Array} allTasks - The complete task collection.
 * @returns {Array|Object} The filtered tasks or original task collection.
 */
function filterTasksBySearchTerm(allTasks) {
  if (!currentSearchTerm) return allTasks;

  return normalizeObjectToArray(allTasks).filter((task) => {
    const title = String(task.title || '').toLowerCase();
    const description = String(task.description || '').toLowerCase();

    return title.includes(currentSearchTerm) || description.includes(currentSearchTerm);
  });
}

/**
 * Toggles the empty search result message for the current filter result.
 *
 * @param {Object|Array} filteredTasks - The currently displayed task collection.
 * @returns {void}
 */
function updateNoSearchResults(filteredTasks) {
  const noResultsElement = document.getElementById('noSearchResults');
  if (!noResultsElement) return;

  const hasNoSearchResults = currentSearchTerm && normalizeObjectToArray(filteredTasks).length === 0;

  noResultsElement.classList.toggle('hidden', !hasNoSearchResults);
}

/**
 * Renders all provided tasks into their matching board columns.
 *
 * @param {Object|Array} allTasks - The tasks to render.
 * @returns {void}
 */
function renderAllTasks(allTasks) {
  const columns = ['todo', 'progress', 'feedback', 'done'];
  if (!document.getElementById(columns[0])) return;
  clearElementsByIds(columns);

  normalizeObjectToArray(allTasks).forEach((task) => {
    const container = document.getElementById(task.status || 'todo');
    if (container) container.innerHTML += generateTaskHTML(task, task.id);
  });

  columns.forEach((id) => checkPlaceholder(id));
}

/**
 * Renders an empty-column placeholder when a board column has no tasks.
 *
 * @param {string} id - The board column element ID.
 * @returns {void}
 */
function checkPlaceholder(id) {
  const el = document.getElementById(id);
  if (!el.hasChildNodes()) el.innerHTML = getNoTaskPlaceholder(id);
}

/** @section TASK DETAILS & DIALOG CONTROL */

/**
 * Opens the task detail dialog using locally stored task data.
 * @param {string} id - The unique ID of the task.
 */
export async function openTaskDetail(id) {
  const dialog = document.getElementById('taskDetailDialog');
  const content = document.getElementById('taskDetailContent');
  const task = CURRENT_TASKS[id];

  if (task) {
    content.innerHTML = generateTaskDetailHTML(task, id);
    dialog.showModal();
  } else {
    console.error('Task not found in CURRENT_TASKS:', id);
  }
}

/**
 * Toggles a subtask and re-renders the board to update the progress bar.
 */
export async function toggleSubtask(taskId, index) {
  const task = CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  if (isGuestUser()) {
    setLocalTasks(Object.values(CURRENT_TASKS));
    renderFilteredTasks(); // Sofortiges Update für Gäste
  } else {
    const path = userSubtaskPath(auth.currentUser.uid, taskId, index);
    await update(ref(database, path), { done: task.subtasks[index].done });
  }
  document.getElementById('taskDetailContent').innerHTML = generateTaskDetailHTML(task, taskId);
}

/**
 * Switches a detail subtask into inline edit mode.
 *
 * @param {number} index - The subtask index.
 * @param {string} taskId - The parent task ID.
 * @returns {void}
 */
export function editEditSubtask(index, taskId) {
  const item = document.getElementById(`subtaskItemDetail${index}`);
  const task = CURRENT_TASKS[taskId];
  if (item && task) {
    item.outerHTML = getSubtaskEditHTML(task.subtasks[index].title, index, true, taskId);
    const input = document.getElementById(`editSubtaskInput${index}`);
    input?.focus();
  }
}

/**
 * Exposes inline detail subtask editing for HTML event handlers.
 *
 * @param {number} index - The subtask index.
 * @param {string} taskId - The parent task ID.
 * @returns {void}
 */
window.editEditSubtask = function (index, taskId) {
  const item = document.getElementById(`subtaskItemDetail${index}`);
  const task = CURRENT_TASKS[taskId];

  if (item && task && task.subtasks[index]) {
    item.outerHTML = getSubtaskEditHTML(task.subtasks[index].title, index, true, taskId);
    const input = document.getElementById(`editSubtaskInput${index}`);
    input?.focus();
  } else {
    console.error(`Element subtaskItemDetail${index} nicht gefunden!`);
  }
};

/**
 * Saves an edited subtask title back to the active task.
 *
 * @param {number} index - The subtask index.
 * @param {string} taskId - The parent task ID.
 * @returns {Promise<void>}
 */
async function saveEditSubtask(index, taskId) {
  const input = document.getElementById(`editSubtaskInput${index}`);
  const task = CURRENT_TASKS[taskId];
  if (input && input.value.trim() !== '') {
    task.subtasks[index].title = input.value.trim();
    const item = input.closest('li');
    item.outerHTML = getSingleDetailSubtaskHTML(task.subtasks[index], index, taskId);

    if (!isGuestUser()) {
      const path = `tasks/${auth.currentUser.uid}/${taskId}/subtasks/${index}`;
      await update(ref(database, path), { title: task.subtasks[index].title });
    }
  }
}

/** @section DRAG & DROP */

/**
 * Sets the ID of the task being dragged.
 * @param {string} id - The task element ID.
 */
function startDragging(id) {
  CURRENT_DRAGGED_ELEMENT = id;
}

/**
 * Prevents default handler to allow dropping elements.
 * @param {Event} ev - The dragover event object.
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Updates a task status column value in Firebase.
 * @param {string} status - Target status column key.
 */
async function moveTo(status) {
  removeHighlight(status);
  if (!CURRENT_DRAGGED_ELEMENT) return;

  if (isGuestUser()) {
    moveGuestTaskTo(status);
    return;
  }
  await moveFirebaseTaskTo(status);
}

/**
 * Moves a guest task to a new status column in local storage.
 *
 * @param {string} status - The target task status.
 * @returns {void}
 */
function moveGuestTaskTo(status) {
  CURRENT_TASKS[CURRENT_DRAGGED_ELEMENT] = {
    ...CURRENT_TASKS[CURRENT_DRAGGED_ELEMENT],
    status,
  };

  setLocalTasks(convertTaskObjectToArray(CURRENT_TASKS));

  renderFilteredTasks();
}

/**
 * Persists a task status change for the authenticated Firebase user.
 *
 * @param {string} status - The target task status.
 * @returns {Promise<void>}
 */
async function moveFirebaseTaskTo(status) {
  const uid = auth.currentUser.uid;
  const taskRef = ref(database, userTaskPath(uid, CURRENT_DRAGGED_ELEMENT));

  await update(taskRef, { status });
}

/** @section EDIT TASK (EDIT MODE) */

export async function editTask(id) {
  const task = CURRENT_TASKS[id];
  if (!task) return;
  const content = document.getElementById('taskDetailContent');
  localStorage.setItem('editTaskData', JSON.stringify(task));
  const response = await fetch('add-task.html'); // Diese Zeile war weg!
  content.innerHTML = `<div class="edit-mode-container">${await response.text()}</div>`;
  if (window.prepareEditInDialog) window.prepareEditInDialog(id, task);
  const dialog = document.getElementById('taskDetailDialog');
  if (!dialog.open) dialog.showModal();
}

/**
 * Saves edited task form values to the active data source.
 *
 * @param {string} id - The task ID being edited.
 * @returns {Promise<void>}
 */
export async function saveEdit(id) {
  const updates = {
    title: document.getElementById('editTitle').value,
    description: document.getElementById('editDescription').value,
    dueDate: document.getElementById('editDate').value,
    priority: editPriority,
    assignedTo: window.selectedContacts || CURRENT_TASKS[id].assignedTo || [],
  };
  if (isGuestUser()) {
    Object.assign(CURRENT_TASKS[id], updates);
    setLocalTasks(Object.values(CURRENT_TASKS));
  } else {
    await update(ref(database, userTaskPath(auth.currentUser.uid, id)), updates);
  }
  renderFilteredTasks();
  closeTaskDetail();
}

/** @section EDITING SUBTASKS */

/**
 * Listens for the enter key to submit new subtasks.
 * @param {KeyboardEvent} event - The keyboard event object.
 * @param {string} taskId - The parent task ID.
 */
function handleEditSubtaskKey(event, taskId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addEditSubtask(taskId);
  }
}

/**
 * Adds a subtask entry into the temporary local list.
 * @param {string} taskId - The parent task ID.
 */
async function addEditSubtask(taskId) {
  const input = document.getElementById('editSubtaskInput');
  const title = input.value.trim();
  const task = CURRENT_TASKS[taskId];
  if (title === '' || !task) return;
  if (!task.subtasks) task.subtasks = [];
  task.subtasks.push({ title: title, done: false });
  input.value = '';
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(task, taskId);
}

/**
 * Deletes a subtask entry from the temporary editor view.
 * @param {string} id - The parent task ID.
 * @param {number} index - Subtask position index.
 */
export async function deleteEditSubtask(id, index) {
  const task = CURRENT_TASKS[id];
  if (task && task.subtasks) {
    task.subtasks.splice(index, 1);
    document.getElementById('taskDetailContent').innerHTML = generateTaskDetailHTML(task, id);
    if (!isGuestUser()) await update(ref(database, `tasks/${auth.currentUser.uid}/${id}`), { subtasks: task.subtasks });
  }
}

/**
 * Switches a subtask checkmark status within the editor.
 * @param {string} taskId - The parent task ID.
 * @param {number} index - Subtask position index.
 */
function toggleEditSubtask(taskId, index) {
  const task = CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(task, taskId);
}

/** @section MISCELLANEOUS ACTIONS */

/**
 * Deletes a task from the respective data source.
 * @param {string} id - The task ID to delete.
 */
export async function deleteTask(id) {
  if (isGuestUser()) {
    delete CURRENT_TASKS[id];
    setLocalTasks(Object.values(CURRENT_TASKS));
  } else {
    await remove(ref(database, userTaskPath(auth.currentUser.uid, id)));
  }
  closeTaskDetail();
  renderFilteredTasks();
  if (typeof showSuccessToast === 'function') showSuccessToast('Task deleted');
}

/**
 * Navigates the window viewport to the creation view.
 * @param {string} [status='todo'] - Initial status column value.
 */
export async function openAddTask(status = 'todo') {
  currentStatus = status;
  const content = document.getElementById('taskDetailContent');
  const response = await fetch('add-task.html');
  content.innerHTML = `<div class="edit-mode-container">${await response.text()}</div>`;
  localStorage.removeItem('editTaskId');
  if (window.initAddTask) await window.initAddTask();
  currentStatus = status;
  const btn = content.querySelector('#createTaskBtn') || content.querySelector('.btn-dark');
  if (btn) btn.onclick = () => saveNewTaskFromBoard();
  document.getElementById('taskDetailDialog').showModal();
}

/**
 * Creates a new task from the board dialog form values.
 *
 * @returns {Promise<void>}
 */
async function saveNewTaskFromBoard() {
  const newTask = getTaskDataFromForm();
  if (isGuestUser()) {
    const tempId = Date.now();
    CURRENT_TASKS[tempId] = newTask;
    setLocalTasks(Object.values(CURRENT_TASKS));
  } else {
    const newTaskRef = push(ref(database, `tasks/${auth.currentUser.uid}`));
    await update(newTaskRef, newTask);
    CURRENT_TASKS[newTaskRef.key] = newTask;
  }
  closeTaskDetail();
  renderFilteredTasks();
}

/**
 * Reads task form fields and returns a normalized task object.
 *
 * @returns {Object} The task data from the current form.
 */
function getTaskDataFromForm() {
  return {
    title: document.getElementById('taskTitle')?.value || '',
    description: document.getElementById('taskDescription')?.value || '',
    dueDate: document.getElementById('taskDate')?.value || '',
    priority: window.currentPriority || 'Medium',
    status: currentStatus,
    category: document.getElementById('selectedCategory')?.innerText || 'User Story',
    assignedTo: window.selectedContacts || [],
    subtasks: window.subtasks || [],
  };
}

/**
 * Converts a task array into an object keyed by task ID.
 *
 * @param {Array} tasks - The task list to convert.
 * @returns {Object} Tasks keyed by their IDs.
 */
function convertTaskArrayToObject(tasks) {
  return tasks.reduce((taskObject, task) => {
    taskObject[task.id] = task;
    return taskObject;
  }, {});
}

/**
 * Converts a task object map into an array.
 *
 * @param {Object} tasksObject - Tasks keyed by their IDs.
 * @returns {Array} The task values as an array.
 */
function convertTaskObjectToArray(tasksObject) {
  return Object.values(tasksObject);
}
