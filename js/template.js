function generateTaskHTML(task, id) {
  return `
    <div class="task-card" draggable="true" ondragstart="startDragging('${id}')">
      <div class="task-category">${task.category}</div>
      <h3>${task.title}</h3>
      <p>${task.description}</p>
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
