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
export const CONTACT_COLORS = [
  '#FF7A00',
  '#FF5EB3',
  '#6E52FF',
  '#9327FF',
  '#00BEE8',
  '#1FD7C1',
  '#FF745E',
  '#FFA35E',
  '#FF5E5E',
  '#FF5E9E',
];

/**
 * Extracts and returns capitalized initials from a full name string.
 * @param {string} name - The full name to parse.
 * @returns {string} The uppercase initials or fallback characters.
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '??';
  const parts = name
    .trim()
    .split(' ')
    .filter((w) => w !== '');
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

/**
 * Picks a random hex color code from the unified platform color pool array.
 * @returns {string} A CSS hex color string.
 */
export function getRandomColor() {
  return CONTACT_COLORS[Math.floor(Math.random() * CONTACT_COLORS.length)];
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

/**
 * Retrieves the current authenticated user ID or returns a fallback guest ID.
 * @returns {string} The Firebase user ID or guest fallback token.
 */
export function getCurrentUserId() {
  return localStorage.getItem('currentUserId') || 'guest_user';
}

/**
 * Capitalizes the very first character of an alphanumeric input string.
 * @param {string} string - The target input string.
 * @returns {string} The modified text with an uppercase start.
 */
export function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Calculates total counts and status metrics from the task list.
 * KORREKTUR: Extrahiert den echten Vornamen des Users aus dem Speicher.
 * @param {Array} tasks - The list of tasks.
 * @returns {Object} Calculated metrics and user information.
 */
export function calculateMetrics(tasks) {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const isG = localStorage.getItem('isGuest') === 'true';
  const rawName = isG || !user?.name ? 'Guest' : user.name;
  const firstName = rawName.split(' ')[0]; // Schneidet den Nachnamen ab (z.B. Max Mustermann -> Max)
  return {
    todo: tasks.filter((t) => t.status === 'todo').length || 0,
    done: tasks.filter((t) => t.status === 'done').length || 0,
    urgent:
      tasks.filter((t) => t.priority && t.priority.toLowerCase() === 'urgent')
        .length || 0,
    tasksInBoard: tasks.length || 0,
    tasksInProgress:
      tasks.filter((t) => t.status === 'progress' || t.status === 'inProgress')
        .length || 0,
    awaitingFeedback: tasks.filter((t) => t.status === 'feedback').length || 0,
    deadline: getNextDeadline(tasks),
    userName: firstName, // Übergibt den dynamischen Vornamen an die UI
  };
}

/**
 * Finds and formats the earliest upcoming task deadline.
 * @param {Array} tasks - The list of tasks.
 * @returns {string} Formatted date string or fallback message.
 */
export function getNextDeadline(tasks) {
  const validDates = tasks.map((t) => t.dueDate).filter((d) => d && d !== '');
  if (validDates.length === 0) return 'No upcoming deadline';
  const sortedDates = validDates.sort((a, b) => new Date(a) - new Date(b));
  const nextDate = new Date(sortedDates[0]);
  if (isNaN(nextDate.getTime())) return 'No upcoming deadline';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return nextDate.toLocaleDateString('en-US', options);
}

/** --- GLOBAL EXPORTS FOR HTML --- */
window.getInitials = getInitials;
window.getContactColor = getRandomColor; // Abwärtskompatibler Alias-Export für das Template!
window.getRandomColor = getRandomColor;
window.getPrioClass = getPrioClass;
window.clearActivePrioClasses = clearActivePrioClasses;
window.getCurrentUserId = getCurrentUserId;
window.capitalizeFirstLetter = capitalizeFirstLetter;
window.calculateMetrics = calculateMetrics;
window.getNextDeadline = getNextDeadline;
