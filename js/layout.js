/**
 * @file Summary management script handling dashboard state and real-time metrics data.
 */
import { toggleElement, closeElement } from './ui.js';
import { loadData } from './storage.js';

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
  try {
    const response = await fetch(templatePath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error(`Failed to load template ${templatePath}:`, error);
  }
}

/**
 * Initializes the default main application layout structure and avatar initials.
 * @returns {Promise<void>}
 */
async function initLayout() {
  await loadTemplate('headerContent', '../templates/header.html');
  await loadTemplate('sidebarContent', '../templates/aside.html');
  const page =
    new URLSearchParams(window.location.search).get('page') || 'summary';
  await navigateTo(page);
  const avatar = document.getElementById('headerAvatar');
  if (avatar) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const isG = localStorage.getItem('isGuest') === 'true';
    avatar.innerText = isG || !user?.name ? 'G' : window.getInitials(user.name);
  }
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
 * Navigates to a specific subpage view, adds it to history, and injects fresh storage data.
 * @param {string} page - The target page file prefix string.
 * @returns {Promise<void>}
 */
async function navigateTo(page) {
  if (pageHistory[pageHistory.length - 1] !== page) pageHistory.push(page);
  await loadTemplate('mainContent', `./${page}.html`);

  // KORREKTUR: Daten werden JETZT geladen, BEVOR die init-Skripte der Unterseiten feuern!
  const currentData = await syncPageData(page);

  if (page === 'summary' && typeof window.initDashboard === 'function')
    window.initDashboard(currentData);
  if (page === 'board' && typeof window.initBoard === 'function')
    window.initBoard(currentData);
  if (page === 'contacts' && typeof window.initContacts === 'function')
    window.initContacts(currentData);
  if (page === 'add-task' && typeof window.initAddTask === 'function')
    window.initAddTask();
}

/**
 * Core function syncing backend database values with newly loaded DOM context containers.
 * KORREKTUR: Gibt das geladene Array zurück, damit navigateTo() es direkt an das Board übergeben kann.
 * @param {string} page - The current page parameter identifier key.
 * @returns {Promise<Array>} The active datasets loaded from memory.
 */
async function syncPageData(page) {
  if (page === 'summary' || page === 'board') {
    const tasks = await loadData('tasks');
    if (typeof window.renderBoardTasks === 'function')
      window.renderBoardTasks(tasks);
    return tasks;
  }
  if (page === 'contacts') {
    const contacts = await loadData('contacts');
    if (typeof window.renderContactList === 'function')
      window.renderContactList(contacts);
    return contacts;
  }
  return [];
}

/**
 * Returns to the previous page in history view stack or handles login redirection fallback layout.
 */
export function goBack() {
  if (window.location.pathname.includes('loginlayout.html')) {
    sessionStorage.setItem('skipIntroAnimation', 'true');
    return (window.location.href = '../index.html');
  }
  if (pageHistory.length > 1) {
    pageHistory.pop();
    loadTemplate(
      'mainContent',
      `./${pageHistory[pageHistory.length - 1]}.html`,
    );
  } else {
    loadTemplate('mainContent', './summary.html');
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
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isGuest');
  localStorage.removeItem('currentUserId');
  window.location.href = '../index.html';
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
  if (page === 'imprint')
    document.getElementById('menuLegalLogin')?.classList.add('active');
  if (page === 'privacy')
    document.getElementById('menuPrivacyLogin')?.classList.add('active');
}

/** @section GLOBAL EXPORTS FOR HTML ONCLICK */
window.initLayout = initLayout;
window.initLoginLayout = initLoginLayout;
window.navigateTo = navigateTo;
window.goBack = goBack;
window.setActiveNavItem = setActiveNavItem;
window.openHelp = openHelp;
window.logOut = logOut;
window.backToLogin = backToLogin;
window.turnOffBackarrow = turnOffBackarrow;
