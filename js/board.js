/** --- GLOBALE VARIABLEN --- */
let CURRENT_TASKS = {};
let CURRENT_DRAGGED_ELEMENT;
let editPriority;

// ZENTRALE PFAD-VARIABLE (Muss exakt wie in addTask/summary sein)
const GUEST_PATH = 'users/guest_user/tasks';

/** --- INITIALISIERUNG & RENDERING --- */

// Startet die App, abonniert Firebase-Daten und setzt Dialog-Events
function initBoard() {
  // Pfad angepasst: von 'tasks' auf GUEST_PATH
  database.ref(GUEST_PATH).on('value', (snapshot) => {
    CURRENT_TASKS = snapshot.val() || {};
    renderAllTasks(CURRENT_TASKS);
  });
  setupDialogClose();
}

// Leert die Spalten und zeichnet alle Tasks aus dem übergebenen Objekt neu
function renderAllTasks(allTasks) {
  const cols = ['todo', 'progress', 'feedback', 'done'];
  const firstCol = document.getElementById(cols[0]);

  // PRÜFUNG: Wenn die erste Spalte nicht existiert, sind wir nicht auf der Board-Seite
  if (!firstCol) {
    console.warn('Board-Spalten noch nicht im DOM gefunden.');
    return; // Bricht ab, wenn das HTML noch nicht da ist
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

// Prüft, ob eine Spalte leer ist und fügt ggf. den "No Tasks"-Platzhalter ein
function checkPlaceholder(id) {
  const el = document.getElementById(id);
  if (!el.hasChildNodes()) el.innerHTML = getNoTaskPlaceholder(id);
}

/** --- TASK DETAILS & DIALOG-STEUERUNG --- */

// Holt Task-Daten aus Firebase, füllt das Template und öffnet den Dialog
async function openTaskDetail(id) {
  const dialog = document.getElementById('taskDetailDialog');
  const content = document.getElementById('taskDetailContent');
  try {
    // Pfad angepasst
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

// Schließt das geöffnete Dialog-Fenster und entfernt den Bearbeitungs-Modus
function closeTaskDetail() {
  const dialog = document.getElementById('taskDetailDialog');
  dialog.classList.remove('edit-mode-wide');
  dialog.close();
}

// Ermöglicht das Schließen des Dialogs durch Klick auf den Hintergrund (Overlay)
function setupDialogClose() {
  const dialog = document.getElementById('taskDetailDialog');
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) closeTaskDetail();
  });
}

// Ändert den Erledigungsstatus eines Subtasks in der Detailansicht und in Firebase
async function toggleSubtask(taskId, index) {
  const task = CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  // Pfad angepasst
  await database.ref(`${GUEST_PATH}/${taskId}/subtasks/${index}`).update({
    done: task.subtasks[index].done,
  });
  document.getElementById('taskDetailContent').innerHTML =
    generateTaskDetailHTML(task, taskId);
}

/** --- DRAG & DROP --- */

// Speichert die ID des gewählten Elements beim Start des Ziehvorgangs
function startDragging(id) {
  CURRENT_DRAGGED_ELEMENT = id;
}

// Erlaubt das Ablegen von Elementen durch Verhindern des Standard-Browserverhaltens
function allowDrop(ev) {
  ev.preventDefault();
}

// Fügt einer Spalte beim Drüberziehen eine visuelle Markierung (Highlight) hinzu
function highlight(id) {
  document.getElementById(id)?.classList.add('drag-area-highlight');
}

// Entfernt die visuelle Markierung einer Spalte wieder
function removeHighlight(id) {
  document.getElementById(id)?.classList.remove('drag-area-highlight');
}

// Ändert den Status des gezogenen Tasks in Firebase und beendet das Highlighting
async function moveTo(status) {
  removeHighlight(status);
  if (CURRENT_DRAGGED_ELEMENT) {
    // Pfad angepasst
    await database
      .ref(`${GUEST_PATH}/${CURRENT_DRAGGED_ELEMENT}`)
      .update({ status });
  }
}

/** --- TASK BEARBEITEN (EDIT MODE) --- */

// Wechselt die Dialogansicht in den Editiermodus und lädt die aktuellen Task-Daten
async function editTask(id) {
  const dialog = document.getElementById('taskDetailDialog');
  // Pfad angepasst
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

// Speichert die im Editiermodus gewählte Priorität und aktualisiert die Button-Vorschau
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

// Übernimmt alle Änderungen aus dem Formular und aktualisiert den Task in Firebase
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
  // Pfad angepasst
  await database.ref(`${GUEST_PATH}/${id}`).update(updates);
  closeTaskDetail();
}

/** --- EDITIER-SUBTASKS --- */

// Prüft, ob im Subtask-Eingabefeld Enter gedrückt wurde, um einen neuen Subtask hinzuzufügen
function handleEditSubtaskKey(event, taskId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addEditSubtask(taskId);
  }
}

// Fügt einen neuen Subtask zur Liste im Bearbeitungsmodus hinzu und aktualisiert die Anzeige
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

// Entfernt einen Subtask aus der Liste während des Bearbeitungsvorgangs
async function deleteEditSubtask(id, index) {
  CURRENT_TASKS[id].subtasks.splice(index, 1);
  const content = document.getElementById('taskDetailContent');
  content.innerHTML = generateEditTaskHTML(CURRENT_TASKS[id], id);
}

// Schaltet den Status eines Subtasks innerhalb der Bearbeitungs-Ansicht um
function toggleEditSubtask(taskId, index) {
  const task = CURRENT_TASKS[taskId];
  task.subtasks[index].done = !task.subtasks[index].done;
  document.getElementById('taskDetailContent').innerHTML = generateEditTaskHTML(
    task,
    taskId,
  );
}

/** --- SONSTIGE AKTIONEN --- */

// Löscht einen Task unwiderruflich aus der Firebase-Datenbank
async function deleteTask(id) {
  // Pfad angepasst
  await database.ref(`${GUEST_PATH}/${id}`).remove();
  closeTaskDetail();
}

// Speichert die gewünschte Zielspalte im lokalen Speicher und wechselt zum Add-Task Formular
function openAddTask(status = 'todo') {
  localStorage.setItem('selectedStatus', status);
  window.location.href = 'add-task.html';
}
