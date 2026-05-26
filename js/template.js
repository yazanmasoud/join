import { contacts } from './contacts.js';

window.generateTaskHTML = generateTaskHTML;
window.getNoTaskPlaceholder = getNoTaskPlaceholder;
window.generateTaskDetailHTML = generateTaskDetailHTML;
window.generateEditTaskHTML = generateEditTaskHTML;
window.getContactDetails = getContactDetails;
window.openEditContact = openEditContact;
window.getPriorityButtonsHTML = getPriorityButtonsHTML;
window.setPriority = setPriority;

/** --- BOARD TASK CARDS --- */

/**
 * Generates the HTML structure for a board task card.
 * @param {Object} task - The task data object.
 * @param {string} id - The unique task ID.
 * @returns {string} The task card HTML string.
 */
export function generateTaskHTML(task, id) {
  const catClass = task.category
    ? task.category.replace(/\s+/g, '').toLowerCase()
    : '';
  return `
    <div class="task-card" draggable="true" ondragstart="startDragging('${id}')" 
         onclick="openTaskDetail('${id}')">
      <div class="task-category ${catClass}">${task.category || ''}</div>
      <h3>${task.title || ''}</h3>
      <p class="description-task-board">${task.description || ''}</p>
      ${renderSmallSubtaskInfo(task)}
    </div>`;
}

/**
 * Renders a progress bar and subtask completion text.
 * @param {Object} task - The task data object.
 * @returns {string} The progress bar and text HTML string.
 */
export function renderSmallSubtaskInfo(task) {
  if (!task.subtasks || task.subtasks.length === 0) return '';
  const done = task.subtasks.filter((s) => s.done).length;
  const percent = (done / task.subtasks.length) * 100;
  return `
    <div class="subtask-progress-container">
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${percent}%"></div>
      </div>
      <small>${done}/${task.subtasks.length} Subtasks</small>
    </div>`;
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
      const isSel = p === selectedPrio;
      const low = p.toLowerCase();
      // Nutzt das orange-Icon für Medium, sonst dein Standard-Schema
      const icon =
        p === 'Medium' ? `medium-icon-orange.svg` : `prio-${low}-icon.svg`;

      return `
      <button type="button" 
              class="prio-btn ${isSel ? 'active-' + low : ''}" 
              id="prio${p}" 
              onclick="setPriority('${p}')">
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
  const opts = optionsArray
    .map((opt) => `<option value="${opt}">${opt}</option>`)
    .join('');
  return def + opts;
}

/**
 * Generates a single subtask list element with a delete action button.
 */
export function getSubtaskHTML(task, index) {
  const icon = task.done ? 'subtask-done-icon.svg' : 'check-empty.svg';
  return `
    <li class="subtask-edit-item">
      <div class="subtask-left" onclick="toggleSubtaskStatus(${index})">
        <img src="../assets/icons/${icon}" class="subtask-check-icon" alt="checkbox">
        <span class="subtask-text">${task.title}</span>
      </div>
      <div class="subtask-actions">
        <button type="button" class="delete-sub-btn" onclick="deleteSubtask(${index})">
          <img src="../assets/icons/delete-icon.svg" alt="delete">
        </button>
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
  const catClass = task.category
    ? task.category.replace(/\s+/g, '').toLowerCase()
    : '';
  return `
    <div class="detail-view">
      <div class="detail-view-header">
        <span class="task-category ${catClass}">${task.category || ''}</span>
        <div class="detail-view-close" onclick="closeTaskDetail()">×</div>
      </div>
      <h1 class="detail-view-title">${task.title || ''}</h1>
      <p class="detail-view-description">${task.description || ''}</p>
      ${getDetailInfoRows(task)}
      <div class="detail-section"><p class="detail-view-label">Assigned To:</p>
        <div class="assigned-list-detail">${renderAssignedToDetail(task.assignedTo)}</div></div>
      <div class="detail-section"><p class="detail-view-label">Subtasks</p>
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
      return `
      <li class="subtask-item" onclick="toggleSubtask('${taskId}', ${i})">
        <img src="../assets/icons/${icon}" class="subtask-check-icon">
        <span class="subtask-text">${st.title}</span>
      </li>`;
    })
    .join('');
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
  const color =
    typeof getContactColor === 'function'
      ? getContactColor(safeName)
      : '#ff7a00';
  const initials =
    typeof getInitials === 'function' ? getInitials(safeName) : '??';

  return `<div class="assigned-user">
      <div class="user-badge" style="background-color: ${color}">${initials}</div>
      <span class="user-name">${safeName}</span></div>`;
}

/**
 * Iterates over contacts list parameters and generates detail row HTML output.
 * @param {any} assignedTo - Assigned string name or collection array.
 * @returns {string} Consolidated contact list markup string.
 */
function renderAssignedToDetail(assignedTo) {
  if (!assignedTo || !Array.isArray(assignedTo)) return '';
  return assignedTo
    .map((item) => {
      const name = typeof item === 'string' ? item : item.name;
      const contact = (typeof contacts !== 'undefined' ? contacts : []).find(
        (c) => c.name === name,
      );
      const color = contact?.color || '#ff7a00';
      const initials = contact?.initials || (name ? name.charAt(0) : '?');
      return `
      <div class="assigned-contact-row">
        <div class="user-badge" style="background-color: ${color}">${initials}</div>
        <span class="contact-name-detail">${name}</span>
      </div>`;
    })
    .join('');
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

/**
 * Generates the layout view container structure for editor right sections.
 * @param {Object} task - The targeted active task data object.
 * @param {string} id - The unique task ID.
 * @returns {string} HTML snippet wrapper form elements.
 */
export function getEditRightSection(task, id) {
  return `
    <div class="edit-section">
      <div class="input-group"><label>Due Date</label>
        <input type="date" id="editDate" value="${task.dueDate || ''}"></div>
      <div class="input-group"><label>Assigned To</label>
        <input type="text" id="editAssigned" value="${task.assignedTo || ''}"></div>
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
    <div class="contact-item ${isActive ? 'contact-item-active' : ''}"
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
              <button onclick="window.openEditContact('${contact.id}')" class="edit-delete-btn">
                <img src="../assets/img/edit-contact.svg" alt="Edit Contact">
              </button>

              <button onclick="openDeleteDialog('${contact.id}')" class="edit-delete-btn">
                <img src="../assets/img/delete-contact.svg" alt="Delete Contact">
              </button>
            </div>
        </div> 
      </div>

      <div class="contact-details-information">
        <span>Contact Information</span>
        <span><b>Email:</b> <a class="contact-email" href="mailto:${contact.email}">${contact.email}</a></span>
        <span><b>Phone:</b> ${contact.phone || 'No phone number'}</span></div>
      </div>
    `;
}

export function getContactOptionsHTML(contactsArray, defaultText) {
  const def = `<option value="" disabled selected>${defaultText}</option>`;
  const opts = contactsArray
    .map((c) => `<option value="${c.name}">${c.name}</option>`)
    .join('');
  return def + opts;
}

export function getContactCheckboxHTML(contact, isChecked) {
  return `
    <div class="contact-item" onclick="event.stopPropagation()">
      <label class="contact-label">
        <div class="contact-name-wrapper">
          <input type="checkbox" name="assignedContact" value="${contact.name}" 
                 ${isChecked ? 'checked' : ''} onchange="updateSelectedBadges()">
          <div class="user-badge-small" style="background-color: ${contact.color || '#2A3647'}">
            ${contact.initials || '??'}
          </div>
          <span>${contact.name}</span>
        </div>
      </label>
    </div>`;
}
