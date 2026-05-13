/**
 * @file Board management script handling task filtering, viewing, and state updates.
 */
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
import { loadData, saveData } from './storage.js';

/** @section GLOBAL VARIABLES */
let CURRENT_TASKS = [];
let CURRENT_DRAGGED_ELEMENT;
let editPriority;

/**
 * Initializes the board using the centralized layout system data.
 * @param {Array} tasks - Dataset array loaded from the storage layer.
 */
function initBoard(tasks) {
  CURRENT_TASKS = Array.isArray(tasks) ? tasks : Object.values(tasks || []);
  renderAllTasks(CURRENT_TASKS);
  setupDialogClose(closeTaskDetail);
}

/**
 * Renders all tasks into their respective status columns.
 * KORREKTUR: Map-Weiche korrigiert Status-Strings automatisch auf eure Spalten-IDs!
 * @param {Array} allTasks - Array containing all task entities.
 */
function renderAllTasks(allTasks) {
  const cols = ['todo', 'progress', 'feedback', 'done'];
  if (!document.getElementById(cols[0])) return;
  cols.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  allTasks.forEach((task, id) => {
    let status = task.status || 'todo';
    if (status === 'inProgress') status = 'progress'; // Behebt den Spalten-Konflikt!
    const container = document.getElementById(status);
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
  if (el && !el.hasChildNodes()) el.innerHTML = getNoTaskPlaceholder(id);
}

/**
 * Opens the detailed view dialog for a specific task.
 * @param {number} id - The task index position.
 */
function openTaskDetail(id) {
  const dialog = document.getElementById('taskDetailDialog');
  const content = document.getElementById('taskDetailContent');
  const task = CURRENT_TASKS[id];
  if (task && dialog && content) {
    content.innerHTML = generateTaskDetailHTML(task, id);
    dialog.showModal();
  }
}

/**
 * Toggles a subtask check status and updates the storage layer.
 * @param {number} taskId - The task index position.
 * @param {number} index - The subtask index array position.
 */
async function toggleSubtask(taskId, index) {
  const task = CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  await saveData('tasks', CURRENT_TASKS);
  document.getElementById('taskDetailContent').innerHTML =
    generateTaskDetailHTML(task, taskId);
}

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
 * Updates a task status column value in the central storage layer.
 * @param {string} status - Target status column key.
 */
async function moveTo(status) {
  removeHighlight(status);
  if (
    CURRENT_DRAGGED_ELEMENT !== undefined &&
    CURRENT_TASKS[CURRENT_DRAGGED_ELEMENT]
  ) {
    // Wandelt die HTML-ID beim Speichern zurück in euren DB-Standard um
    CURRENT_TASKS[CURRENT_DRAGGED_ELEMENT].status =
      status === 'progress' ? 'inProgress' : status;
    await saveData('tasks', CURRENT_TASKS);
    renderAllTasks(CURRENT_TASKS);
  }
}

/**
 * Enables edit mode view inside the open dialog.
 * @param {number} id - The task index position.
 */
function editTask(id) {
  const dialog = document.getElementById('taskDetailDialog');
  const task = CURRENT_TASKS[id];
  if (task) {
    document.getElementById('taskDetailContent').innerHTML =
      generateEditTaskHTML(task, id);
    dialog?.classList.add('edit-mode-wide');
    editPriority = task.priority;
  }
}

/**
 * Pushes edited task field values to the storage layer.
 * @param {number} id - The task index position.
 */
async function saveEdit(id) {
  const task = CURRENT_TASKS[id];
  task.title = document.getElementById('editTitle').value;
  task.description = document.getElementById('editDescription').value;
  task.dueDate = document.getElementById('editDate').value;
  task.priority = editPriority;
  await saveData('tasks', CURRENT_TASKS);
  renderAllTasks(CURRENT_TASKS);
  closeTaskDetail();
}

/**
 * Listens for the enter key to submit new subtasks.
 * @param {KeyboardEvent} event - The keyboard event object.
 * @param {number} taskId - The parent task index.
 */
function handleEditSubtaskKey(event, taskId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addEditSubtask(taskId);
  }
}

/**
 * Adds a subtask entry into the active task data object.
 * @param {number} taskId - The parent task index.
 */
async function addEditSubtask(taskId) {
  const input = document.getElementById('editSubtaskInput');
  const task = CURRENT_TASKS[taskId];
  if (!input?.value.trim() || !task) return;
  if (!task.subtasks) task.subtasks = [];
  task.subtasks.push({ title: input.value.trim(), done: false });
  input.value = '';
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(
    task,
    taskId,
  );
}

/**
 * Deletes a subtask entry from the active task editor.
 * @param {number} id - The parent task index.
 * @param {number} index - Subtask position index.
 */
function deleteEditSubtask(id, index) {
  CURRENT_TASKS[id].subtasks.splice(index, 1);
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(
    CURRENT_TASKS[id],
    id,
  );
}

/**
 * Switches a subtask checkmark status within the editor.
 * @param {number} taskId - The parent task index.
 * @param {number} index - Subtask position index.
 */
function toggleEditSubtask(taskId, index) {
  CURRENT_TASKS[taskId].subtasks[index].done =
    !CURRENT_TASKS[taskId].subtasks[index].done;
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(
    CURRENT_TASKS[taskId],
    taskId,
  );
}

/**
 * Completely removes a task document from the storage layer.
 * @param {number} id - The task index position.
 */
async function deleteTask(id) {
  CURRENT_TASKS.splice(id, 1);
  await saveData('tasks', CURRENT_TASKS);
  renderAllTasks(CURRENT_TASKS);
  closeTaskDetail();
}

/**
 * Navigates the window viewport to the creation view.
 * @param {string} [status='todo'] - Initial status column value.
 */
function openAddTask(status = 'todo') {
  localStorage.setItem('selectedStatus', status);
  window.location.href = './layout.html?page=add-task';
}

/** @section GLOBAL EXPORTS FOR HTML ONCLICK */
window.initBoard = initBoard;
window.renderBoardTasks = renderAllTasks;
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
