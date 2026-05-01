function generateTaskHTML(task, id) {
  const categoryClass = task.category.replace(/\s+/g, '').toLowerCase();
  return `
    <div class="task-card" draggable="true" ondragstart="startDragging('${id}')" onclick="openTaskDetail('${id}')">
      <div class="task-category ${categoryClass}">${task.category}</div>
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

// 1. Die Hauptfunktion für die Details
function generateTaskDetailHTML(task, id) {
  const p = task.priority.toLowerCase();
  const icon = p === 'medium' ? 'medium-icon-orange' : `prio-${p}-icon`;
  return `
    <div class="detail-view">
      ${getDetailHeaderHTML(task)}
      <h1 class="detail-view-title">${task.title}</h1>
      <p class="detail-view-description">${task.description}</p>
      <div class="detail-view-info-row"><span>Due date:</span> ${task.dueDate}</div>
      <div class="detail-view-info-row"><span>Priority:</span>
        <div class="detail-view-prio-badge"><span>${task.priority}</span>
        <img src="../assets/icons/${icon}.svg"></div></div>
      ${getDetailFooterHTML(id)} 
    </div>`;
}

function getDetailHeaderHTML(task) {
  const catClass = task.category.replace(/\s+/g, '').toLowerCase();
  return `
    <div class="detail-view-header">
      <div class="task-category ${catClass}">${task.category}</div>
      <img src="../assets/icons/cancle-icon.svg" onclick="closeTaskDetail()">
    </div>`;
}

function getDetailFooterHTML(id) {
  return `
    <div class="detail-view-footer">
      <button class="action-btn" onclick="deleteTask('${id}')">
        <img src="../assets/icons/delete-icon.svg"> Delete
      </button>
      <div class="divider"></div>
      <button class="action-btn" onclick="editTask('${id}')">
        <img src="../assets/icons/edit-icon.svg"> Edit
      </button>
    </div>`;
}

function getEditFooterHTML(id) {
  return `
    <div class="form-bottom" style="justify-content: flex-end;">
      <div class="form-actions">
        <button type="submit" class="btn-primary" onclick="saveEdit('${id}')">
          Ok <img src="../assets/icons/check-icon.svg" alt="save">
        </button>
      </div>
    </div>`;
}

function generateEditTaskHTML(task, id) {
  return `
    <form class="add-task edit-mode" onsubmit="saveEdit('${id}'); return false;">
      <div class="add-section-left">
        ${getEditLeftHTML(task)}
      </div>
      <div class="vertical-divider"></div>
      <div class="add-section-left">
        ${getEditRightHTML(task)}
      </div>
      <div class="form-bottom">
        <button type="submit" class="btn-primary">Create Task<img src="../assets/icons/create-task.svg"></button>
      </div>
    </form>`;
}

function getEditLeftHTML(task) {
  return `
    <div class="input-group">
      <label>Title</label>
      <input type="text" id="editTitle" value="${task.title}">
    </div>
    <div class="input-group">
      <label>Description</label>
      <textarea id="editDescription">${task.description}</textarea>
    </div>
    <div class="input-group">
      <label>Due date</label>
      <input type="date" id="editDate" value="${task.dueDate}">
    </div>`;
}

function getEditRightHTML(task) {
  return `
    <div class="input-group">
      <label>Priority</label>
      <div class="priority-btn-content" id="editPrioContainer">
        <!-- Hier werden die Prio-Buttons gerendert -->
      </div>
    </div>
    <div class="input-group">
      <label>Assigned to</label>
      <select id="editAssigned">${getOptionHTML(task.assignedTo)}</select>
    </div>
    <div class="input-group">
      <label>Category</label>
      <select id="editCategory">${getOptionHTML(task.category)}</select>
    </div>`;
}
