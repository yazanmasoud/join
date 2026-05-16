/**
 * @file Board management script handling task filtering, viewing, and state updates.
 */

import { ref, onValue, get, child, update, remove } from 'firebase/database';
import { database } from './firebase-config.js';

import {
  highlight,
  removeHighlight,
  setEditPriority,
  closeTaskDetail,
  setupDialogClose,
} from './ui.js';

import {
  getNoTaskPlaceholder,
  generateTaskHTML,
  generateTaskDetailHTML,
  generateEditTaskHTML,
} from './template.js';

/** @section GLOBAL VARIABLES */
let CURRENT_TASKS = {};
let CURRENT_DRAGGED_ELEMENT;
let editPriority;

/** @section CENTRAL PATH VARIABLE */
const GUEST_PATH = 'users/guest_user/tasks';

/** @section INITIALIZATION & RENDERING */

/**
 * Initializes the board and listens to Firebase data.
 */
export function initBoard() {
  const tasksRef = ref(database, GUEST_PATH);

  // v9+ Echtzeit-Listener
  onValue(tasksRef, (snapshot) => {
    CURRENT_TASKS = snapshot.val() || {};
    renderAllTasks(CURRENT_TASKS);
  });

  setupDialogClose();
}

/**
 * Renders all tasks into their respective columns.
 * @param {Object} allTasks - Object containing all tasks.
 */
function renderAllTasks(allTasks) {
  const cols = ['todo', 'progress', 'feedback', 'done'];
  if (!document.getElementById(cols[0])) return;

  cols.forEach((id) => {
    const colElement = document.getElementById(id);
    if (colElement) colElement.innerHTML = '';
  });

  Object.entries(allTasks).forEach(([id, task]) => {
    const container = document.getElementById(task.status || 'todo');
    if (container) container.innerHTML += generateTaskHTML(task, id);
  });

  cols.forEach((id) => checkPlaceholder(id));
}

/**
 * Inserts a placeholder if a board column is empty.
 * @param {string} id - The HTML column ID.
 */
function checkPlaceholder(id) {
  const el = document.getElementById(id);
  if (!el.hasChildNodes()) el.innerHTML = getNoTaskPlaceholder(id);
}

/** @section TASK DETAILS & DIALOG CONTROL */

/**
 * Opens the detailed view dialog for a specific task.
 * @param {string} id - The task ID.
 */
async function openTaskDetail(id) {
  const dialog = document.getElementById('taskDetailDialog');
  const content = document.getElementById('taskDetailContent');
  try {
    const snapshot = await get(child(ref(database), `${GUEST_PATH}/${id}`));
    const task = snapshot.val();
    if (task) {
      content.innerHTML = generateTaskDetailHTML(task, id);
      dialog.showModal();
    }
  } catch (error) {
    console.error('Fehler beim Öffnen des Tasks:', error);
  }
}

/**
 * Toggles a subtask check status and updates Firebase.
 * @param {string} taskId - The task ID.
 * @param {number} index - The subtask index array position.
 */
async function toggleSubtask(taskId, index) {
  const task = CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  const subtaskRef = ref(database, `${GUEST_PATH}/${taskId}/subtasks/${index}`);
  await update(subtaskRef, {
    done: task.subtasks[index].done,
  });
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
  if (CURRENT_DRAGGED_ELEMENT) {
    const taskRef = ref(database, `${GUEST_PATH}/${CURRENT_DRAGGED_ELEMENT}`);
    await update(taskRef, { status });
  }
}

/** @section EDIT TASK (EDIT MODE) */

/**
 * Enables edit mode view inside the open dialog.
 * @param {string} id - The task ID.
 */
async function editTask(id) {
  const dialog = document.getElementById('taskDetailDialog');
  const task = CURRENT_TASKS[id];
  if (!task) {
    const snapshot = await get(child(ref(database), `${GUEST_PATH}/${id}`));
    task = snapshot.val();
  }

  if (task) {
    document.getElementById('taskDetailContent').innerHTML =
      generateEditTaskHTML(task, id);
    dialog.classList.add('edit-mode-wide');
    editPriority = task.priority;
  }
}

/**
 * Pushes edited task field values to Firebase.
 * @param {string} id - The task ID.
 */
async function saveEdit(id) {
  const task = CURRENT_TASKS[id];
  const updates = {
    title: document.getElementById('editTitle').value,
    description: document.getElementById('editDescription').value,
    dueDate: document.getElementById('editDate').value,
    priority: editPriority,
    assignedTo: document.getElementById('editAssigned').value,
    subtasks: task.subtasks || [],
  };
  await update(ref(database, `${GUEST_PATH}/${id}`), updates);
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
 * Completely removes a task document from Firebase.
 * @param {string} id - The task ID.
 */
async function deleteTask(id) {
  await remove(ref(database, `${GUEST_PATH}/${id}`));
  closeTaskDetail();
}

/**
 * Navigates the window viewport to the creation view.
 * @param {string} [status='todo'] - Initial status column value.
 */
function openAddTask(status = 'todo') {
  localStorage.setItem('selectedStatus', status);
  window.location.href = 'add-task.html';
}
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
