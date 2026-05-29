import { closeOpenElements, setGreetingName, renderAvatar } from './ui.js';
import { initAddTask } from './task.js';
import { initSummary } from './summary.js';
import { initBoard } from './board.js';
import { initContacts } from './contacts.js';
import { toggleAvatarDropdown } from './header.js';
import { auth, database } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { isGuestUser } from './storage.js';
import { ref, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { getInitials } from './utils.js';
import { getCurrentUserData } from './auth-service.js';


const pageHistory = [];


window.initLayout = initLayout;
window.initLoginLayout = initLoginLayout;
window.navigateTo = navigateTo;
window.logOut = logOut;
window.toggleAvatarDropdown = toggleAvatarDropdown;
window.closeOpenElements = closeOpenElements;
window.setActiveNavItem = setActiveNavItem;
window.goBack = goBack;
window.openHelp = openHelp;
window.loginNavigateTo = loginNavigateTo;
window.backToLogin = backToLogin;
window.pageHistory = pageHistory;


/**
 * Redirect to login if not logged in
 */
export function checkSession() {
  return new Promise((resolve) => {
    if (isGuestUser()) {
      resolve(true);
      return;
    }

    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = '../index.html';
        return;
      }

      resolve(true);
    });
  });
}


/**
 * Funktion which chooses which init must be loaded.
 * @param {string} page - The name of the initiated page
 */
function initPage(page) {
  if (page === 'summary') {
    initSummary();
  }

  if (page === 'board') {
    initBoard();
  }

  if (page === 'add-task') {
    initAddTask();
  }

  if (page === 'contacts') {
    initContacts();
  }
}


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
 * Returns the initial page identifier based on the current URL query parameters.
 * Falls back to the summary page if no page parameter is provided.
 *
 * @returns {string} The initial page identifier.
 */
function getInitialPage() {
  const params = new URLSearchParams(window.location.search);
  return params.get('page') || 'summary';
}


/**
 * Initializes the default main application layout structure.
 */
export async function initLayout() {
  await checkSession();
  await loadTemplate('headerContent', '../templates/header.html');
  await loadTemplate('sidebarContent', '../templates/aside.html');
  const userData = await getCurrentUserData();
  if (userData) {
    renderAvatar('headerAvatar', userData.name);
  }
  const initialPage = getInitialPage();
  await loadTemplate('mainContent', `./${initialPage}.html`);
  pageHistory.push(initialPage);
  initPage(initialPage);
}


/**
 * Handles client-side page navigation by updating the page history,
 * loading the target page template,
 * and initializing the corresponding page logic.
 *
 * @param {string} page - The target page identifier.
 * @returns {Promise<void>}
 */
async function navigateTo(page) {
  const currentPage = pageHistory[pageHistory.length - 1];

  if (currentPage !== page) {
    pageHistory.push(page);
  }

  await loadTemplate('mainContent', `./${page}.html`);

  initPage(page);
}


async function loginNavigateTo(page) {
  const currentPage = pageHistory[pageHistory.length - 1];

  if (currentPage !== page) {
    pageHistory.push(page);
  }

  await loadTemplate('mainLoginContent', `./${page}.html`);
}


/**
 * Returns to the previous page in the page history stack.
 *
 * @returns {Promise<void>}
 */
async function goBack() {
  if (pageHistory.length <= 1) return;

  pageHistory.pop();

  const previousPage = pageHistory[pageHistory.length - 1];

  await loadTemplate('mainContent', `./${previousPage}.html`);

  initPage(previousPage);

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
 * Initializes the public login layout components and loads the initial subpage
 * from URL parameters.
 *
 * @returns {Promise<void>}
 */
export async function initLoginLayout() {
  await loadTemplate('headerLoginContent', '../templates/headerlogin.html');
  await loadTemplate('sidebarLoginContent', '../templates/asidelogin.html');

  const params = new URLSearchParams(window.location.search);
  const page = params.get('page') || 'imprint';

  await loadTemplate('mainLoginContent', `./${page}.html`);

  setActiveLoginNavFromUrl(page);
  document.body.classList.add('has-active-page'); // Ensures a valid default page is loaded when layout-login.html is opened directly without a page parameter.
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
  localStorage.clear();
  sessionStorage.removeItem('mobileGreetingPlayed');
  closeOpenElements();
  window.location.href = '../index.html'; // Redirect to login page
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


if (document.querySelector('.layout')) {
  initLayout();
}


if (document.querySelector('.layout-login')) {
  initLoginLayout();
}
