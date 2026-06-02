import { ref, update, push } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { auth, database } from './firebase-config.js';
import { highlight, removeHighlight, closeTaskDetail } from './ui.js';
import { isGuestUser, setLocalTasks } from './storage.js';
import { userTaskPath, userTasksPath } from './database-paths.js';
import { boardState } from './board-state.js';


/**
 * Sets the ID of the task being dragged.
 * @param {string} id - The task element ID.
 */
export function startDragging(id) {
  boardState.CURRENT_DRAGGED_ELEMENT = id;
}


/**
 * Prevents default handler to allow dropping elements.
 * @param {Event} ev - The dragover event object.
 */
export function allowDrop(ev) {
  ev.preventDefault();
}


/**
 * Updates a task status column value based on user type.
 * @param {string} status - Target status column key.
 */
export async function moveTo(status) {
  removeHighlight(status);
  if (!boardState.CURRENT_DRAGGED_ELEMENT) return;
  if (isGuestUser()) {
    moveGuestTaskTo(status);
    return;
  }
  await moveFirebaseTaskTo(status);
}


/**
 * Updates a guest task's status and saves it to local storage.
 * @param {string} status - The new status value.
 */
function moveGuestTaskTo(status) {
  boardState.CURRENT_TASKS[boardState.CURRENT_DRAGGED_ELEMENT] = {
    ...boardState.CURRENT_TASKS[boardState.CURRENT_DRAGGED_ELEMENT],
    status,
  };
  setLocalTasks(Object.values(boardState.CURRENT_TASKS));
  boardState.renderFilteredTasks?.();
}


/**
 * Updates a task's status in the Firebase database for the current user.
 * @param {string} status - The new status value.
 */
async function moveFirebaseTaskTo(status) {
  const uid = auth.currentUser.uid;
  const taskRef = ref(database, userTaskPath(uid, boardState.CURRENT_DRAGGED_ELEMENT));
  await update(taskRef, { status });
}


/**
 * Opens add-task via redirect on mobile or in a dialog on desktop.
 * @param {string} [status='todo'] - Initial status column value.
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
 * @param {string} status - The initial status for the new task.
 */
export async function loadAddTaskDialog(status) {
  boardState.currentStatus = status;
  const content = document.getElementById('taskDetailContent');
  const response = await fetch('add-task.html');
  content.innerHTML = `<div class="edit-mode-container">${await response.text()}</div>`;
  localStorage.removeItem('editTaskId');
  localStorage.removeItem('boardReturn');
  if (window.initAddTask) await window.initAddTask();
  boardState.currentStatus = status;
  const btn = content.querySelector('#createTaskBtn') || content.querySelector('.btn-dark');
  if (btn) btn.onclick = () => saveNewTaskFromBoard();
  document.getElementById('taskDetailDialog').showModal();
}


/**
 * Saves a new task created via the board dialog to Firebase or local storage.
 */
export async function saveNewTaskFromBoard() {
  const newTask = getTaskDataFromForm();
  if (isGuestUser()) {
    const tempId = Date.now();
    boardState.CURRENT_TASKS[tempId] = newTask;
    setLocalTasks(Object.values(boardState.CURRENT_TASKS));
  } else {
    const newTaskRef = push(ref(database, userTasksPath(auth.currentUser.uid)));
    await update(newTaskRef, newTask);
    boardState.CURRENT_TASKS[newTaskRef.key] = newTask;
  }
  closeTaskDetail();
  boardState.renderFilteredTasks?.();
}


/**
 * Collects and returns task data from the add-task form fields.
 * @returns {Object} The assembled task data object.
 */
function getTaskDataFromForm() {
  return {
    title: document.getElementById('taskTitle')?.value || '',
    description: document.getElementById('taskDescription')?.value || '',
    dueDate: document.getElementById('taskDate')?.value || '',
    priority: window.currentPriority || 'Medium',
    status: boardState.currentStatus,
    category: document.getElementById('selectedCategory')?.innerText || 'User Story',
    assignedTo: window.selectedContacts || [],
    subtasks: window.subtasks || [],
  };
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
  boardState.CURRENT_DRAGGED_ELEMENT = id;
  const mappedStatus = { inprogress: 'progress', awaiting: 'feedback' }[status] || status;
  await moveTo(mappedStatus);
  if (boardState.CURRENT_TASKS[id]) boardState.CURRENT_TASKS[id].status = mappedStatus;
  boardState.renderFilteredTasks?.();
  document.getElementById('moveMenu' + id)?.classList.remove('open');
};
