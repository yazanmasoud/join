/**
 * @file Board management script handling task filtering, viewing, and state updates.
 */

/** @section GLOBAL VARIABLES */
let CURRENT_TASKS = {};
let CURRENT_DRAGGED_ELEMENT;
let editPriority;

/** @section CENTRAL PATH VARIABLE */
const GUEST_PATH = 'users/guest_user/tasks';

/** @section INITIALIZATION & RENDERING */

/**
 * Initializes the app and subscribes to Firebase data.
 */
function initBoard() {
  database.ref(GUEST_PATH).on('value', (snapshot) => {
    CURRENT_TASKS = snapshot.val() || {};
    renderAllTasks(CURRENT_TASKS);
  });
  setupDialogClose();
}

/**
 * Renders all tasks into their respective columns.
 * @param {Object} allTasks - The object containing all tasks.
 */
function renderAllTasks(allTasks) {
  const cols = ['todo', 'progress', 'feedback', 'done'];
  if (!document.getElementById(cols[0])) {
    return;
  }
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
 * Sets a placeholder if a column is empty.
 * @param {string} id - The column ID.
 */
function checkPlaceholder(id) {
  const el = document.getElementById(id);
  if (!el.hasChildNodes()) el.innerHTML = getNoTaskPlaceholder(id);
}

/** @section TASK DETAILS & DIALOG CONTROL */

/**
 * Opens the task detail dialog using Firebase data.
 * @param {string} id - The task ID.
 */
async function openTaskDetail(id) {
  const dialog = document.getElementById('taskDetailDialog');
  const content = document.getElementById('taskDetailContent');
  try {
    const snap = await database.ref(`${GUEST_PATH}/${id}`).once('value');
    const task = snap.val();
    if (task) {
      content.innerHTML = generateTaskDetailHTML(task, id);
      dialog.showModal();
    }
  } catch (error) {
    console.error('Fehler beim Öffnen des Tasks:', error);
  }
}

/**
 * Closes the task detail dialog.
 */
function closeTaskDetail() {
  const dialog = document.getElementById('taskDetailDialog');
  dialog.classList.remove('edit-mode-wide');
  dialog.close();
}

/**
 * Enables closing the dialog by clicking the overlay backdrop.
 */
function setupDialogClose() {
  const dialog = document.getElementById('taskDetailDialog');
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) closeTaskDetail();
  });
}

/**
 * Toggles subtask completion status and updates Firebase.
 * @param {string} taskId - The task ID.
 * @param {number} index - The subtask index.
 */
async function toggleSubtask(taskId, index) {
  const task = CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  await database.ref(`${GUEST_PATH}/${taskId}/subtasks/${index}`).update({
    done: task.subtasks[index].done,
  });
  document.getElementById('taskDetailContent').innerHTML =
    generateTaskDetailHTML(task, taskId);
}

/** @section DRAG & DROP */

/**
 * Stores the ID of the element being dragged.
 * @param {string} id - The element ID.
 */
function startDragging(id) {
  CURRENT_DRAGGED_ELEMENT = id;
}

/**
 * Allows dropping elements by preventing default browser behavior.
 * @param {Event} ev - The drag event.
 */
function allowDrop(ev) {
  ev.preventDefault();
}

/**
 * Visually highlights the dropzone column.
 * @param {string} id - The column ID.
 */
function highlight(id) {
  document.getElementById(id)?.classList.add('drag-area-highlight');
}

/**
 * Removes the visual highlight from a column.
 * @param {string} id - The column ID.
 */
function removeHighlight(id) {
  document.getElementById(id)?.classList.remove('drag-area-highlight');
}

/**
 * Moves a task to a new status column in Firebase.
 * @param {string} status - The new task status.
 */
async function moveTo(status) {
  removeHighlight(status);
  if (CURRENT_DRAGGED_ELEMENT) {
    await database
      .ref(`${GUEST_PATH}/${CURRENT_DRAGGED_ELEMENT}`)
      .update({ status });
  }
}

/** @section EDIT TASK (EDIT MODE) */

/**
 * Activates edit mode and loads task data into the dialog.
 * @param {string} id - The task ID.
 */
async function editTask(id) {
  const dialog = document.getElementById('taskDetailDialog');
  const task =
    CURRENT_TASKS[id] ||
    (await database.ref(`${GUEST_PATH}/${id}`).once('value')).val();
  if (task) {
    document.getElementById('taskDetailContent').innerHTML =
      generateEditTaskHTML(task, id);
    dialog.classList.add('edit-mode-wide');
    editPriority = task.priority;
  }
}

/**
 * Sets the edit priority level and updates the UI buttons.
 * @param {string} prio - The priority level (Urgent, Medium, Low).
 */
function setEditPriority(prio) {
  editPriority = prio;
  ['Urgent', 'Medium', 'Low'].forEach((p) => {
    const btn = document.getElementById('editPrio' + p);
    if (btn)
      btn.classList.remove('active-urgent', 'active-medium', 'active-low');
  });
  const activeBtn = document.getElementById('editPrio' + prio);
  if (activeBtn) activeBtn.classList.add('active-' + prio.toLowerCase());
}

/**
 * Saves edited task fields to Firebase.
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
  await database.ref(`${GUEST_PATH}/${id}`).update(updates);
  closeTaskDetail();
}

/** @section EDITING SUBTASKS */

/**
 * Handles the Enter key to trigger adding a new subtask.
 * @param {KeyboardEvent} event - The keyboard event.
 * @param {string} taskId - The task ID.
 */
function handleEditSubtaskKey(event, taskId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addEditSubtask(taskId);
  }
}

/**
 * Adds a new subtask to the list inside the editor.
 * @param {string} taskId - The task ID.
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
 * Deletes a subtask from the list within the editor.
 * @param {string} id - The task ID.
 * @param {number} index - The subtask index.
 */
async function deleteEditSubtask(id, index) {
  CURRENT_TASKS[id].subtasks.splice(index, 1);
  const content = document.getElementById('taskDetailContent');
  content.innerHTML = generateEditTaskHTML(CURRENT_TASKS[id], id);
}

/**
 * Toggles subtask completion status locally inside the editor.
 * @param {string} taskId - The task ID.
 * @param {number} index - The subtask index.
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
 * Deletes a task from Firebase.
 * @param {string} id - The task ID.
 */
async function deleteTask(id) {
  await database.ref(`${GUEST_PATH}/${id}`).remove();
  closeTaskDetail();
}

/**
 * Redirects the browser to the task creation page.
 * @param {string} [status='todo'] - The initial column status.
 */
function openAddTask(status = 'todo') {
  localStorage.setItem('selectedStatus', status);
  window.location.href = 'add-task.html';
}
