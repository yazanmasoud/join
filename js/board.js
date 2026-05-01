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
  const columns = ['todo', 'progress', 'feedback', 'done'];
  columns.forEach((col) => {
    const el = document.getElementById(col);
    if (el) el.innerHTML = '';
  });

  if (allTasks) {
    Object.keys(allTasks).forEach((id) => {
      const task = allTasks[id];
      // FALLBACK: Wenn kein Status da ist, nimm 'todo'
      const status = task.status || 'todo';
      const container = document.getElementById(status);
      if (container) container.innerHTML += generateTaskHTML(task, id);
    });
  }
  columns.forEach((col) => checkPlaceholder(col));
}

function checkPlaceholder(id) {
  const col = document.getElementById(id);
  if (!col.querySelector('.task-card')) {
    col.innerHTML = getNoTaskPlaceholder(id);
  }
}

initBoard();
