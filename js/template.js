function generateTaskHTML(task, id) {
  const categoryClass = task.category.replace(/\s+/g, '').toLowerCase();
  return `
    <div class="task-card" draggable="true" ondragstart="startDragging('${id}')" onclick="openTaskDetail('${id}')">
      <div class="task-category ${categoryClass}">${task.category}</div>
      <h3>${task.title}</h3>
      <p class="description-task-board">${task.description}</p>
    </div>`;
}

function getNoTaskPlaceholder(label) {
  return `<div class="no-tasks">No tasks ${label}</div>`;
}

function getPriorityButtonsHTML() {
  return `
    <button type="button" class="prio-btn" id="prioUrgent" onclick="setPriority('Urgent')">
      Urgent <img src="../assets/icons/prio-urgent-icon.svg">
    </button>
    <button type="button" class="prio-btn" id="prioMedium" onclick="setPriority('Medium')">
      Medium <img src="../assets/icons/prio-medium-icon.svg">
    </button>
    <button type="button" class="prio-btn" id="prioLow" onclick="setPriority('Low')">
      Low <img src="../assets/icons/prio-low-icon.svg">
    </button>`;
}

function getOptionHTML(value) {
  return `<option value="${value}">${value}</option>`;
}

function getSelectOptionsHTML(optionsArray, defaultText) {
  const defaultOption = `<option value="" disabled selected>${defaultText}</option>`;
  const allOptions = optionsArray.map((opt) => getOptionHTML(opt)).join('');
  return defaultOption + allOptions;
}

function getSubtaskHTML(task, index) {
  return `
    <li>
      ${task.title}
      <button type="button" onclick="deleteSubtask(${index})">
        <img src="../assets/icons/delete-icon.svg" alt="delete">
      </button>
    </li>`;
}

function generateTaskDetailHTML(task) {
  return `
        <div class="task-detail-content">
            <span class="category">${task.category}</span>
            <h1>${task.title}</h1>
            <p>${task.description}</p>
            <div class="due-date">Due date: ${task.dueDate}</div>
            <div class="priority">Priority: ${task.priority}</div>
            <!-- Hier kannst du später die Subtasks rendern -->
        </div>
    `;
}
