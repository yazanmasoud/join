/** --- GLOBALE VARIABLEN --- */
let CURRENT_TASKS = {};
let CURRENT_DRAGGED_ELEMENT;

/** --- INITIALISIERUNG & RENDERING --- */
// Startet die App, abonniert Firebase-Daten und setzt Dialog-Events
function initBoard() {
  database.ref('tasks').on('value', (snapshot) => {
    CURRENT_TASKS = snapshot.val() || {};
    renderAllTasks(CURRENT_TASKS);
  });
  setupDialogClose();
}

// Leert die Spalten und zeichnet alle Tasks aus dem übergebenen Objekt neu
function renderAllTasks(allTasks) {
  const cols = ['todo', 'progress', 'feedback', 'done'];
  cols.forEach((id) => (document.getElementById(id).innerHTML = ''));
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

/** --- TASK DETAILS & DIALOG --- */
// Holt Task-Daten aus dem Speicher, füllt das Template und öffnet den Dialog
function openTaskDetail(id) {
  const dialog = document.getElementById('taskDetailDialog');
  document.getElementById('taskDetailContent').innerHTML =
    generateTaskDetailHTML(CURRENT_TASKS[id], id);
  dialog.showModal();
}

// Schließt das geöffnete Dialog-Fenster
function closeTaskDetail() {
  document.getElementById('taskDetailDialog').close();
}

// Ermöglicht das Schließen  Dialogs durch Klick auf  Hintergrund
function setupDialogClose() {
  document
    .getElementById('taskDetailDialog')
    ?.addEventListener('click', (e) => {
      if (e.target.id === 'taskDetailDialog') closeTaskDetail();
    });
}

/** --- DRAG & DROP --- */
// Speichert die ID des gewählten Elements beim Start  Ziehvorgangs
function startDragging(id) {
  CURRENT_DRAGGED_ELEMENT = id;
}

// Erlaubt Ablegen von Elementen in den Zielbereich
function allowDrop(ev) {
  ev.preventDefault();
}

// Fügt einer Spalte beim Drüberziehen eine visuelle Markierung hinzu
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
    await database.ref('tasks/' + CURRENT_DRAGGED_ELEMENT).update({ status });
  }
}

/** --- AKTIONEN --- */
// Löscht einen Task unwiderruflich aus der Firebase Datenbank
async function deleteTask(id) {
  await database.ref('tasks/' + id).remove();
  closeTaskDetail();
}

// Leitet zur Add-Task Seite weiter und merkt sich die Zielspalte
function openAddTask(status = 'todo') {
  localStorage.setItem('selectedStatus', status);
  window.location.href = 'add-task.html';
}

initBoard();

function editTask(id) {
  const task = CURRENT_TASKS[id];
  const content = document.getElementById('taskDetailContent');
  content.innerHTML = generateEditTaskHTML(task, id);

  // WICHTIG: Die Prio-Buttons aus deiner task.js Logik wiederverwenden
  renderEditPrioButtons(task.priority);
}

function renderEditPrioButtons(activePrio) {
  const container = document.getElementById('editPrioContainer');
  // Nutze hier deine bestehende getPriorityButtonsHTML() Funktion
  container.innerHTML = getPriorityButtonsHTML();
  setPriority(activePrio); // Die Funktion aus deiner task.js
}

async function saveEdit(id) {
  const updatedData = {
    title: document.getElementById('editTitle').value,
    description: document.getElementById('editDescription').value,
    dueDate: document.getElementById('editDate').value,
    priority: currentEditPriority, // Die Variable aus der setPriority Funktion
    assignedTo: document.getElementById('editAssigned').value,
    category: document.getElementById('editCategory').value,
  };
  // 3. Zu Firebase schicken
  await database.ref('tasks/' + id).update(updatedData);
  openTaskDetail(id); // Springt zurück zur Detailansicht
}

let currentEditPriority = ''; // Eine eigene Variable für den Edit-Modus

function setPriority(prio) {
  currentEditPriority = prio;
  const btns = document.querySelectorAll('.prio-btn');
  btns.forEach((b) =>
    b.classList.remove('active-urgent', 'active-medium', 'active-low'),
  );
  const active = document.getElementById('prio' + prio);
  if (active) active.classList.add('active-' + prio.toLowerCase());
}
