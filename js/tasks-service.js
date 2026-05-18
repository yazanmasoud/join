import { auth, database } from './firebase-config.js';

import {
  ref,
  get,
  set,
  update,
  push,
  remove,
  onValue,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

import { isGuestUser, generateLocalId } from './utils.js';

import {
  getGuestTasks,
  saveGuestTasks,
} from './guest-storage.js';

export async function getTasks() {
  if (isGuestUser()) {
    return getGuestTasks();
  }

  const uid = auth.currentUser.uid;
  const snapshot = await get(ref(database, `tasks/${uid}`));

  if (!snapshot.exists()) return [];

  return Object.entries(snapshot.val()).map(([id, task]) => ({
    id,
    ...task,
  }));
}

export async function createTask(taskData) {
  if (isGuestUser()) {
    const tasks = getGuestTasks();

    const newTask = {
      id: generateLocalId(tasks),
      ...taskData,
    };

    tasks.push(newTask);
    saveGuestTasks(tasks);

    return newTask;
  }

  const uid = auth.currentUser.uid;
  const newTaskRef = push(ref(database, `tasks/${uid}`));

  await set(newTaskRef, taskData);

  return {
    id: newTaskRef.key,
    ...taskData,
  };
}

export async function getTaskById(taskId) {
  if (isGuestUser()) {
    const tasks = getGuestTasks();
    return tasks.find(task => String(task.id) === String(taskId));
  }

  const uid = auth.currentUser.uid;
  const snapshot = await get(ref(database, `tasks/${uid}/${taskId}`));

  if (!snapshot.exists()) return null;

  return {
    id: taskId,
    ...snapshot.val(),
  };
}

export async function updateTask(taskId, updatedData) {
  if (isGuestUser()) {
    const tasks = getGuestTasks();

    const updatedTasks = tasks.map(task =>
      String(task.id) === String(taskId)
        ? { ...task, ...updatedData }
        : task
    );

    saveGuestTasks(updatedTasks);
    return;
  }

  const uid = auth.currentUser.uid;

  await update(ref(database, `tasks/${uid}/${taskId}`), updatedData);
}

export async function deleteTask(taskId) {
  if (isGuestUser()) {
    const tasks = getGuestTasks();

    const filteredTasks = tasks.filter(
      task => String(task.id) !== String(taskId)
    );

    saveGuestTasks(filteredTasks);
    return;
  }

  const uid = auth.currentUser.uid;

  await remove(ref(database, `tasks/${uid}/${taskId}`));
}

export function listenToTasks(callback) {
  if (isGuestUser()) {
    callback(getGuestTasks());
    return;
  }

  const uid = auth.currentUser.uid;

  return onValue(ref(database, `tasks/${uid}`), snapshot => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const tasksArray = Object.entries(snapshot.val()).map(([id, task]) => ({
      id,
      ...task,
    }));

    callback(tasksArray);
  });
}