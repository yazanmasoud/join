/**  BOARD TASK CARDS*/
/**  BOARD TASK CARDS*/
function generateTaskHTML(task, id) {
  const catClass = task.category.replace(/\s+/g, '').toLowerCase();
  return `
    <div class="task-card" draggable="true" ondragstart="startDragging('${id}')" 
         onclick="openTaskDetail('${id}')">
      <div class="task-category ${catClass}">${task.category}</div>
      <h3>${task.title}</h3>
      <p class="description-task-board">${task.description}</p>
      ${renderSmallSubtaskInfo(task)}
      <div class="task-card-footer">
        <div class="contact-badges-container">
          ${renderCardBadgeArea(task.assignedTo)}
        </div>
        <img class="prio-icon-small" src="../assets/icons/prio-${task.priority.toLowerCase()}-icon.svg" alt="${task.priority}">
      </div>
    </div>`;
}
// Erstellt die farbigen Kreise für die Initialen auf der Card
function renderCardBadgeArea(assignedTo) {
  if (!assignedTo || assignedTo === 'Select contacts to assign') return '';
  const contactsArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

  return contactsArray
    .map((name) => {
      const initials = getInitials(name);
      const color = getRandomColor(); // Falls du feste Farben pro Name hast, nutze deine Logik hier
      return `<div class="user-badge-card" style="background-color: ${color}">${initials}</div>`;
    })
    .join('');
}

function renderSmallSubtaskInfo(task) {
  if (!task.subtasks || task.subtasks.length === 0) return '';

  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.done).length;

  // Berechnung der Prozentzahl für den blauen Balken
  const progressPercent = (done / total) * 100;

  return `
    <div class="task-card-progress-container">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
      </div>
      <span class="subtask-count">${done}/${total} Subtasks</span>
    </div>`;
}

function getNoTaskPlaceholder(label) {
  return `<div class="no-tasks">No tasks ${label}</div>`;
}

/**  ADD TASK TEMPLATES */
function getPriorityButtonsHTML() {
  return ['Urgent', 'Medium', 'Low']
    .map(
      (p) => `
    <button type="button" class="prio-btn" id="prio${p}" onclick="setPriority('${p}')">
      ${p} <img src="../assets/icons/prio-${p.toLowerCase()}-icon.svg">
    </button>`,
    )
    .join('');
}

function getSelectOptionsHTML(optionsArray, defaultText) {
  const def = `<option value="" disabled selected>${defaultText}</option>`;
  const opts = optionsArray
    .map((opt) => `<option value="${opt}">${opt}</option>`)
    .join('');
  return def + opts;
}

function getSubtaskHTML(task, index) {
  return `<li>${task.title}<button type="button" onclick="deleteSubtask(${index})">
          <img src="../assets/icons/delete-icon.svg"></button></li>`;
}

/** TASK DETAIL DIALOG */
function generateTaskDetailHTML(task, id) {
  const catClass = task.category.replace(/\s+/g, '').toLowerCase();
  return `
    <div class="detail-view">
      <div class="detail-view-header">
        <span class="task-category ${catClass}">${task.category}</span>
        <div class="detail-view-close" onclick="closeTaskDetail()">×</div></div>
      <h3 class="detail-view-title">${task.title}</h3>
      <p class="detail-view-description">${task.description}</p>
      ${getDetailInfoRows(task)}
      <div class="assigned-section"><span class="detail-view-label">Assigned To:</span>
        <div class="assigned-list-detail">${renderAssignedToDetail(task.assignedTo)}</div></div>
      <div class="subtasks-section"><span class="detail-view-label">Subtasks</span>
        <ul class="subtask-list-detail">${getDetailSubtasksHTML(task.subtasks, id)}</ul></div>
      ${getDetailFooter(id)}</div>`;
}

function getDetailInfoRows(task) {
  return `<div class="detail-view-info-row">
      <span class="detail-view-label">Due date:</span> ${task.dueDate}</div>
    <div class="detail-view-info-row">
      <span class="detail-view-label">Priority:</span> 
      <div class="detail-view-prio-badge">${task.priority} 
        <img src="../assets/icons/prio-${task.priority.toLowerCase()}-icon.svg"></div>
    </div>`;
}

function getDetailSubtasksHTML(subtasks, taskId) {
  if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0)
    return '<p>No subtasks</p>';
  return subtasks
    .map((st, i) => {
      const icon = st.done ? 'subtask-done-icon.svg' : 'check-empty.svg';
      return `
      <li class="subtask-item" onclick="toggleSubtask('${taskId}', ${i})">
        <img src="../assets/icons/${icon}" class="subtask-check-icon">
        <span class="subtask-text">${st.title}</span>
      </li>`;
    })
    .join('');
}

function getDetailFooter(id) {
  return `<div class="detail-view-footer">
      <button class="action-btn" onclick="deleteTask('${id}')">
        <img src="../assets/icons/delete-icon.svg"> Delete</button>
      <div class="divider"></div>
      <button class="action-btn" onclick="editTask('${id}')">
        <img src="../assets/icons/edit-icon.svg"> Edit</button></div>`;
}

/** ASSIGNED USERS  */
function getAssignedUserHTML(name) {
  const color = getContactColor(name);
  const initials = getInitials(name);
  return `<div class="assigned-user">
      <div class="user-badge" style="background-color: ${color}">${initials}</div>
      <span class="user-name">${name}</span></div>`;
}

function renderAssignedToDetail(assignedTo) {
  if (!assignedTo || assignedTo === 'Select contacts to assign') return '';
  const contacts = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
  return contacts.map((name) => getAssignedUserHTML(name)).join('');
}

/**  EDIT MODE  */
function generateEditTaskHTML(task, id) {
  return `
    <div class="edit-mode-main">
      <div class="edit-content-wrapper">
        ${getEditLeftSection(task)}
        <div class="edit-vertical-divider"></div>
        ${getEditRightSection(task, id)}
      </div>
      <div class="edit-footer-action">
        <button class="btn-primary" onclick="saveEdit('${id}')">Ok 🗸</button>
      </div>
    </div>`;
}

function getEditLeftSection(task) {
  return `
    <div class="edit-section">
      <div class="input-group"><label>Title<span class="required">*</span></label>
        <input type="text" id="editTitle" value="${task.title}"></div>
      <div class="input-group"><label>Description</label>
        <textarea id="editDescription">${task.description}</textarea></div>
      <div class="input-group"><label>Due date<span class="required">*</span></label>
        <div class="input-wrapper">
          <input type="date" id="editDate" value="${task.dueDate}">
          <button type="button" onclick="document.getElementById('editDate').showPicker()">
            <img src="../assets/icons/date-icon.svg" alt="Kalender"></button></div></div>
    </div>`;
}

function getEditRightSection(task, id) {
  return `
    <div class="edit-section">
      <div class="input-group"><label>Priority</label>
        <div class="priority-btn-content">${getEditPrioBtns(task.priority)}</div></div>
      <div class="input-group"><label>Assigned to</label>
        <select id="editAssigned">${getSelectOptionsHTML(CONTACT_OPTIONS, task.assignedTo)}</select></div>
      <div class="input-group"><label>Subtasks</label>
        <input type="text" id="editSubtaskInput" placeholder="Add new subtask" 
               onkeydown="handleEditSubtaskKey(event, '${id}')">
        <ul id="editSubtasksList" class="subtasks-list-edit">${getEditSubtasksList(task.subtasks, id)}</ul></div>
    </div>`;
}

function getEditSubtasksList(subtasks, id) {
  if (!subtasks || subtasks.length === 0) return '';
  return subtasks
    .map(
      (st, i) => `
    <li class="subtask-item-edit">
      <div class="subtask-left" onclick="toggleEditSubtask('${id}', ${i})">
        <img src="../assets/icons/${st.done ? 'subtask-done-icon.svg' : 'check-empty.svg'}" 
             class="subtask-check-icon">
        <span>${st.title}</span>
      </div>
      <button onclick="deleteEditSubtask('${id}', ${i})">
        <img src="../assets/icons/delete-icon.svg">
      </button>
    </li>`,
    )
    .join('');
}

function getEditPrioBtns(current) {
  const prios = ['Urgent', 'Medium', 'Low'];
  return prios
    .map((p) => {
      const active = current === p ? `active-${p.toLowerCase()}` : '';
      let iconName = `prio-${p.toLowerCase()}-icon`;
      if (p === 'Medium') iconName = 'medium-icon-orange';

      return `
      <button type="button" id="editPrio${p}" onclick="setEditPriority('${p}')" 
              class="prio-btn prio-btn-${p.toLowerCase()} ${active}">
        ${p} <img src="../assets/icons/${iconName}.svg">
      </button>`;
    })
    .join('');
}

function getEditFooterButton(id) {
  return `
    <button class="btn-primary" onclick="saveEdit('${id}')">
      Ok <img src="../assets/icons/check.svg">
    </button>`;
}
