async function createTask() {
  const newTask = {
    title: document.getElementById('taskTitle').value,
    prio: currentPriority,
  };

  try {
    await database.ref('tasks').push(newTask);
    // Hier könntest du stattdessen eine Erfolgsmeldung im UI anzeigen (z.B. Task Added Banner)
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
  }
}

let currentPriority = 'Medium';

function setPriority(prio) {
  currentPriority = prio;
  const buttons = document.querySelectorAll('.priority-btn-content button');

  buttons.forEach((btn) => {
    btn.classList.remove('active-urgent', 'active-medium', 'active-low');
  });

  const activeBtn = document.getElementById('prio' + prio);
  activeBtn.classList.add('active-' + prio.toLowerCase());
}

function renderPriorityButtons() {
  const container = document.getElementById('prioContainer');
  if (container) {
    container.innerHTML = getPriorityButtonsHTML();
  }
}

// WICHTIG: Die Funktion sofort ausführen, wenn die Datei geladen wird
renderPriorityButtons();
