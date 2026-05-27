import { database, auth } from './firebase-config.js';
import {
  ref,
  get,
  set,
  update,
  push,
  remove,
  onValue,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { isGuestUser, getLocalTasks, setLocalTasks } from './storage.js';
import { normalizeObjectToArray } from './ui.js';

export async function getTasks() {
  if (isGuestUser()) return getLocalTasks();
  const uid = auth.currentUser.uid;
  const snapshot = await get(ref(database, `tasks/${uid}`));
  return snapshot.exists() ? normalizeObjectToArray(snapshot.val()) : [];
}

export async function createTask(taskData) {
  if (isGuestUser()) {
    const tasks = getLocalTasks();
    const newTask = { id: Date.now().toString(), ...taskData };
    tasks.push(newTask);
    setLocalTasks(tasks);
    return newTask;
  }
  const uid = auth.currentUser.uid;
  const newTaskRef = push(ref(database, `tasks/${uid}`));
  await set(newTaskRef, taskData);
  return { id: newTaskRef.key, ...taskData };
}

/**
 * Validates if the task has a title, date and category.
 */
export function isTaskValid(task) {
  const catSelect = document.getElementById('taskCategory');
  const hasTitle = task.title && task.title.trim().length > 0;
  const hasDate = !!task.dueDate;
  const hasCategory = catSelect && catSelect.selectedIndex !== 0;
  return !!(hasTitle && hasDate && hasCategory);
}

export async function getTaskById(taskId) {
  if (isGuestUser()) return getLocalTasks().find((t) => t.id === taskId);
  const snapshot = await get(
    ref(database, `tasks/${auth.currentUser.uid}/${taskId}`),
  );
  return snapshot.exists() ? { id: taskId, ...snapshot.val() } : null;
}

export async function updateTask(taskId, updatedData) {
  if (isGuestUser()) {
    const tasks = getLocalTasks();
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, ...updatedData } : task,
    );
    setLocalTasks(updatedTasks);
    return;
  }
  const uid = auth.currentUser.uid;
  await update(ref(database, `tasks/${uid}/${taskId}`), updatedData);
}

export async function deleteTask(taskId) {
  if (isGuestUser()) {
    const tasks = getLocalTasks();
    const filteredTasks = tasks.filter((task) => task.id !== taskId);
    setLocalTasks(filteredTasks);
    return;
  }
  const uid = auth.currentUser.uid;
  await remove(ref(database, `tasks/${uid}/${taskId}`));
}

export function listenToTasks(callback) {
  if (isGuestUser()) return callback(getLocalTasks());
  return onValue(ref(database, `tasks/${auth.currentUser.uid}`), (snapshot) => {
    if (!snapshot.exists()) return callback([]);
    const tasks = Object.entries(snapshot.val()).map(([id, task]) => ({
      id,
      ...task,
    }));
    callback(tasks);
  });
}
