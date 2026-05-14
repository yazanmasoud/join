/**
 * @file Summary management script handling dashboard state and real-time metrics data.
 */
import { toggleElement, closeElement } from './ui.js';

/**
 * The currently active page identifier.
 * @type {string|null}
 */
let currentPage = null;

/**
 * The previously active page identifier.
 * @type {string|null}
 */
let previousPage = null;

/**
 * Array storing the navigation path history.
 * @type {string[]}
 */
const pageHistory = [];

/**
 * Fetches an HTML template file and injects it into a DOM container.
 * @param {string} containerId - The ID of the target DOM element.
 * @param {string} templatePath - The path to the HTML template file.
 * @returns {Promise<void>}
 */
async function loadTemplate(containerId, templatePath) {
  const container = document.getElementById(containerId);

  if (!container) return;

  const response = await fetch(templatePath);
  const html = await response.text();

  container.innerHTML = html;
}

/**
 * Initializes the default main application layout structure.
 */
async function initLayout() {
  
  await loadTemplate('headerContent', '../templates/header.html');
  await loadTemplate('sidebarContent', '../templates/aside.html');
  await loadTemplate('mainContent', './summary.html');
}

/**
 * Initializes the auth layout components and loads the initial subpage from URL parameters.
 * @returns {Promise<void>}
 */
async function initLoginLayout() {
  await loadTemplate('headerLoginContent', '../templates/headerlogin.html');
  await loadTemplate('sidebarLoginContent', '../templates/asidelogin.html');

  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') || 'login';

  await loadTemplate('mainLoginContent', `./${page}.html`);

  setActiveLoginNavFromUrl(page);
}

/**
 * Navigates to a specific subpage view and adds it to the page history stack.
 * @param {string} page - The target page file prefix string.
 * @returns {Promise<void>}
 */
async function navigateTo(page) {
  const currentPage = pageHistory[pageHistory.length - 1];

  if (currentPage !== page) {
    pageHistory.push(page);
  }

  loadTemplate('mainContent', `./${page}.html`);
  loadTemplate('mainLoginContent', `./${page}.html`);
}

/**
 * Returns to the previous page in history view stack or handles login redirection fallback layout.
 */
function goBack() {
  if (window.location.pathname.includes('loginlayout.html')) {
    sessionStorage.setItem('skipIntroAnimation', 'true');
    window.location.href = '../index.html';
    return;
  }
  if (pageHistory.length > 1) {
    pageHistory.pop();
    const previousPage = pageHistory[pageHistory.length - 1];
    loadTemplate('mainContent', `./${previousPage}.html`);
  }
  document.body.classList.add('has-active-page');
  document.body.classList.remove('help-open');
}

/**
 * Updates navigation item visual states by assigning active styling classes.
 * @param {HTMLElement} clickedItem - The navigation link node clicked by the user.
 */
function setActiveNavItem(clickedItem) {
  document.querySelectorAll('.nav-link').forEach((item) => {
    item.classList.remove('active');
  });

  clickedItem.classList.add('active');

  document.body.classList.add('has-active-page');
  document.body.classList.remove('help-open');
}

/**
 * Clears sidebar active navigation styling selections and displays the help page interface components.
 */
function openHelp() {
  document.querySelectorAll('.nav-link').forEach((item) => {
    item.classList.remove('active');
  });

  document.body.classList.add('help-open');
  document.body.classList.remove('has-active-page');
}

/**
 * Clears authentication state parameters and redirects the browser window back to login view.
 */
function logOut() {
  console.log('User logged out');
  localStorage.removeItem('currentUser'); // Löscht Login-Status
  window.location.href = '../index.html'; // Zurück zur Haupt-Login-Seite
  closeAvatarDropdown();
}

/**
 * Redirects the main page location reference point back to the central index login gateway.
 */
function backToLogin() {
  window.location.href = '../index.html';
}

/**
 * Modifies visibility displays to remove unauthenticated navigation history back arrows.
 */
function turnOffBackarrow() {
  const backArrow = document.querySelector('.backarrow-placeholder');
  if (backArrow) backArrow.style.display = 'none';
}

/**
 * Highlights corresponding sidebar links dynamically according to current URL routing paths.
 * @param {string} page - The current page parameter identifier key.
 */
function setActiveLoginNavFromUrl(page) {
  document.querySelectorAll('.nav-link').forEach((item) => {
    item.classList.remove('active');
  });

  if (page === 'imprint') {
    document.getElementById('menuLegalLogin')?.classList.add('active');
  }

  if (page === 'privacy') {
    document.getElementById('menuPrivacyLogin')?.classList.add('active');
  }
}

// Funktionen global verfügbar machen
window.initLayout = initLayout;
window.initLoginLayout = initLoginLayout;
window.navigateTo = navigateTo;
window.logOut = logOut;
window.toggleElement = toggleElement;
window.closeElement = closeElement;
window.setActiveNavItem = setActiveNavItem;
window.goBack = goBack;
window.openHelp = openHelp;

