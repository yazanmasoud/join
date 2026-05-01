function openAddTask(status = 'todo') {
  // Optional: Speichern, in welche Spalte der Task soll
  localStorage.setItem('selectedStatus', status);
  window.location.href = 'add-task.html';
}

function initBoard() {
  database.ref('tasks').on('value', (snapshot) => {
    renderAllTasks(snapshot.val());
  });
}

function renderAllTasks(allTasks) {
  const cols = ['todo', 'progress', 'feedback', 'done'];
  cols.forEach((id) => (document.getElementById(id).innerHTML = ''));

  if (allTasks) {
    Object.entries(allTasks).forEach(([id, task]) => {
      const container = document.getElementById(task.status || 'todo');
      if (container) container.innerHTML += generateTaskHTML(task, id);
    });
  }
  cols.forEach((id) => {
    const el = document.getElementById(id);
    if (!el.hasChildNodes()) el.innerHTML = getNoTaskPlaceholder(id);
  });
}

function checkPlaceholder(id) {
  const col = document.getElementById(id);
  if (!col.querySelector('.task-card')) {
    col.innerHTML = getNoTaskPlaceholder(id);
  }
}

initBoard();
