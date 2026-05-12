const CATEGORY_OPTIONS = ['Technical Task', 'User Story', 'Feature Task'];
const CONTACT_OPTIONS = [
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
function getPrioClass(prio) {
  return 'active-' + prio.toLowerCase();
}

/**
 * Resets priority button styles by removing all active priority CSS classes.
 * @param {string} selector - The CSS selector for the targets.
 */
function clearActivePrioClasses(selector) {
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
