import {
  ref,
  onValue,
  get,
  child,
  update,
  remove,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { auth, database } from './firebase-config.js';

import {
  highlight,
  removeHighlight,
  setEditPriority,
  closeTaskDetail,
  setupDialogClose,
  clearElementsByIds,
  normalizeObjectToArray,
} from './ui.js';

import {
  getNoTaskPlaceholder,
  generateTaskHTML,
  generateTaskDetailHTML,
  generateEditTaskHTML,
} from './template.js';

import { isGuestUser, getLocalTasks, setLocalTasks } from './storage.js';

/** @section GLOBAL VARIABLES */
let CURRENT_TASKS = {};
let CURRENT_DRAGGED_ELEMENT;
let editPriority;

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
window.deleteTask = deleteTask;

export function initBoard() {
  if (isGuestUser()) {
    CURRENT_TASKS = convertTaskArrayToObject(getLocalTasks());

    renderAllTasks(CURRENT_TASKS);
    setupDialogClose(closeTaskDetail);
    return;
  }

  const uid = auth.currentUser.uid;

  const tasksRef = ref(database, `tasks/${uid}`);

  onValue(tasksRef, (snapshot) => {
    CURRENT_TASKS = snapshot.val() || {};

    renderAllTasks(CURRENT_TASKS);
  });

  setupDialogClose(closeTaskDetail);
}

function renderAllTasks(allTasks) {
  const columns = ['todo', 'progress', 'feedback', 'done'];

  if (!document.getElementById(columns[0])) return;
  clearElementsByIds(columns);

  const tasksArray = normalizeObjectToArray(allTasks);

  tasksArray.forEach((task) => {
    const container = document.getElementById(task.status || 'todo');

    if (container) {
      container.innerHTML += generateTaskHTML(task, task.id);
    }
  });

  columns.forEach((id) => checkPlaceholder(id));
}

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
window.openTaskDetail = openTaskDetail;

/**
 * Toggles a subtask and re-renders the board to update the progress bar.
 */
export async function toggleSubtask(taskId, index) {
  const task = CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  if (isGuestUser()) {
    setLocalTasks(Object.values(CURRENT_TASKS));
    renderAllTasks(CURRENT_TASKS); // Sofortiges Update für Gäste
  } else {
    const path = `tasks/${auth.currentUser.uid}/${taskId}/subtasks/${index}`;
    await update(ref(database, path), { done: task.subtasks[index].done });
  }
  document.getElementById('taskDetailContent').innerHTML =
    generateTaskDetailHTML(task, taskId);
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

function moveGuestTaskTo(status) {
  CURRENT_TASKS[CURRENT_DRAGGED_ELEMENT] = {
    ...CURRENT_TASKS[CURRENT_DRAGGED_ELEMENT],
    status,
  };

  setLocalTasks(convertTaskObjectToArray(CURRENT_TASKS));

  renderAllTasks(CURRENT_TASKS);
}

async function moveFirebaseTaskTo(status) {
  const uid = auth.currentUser.uid;
  const taskRef = ref(database, `tasks/${uid}/${CURRENT_DRAGGED_ELEMENT}`);

  await update(taskRef, { status });
}

/** @section EDIT TASK (EDIT MODE) */

export async function editTask(id) {
  const task = CURRENT_TASKS[id];
  if (!task) return;
  const dialog = document.getElementById('taskDetailDialog');
  const content = document.getElementById('taskDetailContent');

  localStorage.setItem('editTaskData', JSON.stringify(task)); // Wichtig für getTaskObject()
  const response = await fetch('add-task.html');
  content.innerHTML = `<div class="edit-mode-container">${await response.text()}</div>`;

  if (!dialog.open) dialog.showModal(); // Öffnet den Dialog, falls er zu ist
  if (window.prepareEditInDialog) window.prepareEditInDialog(id, task);
}

export async function saveEdit(id) {
  const updates = {
    title: document.getElementById('editTitle').value,
    description: document.getElementById('editDescription').value,
    dueDate: document.getElementById('editDate').value,
    priority: editPriority,
  };
  if (isGuestUser()) {
    Object.assign(CURRENT_TASKS[id], updates);
    setLocalTasks(Object.values(CURRENT_TASKS));
  } else {
    await update(ref(database, `tasks/${auth.currentUser.uid}/${id}`), updates);
  }
  renderAllTasks(CURRENT_TASKS); // Board aktualisieren
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
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(
    task,
    taskId,
  );
}

/**
 * Deletes a subtask entry from the temporary editor view.
 * @param {string} id - The parent task ID.
 * @param {number} index - Subtask position index.
 */
async function deleteEditSubtask(id, index) {
  CURRENT_TASKS[id].subtasks.splice(index, 1);
  const content = document.getElementById('taskDetailContent');
  content.innerHTML = generateEditTaskHTML(CURRENT_TASKS[id], id);
}

/**
 * Switches a subtask checkmark status within the editor.
 * @param {string} taskId - The parent task ID.
 * @param {number} index - Subtask position index.
 */
function toggleEditSubtask(taskId, index) {
  const task = CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(
    task,
    taskId,
  );
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
    await remove(ref(database, `tasks/${auth.currentUser.uid}/${id}`));
  }
  closeTaskDetail();
  renderAllTasks(CURRENT_TASKS);
}

/**
 * Navigates the window viewport to the creation view.
 * @param {string} [status='todo'] - Initial status column value.
 */
function openAddTask(status = 'todo') {
  localStorage.setItem('selectedStatus', status);
  window.location.href = 'layout.html?page=add-task';
}

function convertTaskArrayToObject(tasks) {
  return tasks.reduce((taskObject, task) => {
    taskObject[task.id] = task;
    return taskObject;
  }, {});
}

function convertTaskObjectToArray(tasksObject) {
  return Object.values(tasksObject);
}
