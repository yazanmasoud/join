import { ref, onValue, get, child, update, remove, push } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
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
 * Initializes the task board by setting up event listeners, loading contacts,
 * and subscribing to task updates based on the user's authentication status.
 *
 * @async
 * @function initBoard
 * @returns {Promise<void>}
 */
export async function initBoard() {
  setupTaskSearch();
  setupAddTaskResizeGuard();
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
  currentSearchTerm = searchInput.value.trim().toLowerCase();
  searchInput.dataset.searchInitialized = 'true';
  searchInput.addEventListener('input', () => {
    currentSearchTerm = searchInput.value.trim().toLowerCase();
    renderFilteredTasks();
  });
}


/**
 * Filters tasks by search term and updates the board UI.
 */
function renderFilteredTasks() {
  const filteredTasks = filterTasksBySearchTerm(CURRENT_TASKS);
  renderAllTasks(filteredTasks);
  updateNoSearchResults(filteredTasks);
}


/**
 * Filters tasks where title or description matches the current search term.
 * @param {Object|Array} allTasks
 * @returns {Array}
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
 * Toggles visibility of the 'no results' message based on search matches.
 */
function updateNoSearchResults(filteredTasks) {
  const noResultsElement = document.getElementById('noSearchResults');
  if (!noResultsElement) return;
  const hasNoSearchResults = currentSearchTerm && normalizeObjectToArray(filteredTasks).length === 0;
  noResultsElement.classList.toggle('hidden', !hasNoSearchResults);
}


/**
 * Clears columns and renders all tasks into their respective status containers.
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
 * Replaces a subtask item with an input field to enable editing.
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
 * Global wrapper for editEditSubtask to make it accessible via window.
 */
/**
 * Replaces a subtask item with an inline edit input (window-accessible).
 * @param {number} index - Subtask index.
 * @param {string} taskId - Parent task ID.
 */
window.editEditSubtask = function (index, taskId) {
  const item = document.getElementById(`subtaskItemDetail${index}`);
  const task = CURRENT_TASKS[taskId];
  if (item && task && task.subtasks[index]) {
    item.outerHTML = getSubtaskEditHTML(task.subtasks[index].title, index, true, taskId);
    const input = document.getElementById(`editSubtaskInput${index}`);
    input?.focus();
  }
};


/**
 * Saves the edited subtask title to the UI and updates the database.
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
 * Updates a guest task's status and saves it to local storage.
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
 * Updates a task's status in the Firebase database for the current user.
 */
async function moveFirebaseTaskTo(status) {
  const uid = auth.currentUser.uid;
  const taskRef = ref(database, userTaskPath(uid, CURRENT_DRAGGED_ELEMENT));

  await update(taskRef, { status });
}


/** @section EDIT TASK (EDIT MODE) */
/**
 * Opens the task for editing; uses a dialog on desktop or redirects on mobile.
 */
export async function editTask(id) {
  const task = CURRENT_TASKS[id];
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
 */
export async function saveEdit(id) {
  const updates = getEditFormData(id);
  if (isGuestUser()) {
    Object.assign(CURRENT_TASKS[id], updates);
    setLocalTasks(Object.values(CURRENT_TASKS));
  } else {
    await update(ref(database, userTaskPath(auth.currentUser.uid, id)), updates);
  }
  renderFilteredTasks();
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
    priority: editPriority,
    assignedTo: window.selectedContacts || CURRENT_TASKS[id].assignedTo || [],
  };
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
 * Opens add-task via redirect on mobile or in a dialog on desktop.
 */
export async function openAddTask(status = 'todo') {
  if (window.innerWidth < 850) {
    localStorage.setItem('boardReturn', 'true');
    navigateTo('add-task');
    return;
  }
  await loadAddTaskDialog(status);
}


/**
 * Loads the add-task form into the dialog and initializes its logic.
 */
async function loadAddTaskDialog(status) {
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
 * Saves a new task from the board to Firebase or local storage.
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
 * Collects and returns task data from the form fields.
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
 * Converts a task array into an object using task IDs as keys.
 */
function convertTaskArrayToObject(tasks) {
  return tasks.reduce((taskObject, task) => {
    taskObject[task.id] = task;
    return taskObject;
  }, {});
}


/**
 * Converts a task object back into an array of tasks.
 */
function convertTaskObjectToArray(tasksObject) {
  return Object.values(tasksObject);
}


/**
 * Toggles the mobile move menu and closes other open menus.
 */
window.toggleMoveMenu = function (event, id) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const menuElement = document.getElementById('moveMenu' + id);
  document.querySelectorAll('.mobile-move-menu').forEach((m) => m !== menuElement && m.classList.remove('open'));
  if (menuElement) menuElement.classList.toggle('open');
};


/**
 * Changes task status via the mobile menu and refreshes the UI.
 */
window.moveTaskMobile = async function (id, status) {
  window.CURRENT_DRAGGED_ELEMENT = id;
  const mappedStatus = { inprogress: 'progress', awaiting: 'feedback' }[status] || status;
  await moveTo(mappedStatus);
  if (CURRENT_TASKS[id]) CURRENT_TASKS[id].status = mappedStatus;
  renderFilteredTasks();
  document.getElementById('moveMenu' + id)?.classList.remove('open');
};
