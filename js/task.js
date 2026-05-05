let subtasks = [];
let currentPriority = 'Medium';

// Initialisierung

// Bereitet die Seite beim Laden vor, indem sie Dropdowns füllt, Buttons rendert und die Standard-Priorität setzt.
function initAddTask() {
  renderPriorityButtons();
  renderCategories();
  renderContacts();
  setPriority(currentPriority);
}

// Logik (Firebase & Daten)

// Steuert den gesamten Speicherprozess, validiert die Daten und sendet das fertige Objekt an die Firebase-Datenbank.
async function createTask() {
  const task = getTaskObject();
  if (!validateTask(task)) return;

  const userId = getCurrentUserId(); // Holt sich 'guest_user' oder die echte ID
  try {
    // Speichert unter users/ID/tasks -> so findet die Summary es auch!
    await database.ref(`users/${userId}/tasks`).push(task);
    showSuccessToast();
    clearForm();
  } catch (e) {
    console.error('Fehler beim Speichern:', e);
  }
}

// Prüft, ob die erforderlichen Pflichtfelder wie Titel, Datum und Kategorie vom Nutzer ausgefüllt wurden.
function validateTask(task) {
  const catSelect = document.getElementById('taskCategory');
  return task.title && task.dueDate && catSelect.selectedIndex !== 0;
}

// Sammelt alle aktuellen Werte aus den Eingabefeldern und bündelt sie in einem strukturierten Task-Objekt.
function getTaskObject() {
  return {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    dueDate: document.getElementById('taskDate').value,
    category: document.getElementById('taskCategory').value,
    priority: currentPriority,
    assignedTo: document.getElementById('tasksAssigned').value,
    subtasks: subtasks,
    status: 'todo',
    createdAt: Date.now(),
  };
}

// UI & Rendering (Priority & Dropdowns)

// Aktualisiert die globale Prioritäts-Variable und passt die visuelle Markierung der Buttons im UI an.
function setPriority(prio) {
  currentPriority = prio;
  clearActivePrioClasses('.prio-btn');
  const active = document.getElementById('prio' + prio);
  if (active) active.classList.add(getPrioClass(prio));
}

// Erzeugt die HTML-Elemente für die Prioritäts-Buttons innerhalb des dafür vorgesehenen Containers.
function renderPriorityButtons() {
  const container = document.getElementById('prioContainer');
  if (container) container.innerHTML = getPriorityButtonsHTML();
}

// Befüllt das Kategorie-Auswahlmenü dynamisch mit den in den Konstanten definierten Optionen.
function renderCategories() {
  const select = document.getElementById('taskCategory');
  if (select)
    select.innerHTML = getSelectOptionsHTML(
      CATEGORY_OPTIONS,
      'Select task category',
    );
}

// Lädt die verfügbaren Kontakte in das dafür vorgesehene Auswahlfeld der Benutzeroberfläche.
function renderContacts() {
  const select = document.getElementById('tasksAssigned');
  if (select)
    select.innerHTML = getSelectOptionsHTML(
      CONTACT_OPTIONS,
      'Select contacts to assign',
    );
}

// Subtask Logik

// Erfasst den Tastendruck im Subtask-Feld und fügt bei "Enter" einen neuen Subtask zum Array hinzu.
function handleSubtaskKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    let input = document.getElementById('subtasks');
    let title = input.value.trim();
    if (title.length > 0) {
      subtasks.push({ title: title, done: false });
      input.value = '';
      renderSubtasks();
    }
  }
}

// Aktualisiert die Liste der angezeigten Subtasks auf der Seite basierend auf dem aktuellen Datenstand.
function renderSubtasks() {
  let list = document.getElementById('subtasksList');
  if (!list) return;
  list.innerHTML = '';
  subtasks.forEach((task, index) => {
    list.innerHTML += getSubtaskHTML(task, index);
  });
}

// Entfernt einen spezifischen Subtask aus dem Array und stößt die Aktualisierung der Anzeige an.
function deleteSubtask(index) {
  subtasks.splice(index, 1);
  renderSubtasks();
}

// Helper Funktionen

// Setzt alle Eingabefelder, das Subtask-Array und die Priorität auf ihre ursprünglichen Standardwerte zurück.
function clearForm() {
  ['taskTitle', 'taskDescription', 'taskDate', 'subtasks'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  subtasks = [];
  renderSubtasks();
  document.getElementById('taskCategory').selectedIndex = 0;
  document.getElementById('tasksAssigned').selectedIndex = 0;
  setPriority('Medium');
}

// Blendet kurzzeitig eine Erfolgsmeldung ein, um dem Nutzer den erfolgreichen Speichervorgang zu bestätigen.
function showSuccessToast() {
  const toast = document.getElementById('successMessage');
  if (toast) {
    toast.classList.remove('d-none');
    setTimeout(() => toast.classList.add('d-none'), 2000);
  }
}
