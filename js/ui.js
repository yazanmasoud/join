import { isGuestUser } from './storage.js';

window.handleBackArrow = handleBackArrow;
window.setGreeting = setGreeting;
window.removeHighlight = removeHighlight;
window.highlight = highlight;
window.clearInputError = clearInputError;

/** UI Helper Functions */
/**board.js*/
export function closeTaskDetail() {
  const dialog = document.getElementById('taskDetailDialog');
  if (dialog) {
    dialog.classList.remove('edit-mode-wide');
    dialog.close();
  }
}

export function setupDialogClose(closeCallback) {
  const dialog = document.getElementById('taskDetailDialog');
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) closeCallback();
  });
}

export function highlight(id) {
  document.getElementById(id)?.classList.add('drag-area-highlight');
}

export function removeHighlight(id) {
  document.getElementById(id)?.classList.remove('drag-area-highlight');
}

export function setEditPriority(prio) {
  ['Urgent', 'Medium', 'Low'].forEach((p) => {
    const btn = document.getElementById('editPrio' + p);
    if (btn)
      btn.classList.remove('active-urgent', 'active-medium', 'active-low');
  });
  const activeBtn = document.getElementById('editPrio' + prio);
  if (activeBtn) activeBtn.classList.add('active-' + prio.toLowerCase());
}

/**summary.js */
/**
 * Updates DOM text elements mapped to metric keys.
 * @param {Object} data - The calculated metrics object.
 */
export function updateUI(data) {
  const fields = document.querySelectorAll('[data-field]');
  fields.forEach((field) => {
    const key = field.getAttribute('data-field');
    if (data[key] !== undefined) {
      field.innerText = data[key];
    }
  });
}

/**
 * Sets a time-dependent greeting message in the DOM.
 */
export function setGreeting() {
  const hour = new Date().getHours();
  const greetingElements = document.querySelectorAll('.greeting-time');
  let greeting;
  if (hour >= 5 && hour < 12) greeting = 'Good morning,';
  else if (hour >= 12 && hour < 18) greeting = 'Good afternoon,';
  else if (hour >= 18 && hour < 22) greeting = 'Good evening,';
  greetingElements.forEach((element) => {
    element.innerHTML = greeting;
  });
}

/**
 * Adjusts the UI layout and elements based on guest status.
 * @param {Object} dashboardData - Object containing guest status and user name.
 */
export function handleGuestLogin(dashboardData) {
  const container = document.getElementById('greeting-container');
  const nameElement = document.querySelector('[data-field="userName"]');
  if (!container) return;
  if (isGuestUser() || !dashboardData.userName) {
    container.classList.add('is-guest');
    if (nameElement) nameElement.innerText = '';
  } else {
    container.classList.remove('is-guest');
    if (nameElement) nameElement.innerText = dashboardData.userName;
  }
}

/**
 * Set the visibility state of the profile avatar dropdown menu to visible.
 *
 * @param {Event} event - The triggered DOM click event.
 */
export function openAvatarDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('avatarDropdown');
  if (!dropdown) return;
  dropdown.classList.add('open');
}

/**
 * Closes all currently open elements by removing the open class.
 */
export function closeOpenElements() {
  document.querySelectorAll('.open').forEach((element) => {
    element.classList.remove('open');
  });
}

/**
 * Handles back arrow navigation behavior depending on the currently active layout context.
 * Within the main application layout, the function navigates back to the previously visited app page.
 * If no previous page exists, the summary page is loaded as a fallback.
 * Within the login layout, the function redirects the user back to the main index login page.
 * @return {void}
 */
function handleBackArrow() {
  const isLoginLayout = window.location.pathname.includes('loginlayout.html');
  if (isLoginLayout) {
    backToLogin();
    return;
  }
  const previousPage = pageHistory[pageHistory.length - 2] || 'summary';
  navigateTo(previousPage);
}

// Helper function which resets the innerHTML to prevent double content
export function clearElementsByIds(ids) {
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.innerHTML = '';
  });
}

//guarantees an array -  doesnt matter if the input is an object or an array
export function normalizeObjectToArray(data) {
  if (Array.isArray(data)) return data;
  return Object.entries(data || {}).map(([id, item]) => ({
    id,
    ...item,
  }));
}

/**
 * Sets the user name inside all greeting elements.
 * @param {string} name - User name.
 */
export function setGreetingName(name) {
  const greetingElements = document.querySelectorAll('[data-field="userName"]');
  if (!greetingElements.length) return;
  greetingElements.forEach((element) => {
    element.innerText = name;
  });
}

/**
 * Renders the authenticated user's avatar initials.
 */
export function renderAvatar(elementId, name) {
  const avatarElement = document.getElementById(elementId);
  if (!avatarElement) return;
  avatarElement.innerText = getInitials(name);
}

/**
 * Displays an input validation error.
 * @param {string} inputId - Input element ID.
 * @param {string} errorId - Error text element ID.
 * @param {string} message - Error message.
 */
export function showInputError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) {
    input.classList.add('input-error');
  }
  if (error) {
    error.innerText = message;
    error.classList.add('visible');
  }
}

/**
 * Clears an input validation error.
 * @param {string} inputId - Input element ID.
 * @param {string} errorId - Error text element ID.
 */
export function clearInputError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) {
    input.classList.remove('input-error');
  }
  if (error) {
    error.innerText = '';
    error.classList.remove('visible');
  }
}

/**
 * Toggles the visibility of the contact selection list.
 */
export function toggleContactList() {
  const list = document.getElementById('contactList');
  if (list) list.classList.toggle('d-none');
}

/**
 * Shows the success toast notification.
 */
export function showSuccessToast() {
  const toast = document.getElementById('successMessage');
  if (toast) {
    toast.classList.remove('d-none');
    setTimeout(() => {
      toast.style.bottom = '50px';
    }, 10);

    setTimeout(() => {
      toast.classList.add('d-none');
    }, 2000);
  }
}

/**
 * Updates the submit button and headline for edit mode.
 */
export function updateButtonToSaveMode() {
  const btn = document.querySelector('.btn-dark');
  if (btn) {
    btn.innerHTML = 'Save Changes <img src="../assets/icons/create-task.svg">';
    btn.onclick = createTask;
  }
  const headline = document.querySelector('h2');
  if (headline) headline.innerText = 'Edit Task';
}

/**
 * Resets a list of input elements by their IDs.
 * @param {string[]} ids - Array of element IDs.
 */
export function resetInputFields(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}
