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
  const greetingElement = document.querySelector('.greeting-time');
  let greeting = 'Good night,';

  if (hour >= 5 && hour < 12) greeting = 'Good morning,';
  else if (hour >= 12 && hour < 18) greeting = 'Good afternoon,';
  else if (hour >= 18 && hour < 22) greeting = 'Good evening,';

  if (greetingElement) greetingElement.innerText = greeting;
}

/**
 * Adjusts the UI layout and elements based on guest status.
 * @param {Object} dashboardData - Object containing guest status and user name.
 */
export function handleGuestLogin(dashboardData) {
  const container = document.getElementById('greeting-container');
  const nameElement = document.querySelector('[data-field="userName"]');

  if (!container) return;

  if (dashboardData.isGuest || !dashboardData.userName) {
    container.classList.add('is-guest');
    if (nameElement) nameElement.innerText = '';
  } else {
    container.classList.remove('is-guest');
    if (nameElement) nameElement.innerText = dashboardData.userName;
  }
}
