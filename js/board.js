import { ref, onValue, get, child, remove } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
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
} from './template.js';
import { isGuestUser, getLocalTasks, setLocalTasks } from './storage.js';
import { getContacts } from './contacts-service.js';
import { userTaskPath, userTasksPath } from './database-paths.js';
import { boardState } from './board-state.js';
import {
  editTask, saveEdit,
  toggleSubtask, editEditSubtask, saveEditSubtask,
  handleEditSubtaskKey, addEditSubtask, deleteEditSubtask, toggleEditSubtask,
} from './board-edit.js';
import { startDragging, allowDrop, moveTo, openAddTask } from './board-drag.js';


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
 * Initializes the task board by setting up event listeners, loading contacts,
 * and subscribing to task updates based on the user's authentication status.
 */
export async function initBoard() {
  setupTaskSearch();
  setupAddTaskResizeGuard();
  boardState.renderFilteredTasks = renderFilteredTasks;
  window.contacts = await getContacts();
  const setup = (data) => {
    boardState.CURRENT_TASKS = data || {};
    renderFilteredTasks();
    setupDialogClose(closeTaskDetail);
  };
  if (isGuestUser()) return setup(convertTaskArrayToObject(getLocalTasks()));
  onValue(ref(database, userTasksPath(auth.currentUser.uid)), (snap) => setup(snap.val()));
}


/**
 * Closes dialog and redirects to add-task if window shrinks below 850px in edit mode.
 */
function setupAddTaskResizeGuard() {
  window.addEventListener('resize', () => {
    const dialog = document.getElementById('taskDetailDialog');
    if (dialog?.open && dialog.querySelector('.edit-mode-container') && window.innerWidth < 850) {
      dialog.close();
      navigateTo('add-task');
    }
  });
}


/**
 * Initializes task search listener and prevents double initialization.
 */
function setupTaskSearch() {
  const searchInput = document.getElementById('searchTask');
  if (!searchInput || searchInput.dataset.searchInitialized === 'true') return;
  boardState.currentSearchTerm = searchInput.value.trim().toLowerCase();
  searchInput.dataset.searchInitialized = 'true';
  searchInput.addEventListener('input', () => {
    boardState.currentSearchTerm = searchInput.value.trim().toLowerCase();
    renderFilteredTasks();
  });
}


/**
 * Filters tasks by search term and updates the board UI.
 */
export function renderFilteredTasks() {
  const filteredTasks = filterTasksBySearchTerm(boardState.CURRENT_TASKS);
  renderAllTasks(filteredTasks);
  updateNoSearchResults(filteredTasks);
}


/**
 * Filters tasks where title or description matches the current search term.
 * @param {Object|Array} allTasks - All current tasks.
 * @returns {Array} Filtered task list.
 */
function filterTasksBySearchTerm(allTasks) {
  if (!boardState.currentSearchTerm) return allTasks;
  return normalizeObjectToArray(allTasks).filter((task) => {
    const title = String(task.title || '').toLowerCase();
    const description = String(task.description || '').toLowerCase();
    return title.includes(boardState.currentSearchTerm) || description.includes(boardState.currentSearchTerm);
  });
}


/**
 * Toggles visibility of the 'no results' message based on search matches.
 * @param {Array} filteredTasks - The currently visible task list.
 */
function updateNoSearchResults(filteredTasks) {
  const noResultsElement = document.getElementById('noSearchResults');
  if (!noResultsElement) return;
  const hasNoSearchResults = boardState.currentSearchTerm && normalizeObjectToArray(filteredTasks).length === 0;
  noResultsElement.classList.toggle('hidden', !hasNoSearchResults);
}


/**
 * Clears columns and renders all tasks into their respective status containers.
 * @param {Object|Array} allTasks - All tasks to render.
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
 * Shows a placeholder if a task column is empty.
 * @param {string} id - Column element ID.
 */
function checkPlaceholder(id) {
  const el = document.getElementById(id);
  if (!el.hasChildNodes()) el.innerHTML = getNoTaskPlaceholder(id);
}


/**
 * Opens the task detail dialog using locally stored task data.
 * @param {string} id - The unique ID of the task.
 */
export async function openTaskDetail(id) {
  const dialog = document.getElementById('taskDetailDialog');
  const content = document.getElementById('taskDetailContent');
  const task = boardState.CURRENT_TASKS[id];
  if (task) {
    content.innerHTML = generateTaskDetailHTML(task, id);
    dialog.showModal();
  }
}


/**
 * Deletes a task from the respective data source.
 * @param {string} id - The task ID to delete.
 */
export async function deleteTask(id) {
  if (isGuestUser()) {
    delete boardState.CURRENT_TASKS[id];
    setLocalTasks(Object.values(boardState.CURRENT_TASKS));
  } else {
    await remove(ref(database, userTaskPath(auth.currentUser.uid, id)));
  }
  closeTaskDetail();
  renderFilteredTasks();
  if (typeof showSuccessToast === 'function') showSuccessToast('Task deleted');
}


/**
 * Converts a task array into an object using task IDs as keys.
 * @param {Array} tasks - Array of task objects with id property.
 * @returns {Object} Tasks keyed by ID.
 */
function convertTaskArrayToObject(tasks) {
  return tasks.reduce((taskObject, task) => {
    taskObject[task.id] = task;
    return taskObject;
  }, {});
}
