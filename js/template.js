import { contacts } from './contacts.js';

window.generateTaskHTML = generateTaskHTML;
window.getNoTaskPlaceholder = getNoTaskPlaceholder;
window.generateTaskDetailHTML = generateTaskDetailHTML;
window.generateEditTaskHTML = generateEditTaskHTML;
window.getContactDetails = getContactDetails;
window.openEditContact = openEditContact;
window.getPriorityButtonsHTML = getPriorityButtonsHTML;
window.setPriority = setPriority;
window.getSingleDetailSubtaskHTML = getSingleDetailSubtaskHTML;

/** --- BOARD TASK CARDS --- */

/**
 * Generates the HTML structure for a board task card.
 * @param {Object} task - The task data object.
 * @param {string} id - The unique task ID.
 * @returns {string} The task card HTML string.
 */
export function generateTaskHTML(task, id) {
  const cat = (task.category || '').replace(/\s+/g, '').toLowerCase();
  const prio = (task.priority || 'Medium').toLowerCase();
  const icon = prio === 'medium' ? 'medium-icon-orange.svg' : `prio-${prio}-icon.svg`;
  const isDesktop = window.innerWidth > 800;
  return `
    <div class="task-card" draggable="true" ondragstart="startDragging('${id}')" onclick="openTaskDetail('${id}')">
    <div class="task-card-header-mobile">
      <div class="task-category ${cat}">${task.category || ''}</div>
      <div class="mobile-move-container">
      <button class="move-mobile-btn" onclick="toggleMoveMenu(event, '${id}')"><img src="../assets/icons/arrow-drop-down.svg" alt="Move"></button>
      <div id="moveMenu${id}" class="avatar-dropdown mobile-move-menu" onclick="event.stopPropagation()">
      <p onclick="moveTaskMobile('${id}', 'todo')">To Do</p>
      <p onclick="moveTaskMobile('${id}', 'progress')">In Progress</p>
      <p onclick="moveTaskMobile('${id}', 'feedback')">Awaiting Feedback</p>
      <p onclick="moveTaskMobile('${id}', 'done')">Done</p>
      </div>
      </div>
      </div>
      ${renderTaskBody(task)}
      <div class="task-card-footer">
        <div class="assignee-list">${renderAssignedToDetail(task.assignedTo, false)}</div>
        <img src="../assets/icons/${icon}" class="prio-icon-small">
      </div>
    </div>`;
}

function renderTaskBody(t) {
  return `
    <div class="task-card-content">
      <h3>${t.title || ''}</h3>
      <p class="description-task-board">${t.description || ''}</p>
    </div>
    ${renderSmallSubtaskInfo(t)}`;
}

/**
 * Renders a progress bar and subtask completion text.
 * @param {Object} task - The task data object.
 * @returns {string} The progress bar and text HTML string.
 */
export function renderSmallSubtaskInfo(task) {
  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  if (subtasks.length === 0) return ''; // Zeigt gar nichts an, wenn keine Subtasks da sind

  const done = subtasks.filter((s) => s.done).length;
  const percent = (done / subtasks.length) * 100;

  return `
    <div class="subtask-progress-container">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${percent}%"></div>
      </div>
      <span>${done}/${subtasks.length} Subtasks</span> 
    </div>`; // "Subtasks" Text sorgt dafür, dass keine leeren Punkte stehen
}

/**
 * Generates placeholder HTML for an empty board column.
 * @param {string} label - The text label of the empty column.
 * @returns {string} The placeholder element HTML string.
 */
export function getNoTaskPlaceholder(label) {
  return `<div class="no-tasks">No tasks ${label}</div>`;
}

/** --- ADD TASK TEMPLATES --- */
/**
 * Generates HTML buttons for selecting task priority levels.
 */
export function getPriorityButtonsHTML(selectedPrio) {
  return ['Urgent', 'Medium', 'Low']
    .map((p) => {
      const isSel = p === selectedPrio,
        low = p.toLowerCase();
      const icon = p === 'Medium' ? `medium-icon-orange.svg` : `prio-${low}-icon.svg`;
      return `
      <button type="button" class="prio-btn ${isSel ? 'active-' + low : ''}" 
              id="prio${p}" onclick="setPriority('${p}')">
        ${p} <img src="../assets/icons/${icon}" class="prio-icon" alt="${p}">
      </button>`;
    })
    .join('');
}

function setPriority(prio) {
  currentPriority = currentPriority === prio ? '' : prio;

  const container = document.getElementById('prioContainer');
  if (container) {
    container.innerHTML = getPriorityButtonsHTML(currentPriority);
  }
}

/**
 * Generates HTML option elements for a select dropdown menu.
 * @param {string[]} optionsArray - List of string options to display.
 * @param {string} defaultText - The disabled placeholder text option.
 * @returns {string} The complete dropdown options HTML string.
 */
export function getSelectOptionsHTML(optionsArray, defaultText) {
  const def = `<option value="" disabled selected>${defaultText}</option>`;
  const opts = optionsArray.map((opt) => `<option value="${opt}">${opt}</option>`).join('');
  return def + opts;
}

/**
 * Generates a single subtask list element with a delete action button.
 */
export function getSubtaskHTML(task, index) {
  const icon = task.done ? 'subtask-done-icon.svg' : 'check-empty.svg';
  return `
    <li class="subtask-edit-item" id="subtaskItem${index}" ondblclick="editSubtask(${index})">
      <div class="subtask-left" onclick="toggleSubtaskStatus(${index})">
        <img src="../assets/icons/${icon}" class="subtask-check-icon">
        <span class="subtask-text">${task.title}</span>
      </div>
      <div class="subtask-actions">
        <button type="button" class="subtask-action-btn" onclick="editSubtask(${index})">
          <img src="../assets/icons/edit-icon.svg" alt="edit">
        </button>
        <div class="subtask-divider"></div>
        <button type="button" class="subtask-action-btn" onclick="deleteSubtask(${index})">
          <img src="../assets/icons/delete-icon.svg" alt="delete">
        </button>
      </div>
    </li>`;
}

export function getSubtaskEditHTML(title, index, isEditMode = false, taskId = '') {
  const saveFn = isEditMode ? `saveEditSubtask(${index}, '${taskId}')` : `saveSubtask(${index})`;
  const deleteFn = isEditMode ? `deleteEditSubtask(${index}, '${taskId}')` : `deleteSubtask(${index})`;
  return `
    <li class="subtask-edit-mode-item">
      <input type="text" id="editSubtaskInput${index}" class="subtask-edit-input" value="${title}" 
             onkeydown="if(event.key==='Enter') ${saveFn}">
      <div class="subtask-edit-actions">
        <button type="button" class="subtask-action-btn" onclick="${deleteFn}"><img src="../assets/icons/delete-icon.svg"></button>
        <div class="subtask-divider"></div>
        <button type="button" class="subtask-action-btn" onclick="${saveFn}"><img src="../assets/icons/subtask-check-icon.svg"></button>
      </div>
    </li>`;
}

/** --- TASK DETAIL DIALOG --- */
/**
 * Generates the full HTML markup template for the task detail view dialog.
 * @param {Object} task - The task data object.
 * @param {string} id - The unique task ID.
 * @returns {string} The task detail layout HTML string.
 */
export function generateTaskDetailHTML(task, id) {
  const p = (task.priority || 'Medium').toLowerCase();
  return `
    <div class="detail-view">
      <div class="detail-view-header"><div class="task-category ${task.category?.replace(/\s+/g, '').toLowerCase() || ''}">${task.category || ''}</div><div class="detail-view-close" onclick="closeTaskDetail()">×</div></div>
      <h1 class="detail-view-title">${task.title || ''}</h1>
      <p class="detail-view-description">${task.description || ''}</p>
      <div class="detail-view-info-row"><span class="detail-view-label" style="white-space:nowrap">Due date:</span> ${task.dueDate?.replaceAll('-', '/') || ''}</div>
      <div class="detail-view-info-row"><span class="detail-view-label" style="white-space:nowrap">Priority:</span>
        <div class="detail-view-prio-badge">${task.priority || 'Medium'} <img src="../assets/icons/${p === 'medium' ? 'medium-icon-orange.svg' : `prio-${p}-icon.svg`}"></div></div>
      <div class="detail-section"><p class="detail-view-label" style="white-space:nowrap">Assigned To</p><div class="assigned-list-detail">${renderAssignedToDetail(task.assignedTo)}</div></div>
      <div class="detail-section"><p class="detail-view-label">Subtasks</p><ul class="subtask-list-detail">${getDetailSubtasksHTML(task.subtasks, id)}</ul></div>
      ${getDetailFooter(id)}
    </div>`;
}

/**
 * Generates HTML table rows containing due date and priority badges.
 * @param {Object} task - The task data object.
 * @returns {string} The info rows HTML snippet.
 */
export function getDetailInfoRows(task) {
  const prio = task.priority ? task.priority.toLowerCase() : 'medium';
  return `
    <div class="detail-view-info-row">
      <span class="detail-view-label-inline">Due date:</span> 
      <span>${task.dueDate || ''}</span>
    </div>
    <div class="detail-view-info-row">
      <span class="detail-view-label-inline">Priority:</span> 
      <div class="detail-view-prio-badge">${task.priority || 'Medium'} 
        <img src="../assets/icons/prio-${prio}-icon.svg"></div>
    </div>`;
}

/**
 * Generates the HTML list items for subtasks in the detail view.
 */
export function getDetailSubtasksHTML(subtasks, taskId) {
  const safeSubtasks = Array.isArray(subtasks) ? subtasks : [];
  return safeSubtasks
    .map(
      (subtask, index) => `
<li id="subtaskItemDetail${index}" class="subtask-item">
<div class="subtask-left">
<input type="checkbox" ${subtask.done ? 'checked' : ''} onclick="toggleSubtask('${taskId}', ${index})">
<span>${subtask.title}</span>
</div>
<div class="subtask-icons">
<img src="../assets/icons/edit-icon.svg" onclick="editEditSubtask(${index}, '${taskId}')">
<div class="icon-divider"></div>
<img src="../assets/icons/delete-icon.svg" onclick="deleteEditSubtask('${taskId}', ${index})">
</div>
</li>`,
    )
    .join('');
}

export function getSingleDetailSubtaskHTML(subtask, index, taskId) {
  return `
    <li id="subtaskItemDetail${index}" class="subtask-item">
      <div class="subtask-left">
        <input type="checkbox" ${subtask.done ? 'checked' : ''} onclick="toggleSubtask('${taskId}', ${index})">
        <span>${subtask.title}</span>
      </div>
      <div class="subtask-icons">
        <img src="../assets/icons/edit-icon.svg" onclick="editEditSubtask(${index}, '${taskId}')">
        <div class="icon-divider"></div>
        <img src="../assets/icons/delete-icon.svg" onclick="deleteEditSubtask('${taskId}', ${index})">
      </div>
    </li>`;
}

/**
 * Generates the functional action buttons for editing and deleting tasks.
 * @param {string} id - The unique task ID.
 * @returns {string} The detail dialog footer menu HTML string.
 */
export function getDetailFooter(id) {
  return `
    <div class="detail-view-footer">
      <button class="action-btn" onclick="deleteTask('${id}')">
        <img src="../assets/icons/delete-icon.svg"> Delete
      </button>
      <div class="footer-divider"></div>
      <button class="action-btn" onclick="editTask('${id}')">
        <img src="../assets/icons/edit-icon.svg"> Edit
      </button>
    </div>`;
}

/** --- ASSIGNED USERS --- */
/**
 * Generates an assigned user element containing initials badges and names.
 * @param {any} name - The contact name or object.
 * @returns {string} The individual contact badge element HTML string.
 */
export function getAssignedUserHTML(name) {
  const safeName = typeof name === 'string' ? name : name?.name || 'Guest';
  const color = typeof getContactColor === 'function' ? getContactColor(safeName) : '#ff7a00';
  const initials = typeof getInitials === 'function' ? getInitials(safeName) : '??';

  return `<div class="assigned-user">
      <div class="user-badge" style="background-color: ${color}">${initials}</div>
      <span class="user-name">${safeName}</span></div>`;
}

/**
 * Iterates over contacts list parameters and generates detail row HTML output.
 * @param {any} assignedTo - Assigned string name or collection array.
 * @returns {string} Consolidated contact list markup string.
 */
export function renderAssignedToDetail(assignedTo, showName = true) {
  if (!Array.isArray(assignedTo)) return '';
  const allContacts = window.contacts?.length > 0 ? window.contacts : JSON.parse(localStorage.getItem('guestContacts')) || [];
  return assignedTo.map((item) => renderSingleBadge(item, allContacts, showName)).join('');
}

function getInitialsFromName(fullName, contact) {
  if (contact?.initials) return contact.initials;
  return fullName
    .split(' ')
    .map((x) => x[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function renderSingleBadge(item, allContacts, showName) {
  const c = allContacts.find((c) => c.name === (item.name || item) || c.id === item);
  const n = c?.name || (typeof item === 'string' ? item : item?.name) || 'Guest';
  const badge = `<div class="user-badge" style="background-color: ${c?.color || '#ff7a00'}">${getInitialsFromName(n, c)}</div>`;
  return showName ? `<div class="assigned-contact-row">${badge}<span>${n}</span></div>` : badge;
}

/** --- EDIT MODE --- */
/**
 * Generates the full framework block wrapper structure for task editor view.
 * @param {Object} task - The active task object.
 * @param {string} id - The targeted task identifier ID.
 * @returns {string} The editor structure view form HTML string.
 */
export function generateEditTaskHTML(task, id) {
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

/**
 * Generates the layout view container structure for editor left sections.
 * @param {Object} task - The targeted active task data object.
 * @returns {string} HTML snippet wrapper input form elements.
 */
export function getEditLeftSection(task) {
  return `
    <div class="edit-section">
      <div class="input-group"><label>Title<span class="required">*</span></label>
        <input type="text" id="editTitle" value="${task.title || ''}"></div>
      <div class="input-group"><label>Description</label>
        <textarea id="editDescription">${task.description || ''}</textarea></div>
    </div>`;
}

export function getEditRightSection(task, id) {
  return `
    <div class="edit-section">
      <div class="input-group"><label>Due Date</label>
        <input type="date" id="editDate" value="${task.dueDate || ''}"></div>
      <div class="input-group"><label>Assigned To</label>
        <div class="combo-wrapper" id="assignedInputContainer">
          <input type="text" id="assignedInput" placeholder="Select contacts to assign" 
                 oninput="renderContacts(this.value)" onclick="toggleContactList()">
          <img src="../assets/icons/arrow_drop_down.svg" class="dropdown-arrow" onclick="toggleContactList()">
        </div>
        <div id="contactList" class="contact-list-dropdown d-none"></div>
        <div id="assignedBadges" class="assigned-badges-container"></div>
    </div>`;
}

/* Contacts Template */
/**
 * Gets a letter separator
 * for grouping contacts alphabetically.
 *
 * @param {HTMLElement} list - The contact list container
 * @param {string} letter - The current contact letter
 */
export function getContactLetter(list, letter) {
  list.innerHTML += `
        <div class="contact-letter-container">

            <div class="contact-letter">
                ${letter}
            </div>

            <div class="contact-divider"></div>

        </div>
    `;
}

/**
 * Gets a single contact item
 * for rendering in the contact list.
 *
 * @param {HTMLElement} list - The contact list container
 * @param {Object} contact - The contact object
 * @param {number} i - The index of the contact in the contacts array
 */
export function getSingleContact(list, contact, index, isActive) {
  list.innerHTML += `
    <div class="contact-items ${isActive ? 'contact-item-active' : ''}"
      onclick="window.renderContactDetails(${index})">
      <div class="contact-avatar" style="background-color: ${contact.color}">
        ${contact.initials || '??'}
      </div>
      <div class="contact-information">
        <h4 class="contact-name">${contact.name || ''}</h4>
        <p class="contact-email">${contact.email || ''}</p>
      </div>
    </div>`;
}

export function getContactDetails(contact) {
  return `
    <div class="contact-details-content">
      <div class="contact-details-header">
        <div class="contact-avatar contact-avatar--big" style="background-color: ${contact.color}">${contact.initials}</div>
        <div class="contact-details-header-info">
          <h3>${contact.name}</h3>
          <div class="contact-details-actions">
            <button onclick="window.openEditContact('${contact.id}')" class="edit-delete-btn"><img src="../assets/img/edit-contact.svg" alt="Edit"></button>
            <button onclick="openDeleteDialog('${contact.id}')" class="edit-delete-btn"><img src="../assets/img/delete-contact.svg" alt="Delete"></button>
          </div></div></div>
      <div class="contact-details-information"><span>Contact Information</span>
        <span><b>Email:</b> <a class="contact-email" href="mailto:${contact.email}">${contact.email}</a></span>
        <span><b>Phone:</b> ${contact.phone || 'No phone number'}</span></div></div>`;
}

export function getContactOptionsHTML(contactsArray, defaultText) {
  const def = `<option value="" disabled selected>${defaultText}</option>`;
  const opts = contactsArray.map((c) => `<option value="${c.name}">${c.name}</option>`).join('');
  return def + opts;
}

/**
 * Generates the HTML for a contact item in the dropdown with your specific icons.
 */
export function getContactCheckboxHTML(contact, isChecked) {
  const icon = isChecked ? 'subtask-done-icon.svg' : 'check-empty.svg';
  return `
    <div class="contact-item ${isChecked ? 'selected' : ''}" 
         onclick="toggleContactSelection('${contact.name}'); event.stopPropagation();">
      <div class="contact-name-left" style="pointer-events: none;">
        <div class="user-badge-small" style="background-color: ${contact.color}">${contact.initials}</div>
        <span style="color: inherit;">${contact.name}</span>
      </div>
      <input type="checkbox" name="assignedContact" value="${contact.name}" 
             ${isChecked ? 'checked' : ''} style="display:none">
      <img src="../assets/icons/${icon}" class="custom-checkbox" style="pointer-events: none;">
    </div>`;
}
