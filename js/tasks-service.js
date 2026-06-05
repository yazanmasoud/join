import { database, auth } from './firebase-config.js';
import { ref, get, set, update, push, remove, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { isGuestUser, getLocalTasks, setLocalTasks } from './storage.js';
import { normalizeObjectToArray } from './ui.js';
import { userTaskPath, userTasksPath } from './database-paths.js';

/**
 * Loads tasks from guest storage or the authenticated user's Firebase path.
 *
 * @returns {Promise<Array>} The available tasks.
 */
export async function getTasks() {
  if (isGuestUser()) return getLocalTasks();
  const uid = auth.currentUser.uid;
  const snapshot = await get(ref(database, userTasksPath(uid)));
  return snapshot.exists() ? normalizeObjectToArray(snapshot.val()) : [];
}


/**
 * Creates a task in guest storage or Firebase.
 *
 * @param {Object} taskData - The task values to create.
 * @returns {Promise<Object>} The created task including its ID.
 */
export async function createTask(taskData) {
  if (isGuestUser()) {
    const tasks = getLocalTasks();
    const newTask = { id: Date.now().toString(), ...taskData };
    tasks.push(newTask);
    setLocalTasks(tasks);
    return newTask;
  }
  const uid = auth.currentUser.uid;
  const newTaskRef = push(ref(database, userTasksPath(uid)));
  await set(newTaskRef, taskData);
  return { id: newTaskRef.key, ...taskData };
}


/**
 * Validates if the task has a title, date and category.
 */
export function isTaskValid(task) {
  const titleField = document.getElementById('taskTitle');
  const dateField = document.getElementById('taskDate');
  const catField = document.getElementById('taskCategory');

  const titleOk = !!(task.title && task.title.trim().length > 0);
  const dateOk = !!task.dueDate;
  const catOk = !!(task.category && !task.category.includes('Select'));

  // Visuelles Feedback (Klassen umschalten)
  toggleErrorState('taskTitle', !titleOk);
  toggleErrorState('taskDate', !dateOk);
  toggleErrorState('taskCategory', !catOk);
  const catTrigger = document.getElementById('categoryTrigger');
  if (catTrigger) catTrigger.classList.toggle('input-error', !catOk);

  return titleOk && dateOk && catOk;
}


/**
 * Toggles validation styling and message visibility for a task field.
 *
 * @param {string} id - The field element ID.
 * @param {boolean} isError - Whether the field is invalid.
 * @returns {void}
 */
export function toggleErrorState(id, isError) {
  const field = document.getElementById(id);
  if (field) field.classList.toggle('input-error', isError);
  const msg = document.getElementById(`error-${id}`);
  if (msg) msg.classList.toggle('d-none', !isError);
}


/**
 * Updates a task in guest storage or Firebase.
 *
 * @param {string} taskId - The task ID to update.
 * @param {Object} updatedData - The changed task values.
 * @returns {Promise<void>}
 */
export async function updateTask(taskId, updatedData) {
  if (isGuestUser()) {
    const tasks = getLocalTasks();
    const updatedTasks = tasks.map((task) =>
      String(task.id) === String(taskId) ? { ...task, ...updatedData, id: task.id } : task
    );
    setLocalTasks(updatedTasks);
    return;
  }
  const uid = auth.currentUser.uid;
  await update(ref(database, userTaskPath(uid, taskId)), updatedData);
}


/**
 * Deletes a task from guest storage or Firebase.
 *
 * @param {string} taskId - The task ID to delete.
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId) {
  if (isGuestUser()) {
    const tasks = getLocalTasks();
    const filteredTasks = tasks.filter((task) => String(task.id) !== String(taskId));
    setLocalTasks(filteredTasks);
    return;
  }
  const uid = auth.currentUser.uid;
  await remove(ref(database, userTaskPath(uid, taskId)));
}


/**
 * Subscribes to task changes and forwards the mapped task list.
 *
 * @param {Function} callback - Receives the current task array.
 * @returns {Function|void} Firebase unsubscribe function for authenticated users.
 */
export function listenToTasks(callback) {
  if (isGuestUser()) return callback(getLocalTasks());
  return onValue(ref(database, userTasksPath(auth.currentUser.uid)), (snapshot) => {
    if (!snapshot.exists()) return callback([]);
    const tasks = Object.entries(snapshot.val()).map(([id, task]) => ({
      id,
      ...task,
    }));
    callback(tasks);
  });
}
