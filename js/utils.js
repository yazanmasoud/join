export const CATEGORY_OPTIONS = [
  'Technical Task',
  'User Story',
  'Feature Task',
];
export const CONTACT_OPTIONS = [
  'Maximilian Müller',
  'Sofia Schneider',
  'Benedikt Bauer',
];

const overlay = document.getElementById('overlay');

window.hideOverlay = hideOverlay;
window.showOverlay = showOverlay;
window.getInitials = getInitials;

/**
 * Generates initials from a contact name.
 * Returns the first letter of the first name
 * and the first letter of the last name.
 *
 * @param {string} name - The full contact name
 * @returns {string} The generated initials
 */
export function getInitials(name) {
  let words = name
    .trim()
    .split(' ')
    .filter((word) => word !== '');
  if (words.length === 0) {
    return '';
  }
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }
  let firstLetter = words[0][0].toUpperCase();
  let lastLetter = words[words.length - 1][0].toUpperCase();
  return firstLetter + lastLetter;
}


/**
 * Constructs a CSS class name mapped to a priority level.
 * @param {string} prio - The priority level string.
 * @returns {string} The formatted active priority class name.
 */
export function getPrioClass(prio) {
  return 'active-' + prio.toLowerCase();
}


/**
 * Resets priority button styles by removing all active priority CSS classes.
 * @param {string} selector - The CSS selector for the targets.
 */
export function clearActivePrioClasses(selector) {
  const btns = document.querySelectorAll(selector);
  btns.forEach((b) =>
    b.classList.remove('active-urgent', 'active-medium', 'active-low'),
  );
}


/**Board.js */
export function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}


/**Summary.js */
/**
 * Berechnet die Metriken für die Summary Seite.
 * @param {Array} tasks - Liste der Tasks als Array.
 */
export function calculateMetrics(tasks) {
  return {
    todo: tasks.filter((t) => t.status === 'todo').length || 0,
    done: tasks.filter((t) => t.status === 'done').length || 0,
    urgent:
      tasks.filter((t) => t.priority?.toLowerCase() === 'urgent').length || 0,
    tasksInBoard: tasks.length || 0,
    tasksInProgress: tasks.filter((t) => t.status === 'progress').length || 0,
    awaitingFeedback: tasks.filter((t) => t.status === 'feedback').length || 0,
    deadline: getNextDeadline(tasks),
  };
}


/**
 * Finds and formats the earliest upcoming task deadline.
 * @param {Array} tasks - The list of tasks.
 * @returns {string} Formatted date string or fallback message.
 */
export function getNextDeadline(tasks) {
  const validDates = tasks
    .map((t) => t.dueDate)
    .filter((dateStr) => dateStr && dateStr !== '');
  if (validDates.length === 0) return 'No upcoming deadline';
  const sortedDates = validDates.sort((a, b) => new Date(a) - new Date(b));
  const nextDate = new Date(sortedDates[0]);
  if (isNaN(nextDate.getTime())) return 'No upcoming deadline';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return nextDate.toLocaleDateString('en-US', options);
}


export function showOverlay(message = 'Success!') {
  const text = overlay.querySelector('.success-message');
  text.textContent = message;
  overlay.classList.remove('hidden');
  overlay.style.opacity = '1';
}


export function hideOverlay() {
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.classList.add('hidden');
  }, 300);
}


/**
 * Validates mandatory task fields.
 * @returns {boolean} True if valid.
 */
function validateTask(task) {
  const catSelect = document.getElementById('taskCategory');
  return task.title && task.dueDate && catSelect.selectedIndex !== 0;
}


/**
 * Returns a random color
 * from the predefined color array.
 *
 * @returns {string} A random hex color value.
 */
export function getRandomColor() {
    const colors = [
        '#FF7A00', '#FF5EB3', '#6E52FF',
        '#9327FF', '#00BEE8', '#1FD7C1',
        '#FF745E', '#FFA35E', '#FF5E5E',
        '#FF5E9E'
    ];

    let randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}