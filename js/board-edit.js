import { ref, update } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { auth, database } from './firebase-config.js';
import { closeTaskDetail } from './ui.js';
import {
  generateTaskDetailHTML,
  generateEditTaskHTML,
  getSubtaskEditHTML,
} from './template.js';
import { isGuestUser, setLocalTasks } from './storage.js';
import { userSubtaskPath, userTaskPath, userTasksPath } from './database-paths.js';
import { boardState } from './board-state.js';


/**
 * Opens the task for editing; redirects on mobile or opens dialog on desktop.
 * @param {string} id - The task ID.
 */
export async function editTask(id) {
  const task = boardState.CURRENT_TASKS[id];
  if (!task) return;
  localStorage.setItem('editTaskId', id);
  localStorage.setItem('editTaskData', JSON.stringify(task));
  if (window.innerWidth < 850) {
    closeTaskDetail();
    navigateTo('add-task');
    return;
  }
  await openEditTaskDialog(id, task);
}


/**
 * Loads the add-task form into the dialog and opens it in edit mode.
 * @param {string} id - Task ID.
 * @param {Object} task - Task data object.
 */
async function openEditTaskDialog(id, task) {
  const content = document.getElementById('taskDetailContent');
  const response = await fetch('add-task.html');
  content.innerHTML = `<div class="edit-mode-container">${await response.text()}</div>`;
  if (window.prepareEditInDialog) window.prepareEditInDialog(id, task);
  const dialog = document.getElementById('taskDetailDialog');
  if (!dialog.open) dialog.showModal();
}


/**
 * Collects input data and updates the task in the database or local storage.
 * @param {string} id - The task ID to update.
 */
export async function saveEdit(id) {
  const updates = getEditFormData(id);
  if (isGuestUser()) {
    Object.assign(boardState.CURRENT_TASKS[id], updates);
    setLocalTasks(Object.values(boardState.CURRENT_TASKS));
  } else {
    await update(ref(database, userTaskPath(auth.currentUser.uid, id)), updates);
  }
  boardState.renderFilteredTasks?.();
  closeTaskDetail();
}


/**
 * Reads the edit form inputs and returns an update object.
 * @param {string} id - Task ID used to fall back on existing assignedTo.
 * @returns {Object} The updated task fields.
 */
function getEditFormData(id) {
  return {
    title: document.getElementById('editTitle').value,
    description: document.getElementById('editDescription').value,
    dueDate: document.getElementById('editDate').value,
    priority: boardState.editPriority,
    assignedTo: window.selectedContacts || boardState.CURRENT_TASKS[id].assignedTo || [],
  };
}


/**
 * Toggles a subtask and re-renders the board to update the progress bar.
 * @param {string} taskId - Parent task ID.
 * @param {number} index - Subtask index.
 */
export async function toggleSubtask(taskId, index) {
  const task = boardState.CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  if (isGuestUser()) {
    setLocalTasks(Object.values(boardState.CURRENT_TASKS));
    boardState.renderFilteredTasks?.();
  } else {
    const path = userSubtaskPath(auth.currentUser.uid, taskId, index);
    await update(ref(database, path), { done: task.subtasks[index].done });
  }
  document.getElementById('taskDetailContent').innerHTML = generateTaskDetailHTML(task, taskId);
}


/**
 * Replaces a subtask item with an input field to enable editing.
 * @param {number} index - Subtask index.
 * @param {string} taskId - Parent task ID.
 */
export function editEditSubtask(index, taskId) {
  const item = document.getElementById(`subtaskItemDetail${index}`);
  const task = boardState.CURRENT_TASKS[taskId];
  if (item && task && task.subtasks[index]) {
    item.outerHTML = getSubtaskEditHTML(task.subtasks[index].title, index, true, taskId);
    document.getElementById(`editSubtaskInput${index}`)?.focus();
  }
}


/**
 * Saves the edited subtask title to the UI and updates the database.
 * @param {number} index - Subtask index.
 * @param {string} taskId - Parent task ID.
 */
export async function saveEditSubtask(index, taskId) {
  const input = document.getElementById(`editSubtaskInput${index}`);
  const task = boardState.CURRENT_TASKS[taskId];
  if (!input || input.value.trim() === '') return;
  task.subtasks[index].title = input.value.trim();
  if (!isGuestUser()) {
    const path = userSubtaskPath(auth.currentUser.uid, taskId, index);
    await update(ref(database, path), { title: task.subtasks[index].title });
  }
  document.getElementById('taskDetailContent').innerHTML = generateTaskDetailHTML(task, taskId);
}


/**
 * Listens for the enter key to submit new subtasks in edit mode.
 * @param {KeyboardEvent} event - The keyboard event object.
 * @param {string} taskId - The parent task ID.
 */
export function handleEditSubtaskKey(event, taskId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addEditSubtask(taskId);
  }
}


/**
 * Adds a subtask entry into the temporary local list in edit mode.
 * @param {string} taskId - The parent task ID.
 */
export async function addEditSubtask(taskId) {
  const input = document.getElementById('editSubtaskInput');
  const title = input.value.trim();
  const task = boardState.CURRENT_TASKS[taskId];
  if (title === '' || !task) return;
  if (!task.subtasks) task.subtasks = [];
  task.subtasks.push({ title, done: false });
  input.value = '';
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(task, taskId);
}


/**
 * Deletes a subtask entry from the temporary editor view.
 * @param {string} id - The parent task ID.
 * @param {number} index - Subtask position index.
 */
export async function deleteEditSubtask(id, index) {
  const task = boardState.CURRENT_TASKS[id];
  if (!task?.subtasks) return;
  task.subtasks.splice(index, 1);
  document.getElementById('taskDetailContent').innerHTML = generateTaskDetailHTML(task, id);
  if (!isGuestUser()) {
    await update(ref(database, userTaskPath(auth.currentUser.uid, id)), { subtasks: task.subtasks });
  }
}


/**
 * Switches a subtask checkmark status within the editor.
 * @param {string} taskId - The parent task ID.
 * @param {number} index - Subtask position index.
 */
export function toggleEditSubtask(taskId, index) {
  const task = boardState.CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(task, taskId);
}
