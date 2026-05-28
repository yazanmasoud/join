import { isGuestUser } from './storage.js';

window.handleBackArrow = handleBackArrow;
window.setGreeting = setGreeting;
window.removeHighlight = removeHighlight;
window.highlight = highlight;
window.clearInputError = clearInputError;

/** @section UI Helper Functions */

/**
 * Closes the task detail dialog and resets its styling.
 */
export function closeTaskDetail() {
  const dialog = document.getElementById('taskDetailDialog');
  if (dialog) {
    dialog.classList.remove('edit-mode-wide');
    dialog.close();
  }
}


/**
 * Sets up a listener to close the dialog when clicking on the backdrop.
 * @param {Function} closeCallback - The function to execute on close.
 */
export function setupDialogClose(closeCallback) {
  const dialog = document.getElementById('taskDetailDialog');
  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) closeCallback();
  });
}


/**
 * Adds a highlight class to a drag container.
 * @param {string} id - The ID of the element to highlight.
 */
export function highlight(id) {
  document.getElementById(id)?.classList.add('drag-area-highlight');
}


/**
 * Removes the highlight class from a drag container.
 * @param {string} id - The ID of the element.
 */
export function removeHighlight(id) {
  document.getElementById(id)?.classList.remove('drag-area-highlight');
}


/**
 * Updates the visual active state of priority buttons in edit mode.
 * @param {string} prio - The priority level (Urgent, Medium, Low).
 */
export function setEditPriority(prio) {
  ['Urgent', 'Medium', 'Low'].forEach((p) => {
    const btn = document.getElementById('editPrio' + p);
    if (btn)
      btn.classList.remove('active-urgent', 'active-medium', 'active-low');
  });
  const activeBtn = document.getElementById('editPrio' + prio);
  if (activeBtn) activeBtn.classList.add('active-' + prio.toLowerCase());
}


/** @section Summary & Dashboard */

/**
 * Updates DOM text elements mapped to metric keys using data-fields.
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
 * Sets a time-dependent greeting message (Morning, Afternoon, Evening).
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
 * Adjusts the greeting layout and name display based on guest status.
 * @param {Object} dashboardData - Object containing user information.
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
 * Opens the profile avatar dropdown menu.
 * @param {Event} event - The triggered DOM click event.
 */
export function openAvatarDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('avatarDropdown');
  if (!dropdown) return;
  dropdown.classList.add('open');
}


/**
 * Closes all elements currently marked with the 'open' class.
 */
export function closeOpenElements() {
  document.querySelectorAll('.open').forEach((element) => {
    element.classList.remove('open');
  });
}


/**
 * Navigates back based on the current layout context (Login or App).
 */
function handleBackArrow() {
  const isLoginLayout = window.location.pathname.includes('layout-login.html');
  if (isLoginLayout) {
    backToLogin();
    return;
  }
  const previousPage = pageHistory[pageHistory.length - 2] || 'summary';
  navigateTo(previousPage);
}


/**
 * Clears the inner HTML of multiple elements by their IDs.
 * @param {string[]} ids - Array of element IDs to clear.
 */
export function clearElementsByIds(ids) {
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.innerHTML = '';
  });
}


/**
 * Ensures data is returned as an array, converting objects if necessary.
 * @param {Object|Array} data - The input data to normalize.
 * @returns {Array} The normalized data array.
 */
export function normalizeObjectToArray(data) {
  if (Array.isArray(data)) return data;
  return Object.entries(data || {}).map(([id, item]) => ({
    id,
    ...item,
  }));
}


/**
 * Updates the user name in all greeting-related DOM elements.
 * @param {string} name - The user name to display.
 */
export function setGreetingName(name) {
  const greetingElements = document.querySelectorAll('[data-field="userName"]');
  if (!greetingElements.length) return;
  greetingElements.forEach((element) => {
    element.innerText = name;
  });
}


/**
 * Renders user initials into a specific avatar element.
 * @param {string} elementId - ID of the avatar container.
 * @param {string} name - Name to extract initials from.
 */
export function renderAvatar(elementId, name) {
  const avatarElement = document.getElementById(elementId);
  if (!avatarElement) return;
  avatarElement.innerText = getInitials(name);
}


/**
 * Shows a validation error message and highlights the input.
 * @param {string} inputId - ID of the input field.
 * @param {string} errorId - ID of the error message element.
 * @param {string} message - The error text to show.
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
 * Removes validation error highlights and hides the error message.
 * @param {string} inputId - ID of the input field.
 * @param {string} errorId - ID of the error message element.
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
 * Displays a success toast notification with a custom message.
 * @param {string} message - The message to display.
 */
export function showSuccessToast(message = 'Task added to board') {
  const toast = document.getElementById('successMessage');
  if (!toast) return;
  const span = toast.querySelector('span');
  if (span) span.innerText = message;
  toast.classList.remove('d-none');
  setTimeout(() => {
    toast.style.bottom = '50px';
  }, 10);
  setTimeout(() => {
    toast.classList.add('d-none');
    toast.style.bottom = '-100px';
  }, 2000);
}


/**
 * Switches the Add Task button to Save mode for editing.
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
 * Resets the values of multiple input fields.
 * @param {string[]} ids - Array of input element IDs.
 */
export function resetInputFields(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}


/**
 * Closes the sign-up view and navigates back to the login screen.
 */
export function closeSignUp() {
  const signupContainer = document.getElementById('signup-container');
  const signupContainerMobile = document.getElementById(
    'signup-container-mobile',
  );
  const signup = document.getElementById('signup');
  const login = document.getElementById('login');
  if (!signup || !login) return;
  signupContainer.classList.remove('hidden');
  signupContainerMobile.classList.remove('hidden');
  signup.classList.add('hidden');
  login.classList.remove('hidden');
}


/**
 * Resets all input fields and the privacy checkbox in the sign-up form.
 */
export function clearSignupInputs() {
  document.getElementById('signup-username').value = '';
  document.getElementById('signup-email').value = '';
  document.getElementById('signup-password').value = '';
  document.getElementById('signup-confirm-password').value = '';
  document.getElementById('privacy').checked = false;
}
