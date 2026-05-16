export const CATEGORY_OPTIONS = ['Technical Task', 'User Story', 'Feature Task'];
export const CONTACT_OPTIONS = [
  'Maximilian Müller',
  'Sofia Schneider',
  'Benedikt Bauer',
];

/**
 * Extracts and returns capitalized initials from a full name.
 * @param {string} name - The full name.
 * @returns {string} The uppercase initials or fallback characters.
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return '??';
  const parts = name.trim().split(' ');
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

/**
 * Generates a deterministic background color hex code based on a name string.
 * @param {string} name - The contact name.
 * @returns {string} A CSS hex color string.
 */
function getContactColor(name) {
  const colors = [
    '#FF7A00',
    '#FF5EB3',
    '#61BEFF',
    '#9327FF',
    '#00BEE8',
    '#FFBB2B',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
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
function getCurrentUserId() {
  return localStorage.getItem('currentUserId') || 'guest_user';
}

/**Board.js */
export function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**Summary.js */
/**
 * Calculates total counts and status metrics from the task list.
 * @param {Array} tasks - The list of tasks.
 * @returns {Object} Calculated metrics and user information.
 */
export function calculateMetrics(tasks) {
  return {
    todo: tasks.filter((t) => t.status === 'todo').length || 0,
    done: tasks.filter((t) => t.status === 'done').length || 0,
    urgent: tasks.filter((t) => t.priority === 'Urgent').length || 0,
    tasksInBoard: tasks.length || 0,
    tasksInProgress: tasks.filter((t) => t.status === 'inProgress').length || 0,
    awaitingFeedback:
      tasks.filter((t) => t.status === 'awaitingFeedback').length || 0,
    deadline: getNextDeadline(tasks),
    userName: 'Guest',
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
