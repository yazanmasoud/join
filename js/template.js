/**
 * @file Template management script handling board cards, task details, and editor HTML strings.
 */
import { contacts } from './contact.js';

/**
 * Generates the HTML structure for a board task card.
 * @param {Object} task - The task data object.
 * @param {number} id - The unique task array index ID.
 * @returns {string} The task card HTML string.
 */
export function generateTaskHTML(task, id) {
  const cat = task.category
    ? task.category.replace(/\s+/g, '').toLowerCase()
    : '';
  return `
    <div class="task-card" draggable="true" ondragstart="window.startDragging(${id})" onclick="window.openTaskDetail(${id})">
      <div class="task-category ${cat}">${task.category || ''}</div>
      <h3>${task.title || ''}</h3>
      <p class="description-task-board">${task.description || ''}</p>
      ${renderSmallSubtaskInfo(task)}
    </div>`;
}

/**
 * Renders a brief summary of subtask completion progress.
 * @param {Object} task - The task data object.
 * @returns {string} The subtask info HTML or an empty string.
 */
export function renderSmallSubtaskInfo(task) {
  if (!task.subtasks || task.subtasks.length === 0) return '';
  const done = task.subtasks.filter((s) => s.done).length;
  return `<small>${done}/${task.subtasks.length} Subtasks</small>`;
}

/**
 * Generates placeholder HTML for an empty board column.
 * @param {string} label - The text label of the empty column.
 * @returns {string} The placeholder element HTML string.
 */
export function getNoTaskPlaceholder(label) {
  return `<div class="no-tasks">No tasks ${label}</div>`;
}

/**
 * Generates HTML buttons for selecting task priority levels.
 * @returns {string} The combined priority buttons HTML string.
 */
export function getPriorityButtonsHTML() {
  return ['Urgent', 'Medium', 'Low']
    .map((p) => {
      const src =
        p === 'Medium'
          ? './assets/icons/medium-icon-orange.svg'
          : `../assets/icons/prio-${p.toLowerCase()}-icon.svg`;
      return `<button type="button" class="prio-btn" id="prio${p}" onclick="setPriority('${p}')">
      ${p} <img id="prio${p}Icon" src="${src}"></button>`;
    })
    .join('');
}

/**
 * Generates HTML option elements for a select dropdown menu.
 * @param {string[]} optionsArray - List of string options to display.
 * @param {string} defaultText - The disabled placeholder text option.
 * @returns {string} The complete dropdown options HTML string.
 */
export function getSelectOptionsHTML(optionsArray, defaultText) {
  const def = `<option value="" disabled selected>${defaultText}</option>`;
  const opts = optionsArray
    .map((opt) => `<option value="${opt}">${opt}</option>`)
    .join('');
  return def + opts;
}

/**
 * Generates a single subtask list element with a delete action button.
 * @param {Object} task - The subtask data object.
 * @param {number} index - The index array placement of the subtask.
 * @returns {string} The subtask list item HTML string.
 */
export function getSubtaskHTML(task, index) {
  return `<li>${task.title}<button type="button" onclick="deleteSubtask(${index})">
          <img src="../assets/icons/delete-icon.svg"></button></li>`;
}

/**
 * Generates the full HTML markup template for the task detail view dialog.
 * @param {Object} task - The task data object.
 * @param {string} id - The unique task ID.
 * @returns {string} The task detail layout HTML string.
 */
export function generateTaskDetailHTML(task, id) {
  const cat = task.category
    ? task.category.replace(/\s+/g, '').toLowerCase()
    : '';
  return `
    <div class="detail-view">
      <div class="detail-view-header"><span class="task-category ${cat}">${task.category || ''}</span>
        <div class="detail-view-close" onclick="closeTaskDetail()">×</div></div>
      <h3 class="detail-view-title">${task.title || ''}</h3>
      <p class="detail-view-description">${task.description || ''}</p>${getDetailInfoRows(task)}
      <div class="assigned-section"><span class="detail-view-label">Assigned To:</span>
        <div class="assigned-list-detail">${renderAssignedToDetail(task.assignedTo)}</div></div>
      <div class="subtasks-section"><span class="detail-view-label">Subtasks</span>
        <ul class="subtask-list-detail">${getDetailSubtasksHTML(task.subtasks, id)}</ul></div>
      ${getDetailFooter(id)}</div>`;
}

/**
 * Generates HTML table rows containing due date and priority badges.
 * @param {Object} task - The task data object.
 * @returns {string} The info rows HTML snippet.
 */
export function getDetailInfoRows(task) {
  const prio = task.priority ? task.priority.toLowerCase() : 'medium';
  return `<div class="detail-view-info-row"><span class="detail-view-label">Due date:</span> ${task.dueDate || ''}</div>
    <div class="detail-view-info-row"><span class="detail-view-label">Priority:</span> 
      <div class="detail-view-prio-badge">${task.priority || 'Medium'} <img src="../assets/icons/prio-${prio}-icon.svg"></div>
    </div>`;
}

/**
 * Generates subtask item checklist elements inside the detail modal.
 * @param {Object[]} subtasks - List of subtask data objects.
 * @param {string} taskId - The unique target task ID.
 * @returns {string} The list of subtask checkbox items HTML string.
 */
export function getDetailSubtasksHTML(subtasks, taskId) {
  if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0)
    return '<p>No subtasks</p>';
  return subtasks
    .map((st, i) => {
      const icon = st.done ? 'subtask-done-icon.svg' : 'check-empty.svg';
      return `<li class="subtask-item" onclick="toggleSubtask('${taskId}', ${i})">
        <img src="../assets/icons/${icon}" class="subtask-check-icon"><span class="subtask-text">${st.title}</span></li>`;
    })
    .join('');
}

/**
 * Generates the functional action buttons for editing and deleting tasks.
 * @param {string} id - The unique task ID.
 * @returns {string} The detail dialog footer menu HTML string.
 */
export function getDetailFooter(id) {
  return `<div class="detail-view-footer">
      <button class="action-btn" onclick="deleteTask('${id}')"><img src="../assets/icons/delete-icon.svg"> Delete</button>
      <div class="divider"></div>
      <button class="action-btn" onclick="editTask('${id}')"><img src="../assets/icons/edit-icon.svg"> Edit</button></div>`;
}

/**
 * Generates an assigned user element containing initials badges and names.
 * @param {Object} c - The concrete contact object context containing name and color.
 * @returns {string} The individual contact badge element HTML string.
 */
export function getAssignedUserHTML(c) {
  const color = c?.color || '#ff7a00';
  const initials =
    typeof window.getInitials === 'function'
      ? window.getInitials(c?.name || '')
      : '??';
  return `<div class="assigned-user">
      <div class="user-badge" style="background-color: ${color}">${initials}</div>
      <span class="user-name">${c?.name || 'Unknown'}</span></div>`;
}

/**
 * Iterates over contacts list parameters and generates detail row HTML output mapping IDs to names.
 * @param {number[]|string[]} assignedTo - Assigned identification collection array.
 * @returns {string} Consolidated contact list markup string.
 */
export function renderAssignedToDetail(assignedTo) {
  if (!assignedTo || assignedTo === 'Select contacts to assign') return '';
  const arr = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
  return arr
    .map((id) => {
      if (typeof id === 'string' && isNaN(Number(id)))
        return getAssignedUserHTML({ name: id, color: '#ff7a00' });
      const found = contacts.find((c) => Number(c.id) === Number(id));
      return getAssignedUserHTML(
        found || { name: 'Unknown', color: '#ff7a00' },
      );
    })
    .join('');
}

/**
 * Injects a big alphabetical grouping letter heading into the DOM container.
 * @param {HTMLElement} list - The DOM target list node wrapper.
 * @param {string} letter - The capitalized single string character.
 */
export function getContactLetter(list, letter) {
  list.innerHTML += `<div class="contact-letter-header">${letter}</div><hr class="contact-hr">`;
}

/**
 * Injects a single clickable contact row entry element snippet into the list.
 * KORREKTUR: Erzwingt kreisrunde Avatare direkt via Inline-CSS, um CSS-Konflikte zu umgehen.
 * @param {HTMLElement} list - The DOM target list node wrapper.
 * @param {Object} contact - The active user contact profile data container.
 * @param {number} index - Unique internal identification position index.
 */
export function getSingleContact(list, contact, index) {
  list.innerHTML += `
    <div class="contact-item" onclick="window.renderContactDetails(${index})">
      <div class="contact-avatar" style="background-color: ${contact.color}">
        ${contact.initials || '??'}
      </div>
      <div class="contact-information">
        <h4 class="contact-name">${contact.name || ''}</h4>
        <p class="contact-email">${contact.email || ''}</p>
      </div>
    </div>`;
}

/**
 * Generates the full HTML markup template component for a contact's profile detailed view workspace card.
 * @param {Object} contact - The targeted contact node record dataset.
 * @returns {string} Complete interactive details wrapper markup string.
 */
export function getContactDetails(contact) {
  return `
    <div class="contact-details-content">
      <div class="contact-details-header">
        <div class="contact-avatar contact-avatar-big" style="background-color: ${contact.color}">${contact.initials}</div>
        <div class="contact-details-header-info">
          <h3>${contact.name}</h3>
            <div class="contact-details-actions">
              <button class="btn edit-delete-btn">
                <img src="../assets/icons/edit-icon.svg" alt="">
                <p>Edit</p>
              </button>

              <button class="btn edit-delete-btn">
                <img src="../assets/icons/delete-icon.svg" alt="">
                <p>Delete</p>
              </button>
            </div>
        </div> 
      </div>

      <div class="contact-details-informations">
        <span>Contact Information</span>
        <span><b>Email:</b> <a class="contact-email" href="mailto:${contact.email}">${contact.email}</a></span>
        <span><b>Phone:</b> ${contact.phone || 'No phone number'}</span></div>
      </div>
    `;
}

/**
 * Generates the full interactive editor form structure for editing tasks.
 * @param {Object} task - The active task data object.
 * @param {number} id - The task index position.
 * @returns {string} The editor structure view form HTML string.
 */
export function generateEditTaskHTML(task, id) {
  return `
    <div class="edit-task-form">
      <input type="text" id="editTitle" class="edit-input" value="${task.title || ''}" placeholder="Title">
      <textarea id="editDescription" class="edit-textarea" placeholder="Description">${task.description || ''}</textarea>
      <input type="date" id="editDate" class="edit-input" value="${task.dueDate || ''}">
      <div class="edit-prio-row">${['Urgent', 'Medium', 'Low']
        .map(
          (p) => `
        <button type="button" class="prio-btn" id="editPrio${p}" onclick="window.setEditPriority('${p}')">${p}</button>
      `,
        )
        .join('')}</div>
      <button class="btn-dark save-edit-btn" onclick="window.saveEdit(${id})">Ok <img src="../assets/icons/check.svg"></button>
    </div>`;
}
