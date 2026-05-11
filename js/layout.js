let currentPage = null;
let previousPage = null;
const pageHistory = [];


async function loadTemplate(containerId, templatePath) {
  const container = document.getElementById(containerId);

  if (!container) return;

  const response = await fetch(templatePath);
  const html = await response.text();

  container.innerHTML = html;
}

function initLayout() {
  loadTemplate("headerContent", "../templates/header.html");
  loadTemplate("sidebarContent", "../templates/aside.html");
  loadTemplate("mainContent", "../pages/summary.html");
}

async function initLoginLayout() {
  await loadTemplate("headerLoginContent", "../templates/headerlogin.html");
  await loadTemplate("sidebarLoginContent", "../templates/asidelogin.html");

  const params = new URLSearchParams(window.location.search);
  const page = params.get("page") || "login";

  await loadTemplate("mainLoginContent", `../pages/${page}.html`);

  setActiveLoginNavFromUrl(page);
}

async function navigateTo(page) {
  const currentPage = pageHistory[pageHistory.length - 1];

  if (currentPage !== page) {
    pageHistory.push(page);
  }

  loadTemplate('mainContent', `../pages/${page}.html`);
  loadTemplate('mainLoginContent', `../pages/${page}.html`);
}

function goBack() {
    // Sonderfall: loginlayout.html
  if (window.location.pathname.includes("loginlayout.html")) {
    sessionStorage.setItem("skipIntroAnimation", "true");
    window.location.href = "../index.html";
    return;
  }
  if (pageHistory.length > 1) {
    pageHistory.pop();
    const previousPage = pageHistory[pageHistory.length - 1];
    loadTemplate('mainContent', `../pages/${previousPage}.html`);
  }
  //vergibt die Klasse "has-active-page" an den Body, damit das Hilfesymbol angezeigt wird, und entfernt die Klasse "help-open", damit das Hilfesymbol nicht mehr ausgeblendet wird
  document.body.classList.add('has-active-page');
  document.body.classList.remove('help-open');
}

// Ändert die Hintergundfarbe des Menüpunktes, der angeklickt wurde, und entfernt die Hintergundfarbe von den anderen Menüpunkten
function setActiveNavItem(clickedItem) {
  document.querySelectorAll('.nav-link').forEach(item => {
    item.classList.remove('active');
  });

  clickedItem.classList.add('active');

//vergibt die Klasse "has-active-page" an den Body, damit das Hilfesymbol angezeigt wird, und entfernt die Klasse "help-open", damit das Hilfesymbol nicht mehr ausgeblendet wird
  document.body.classList.add('has-active-page');
  document.body.classList.remove('help-open');
}

//Entfernt Menüppunkt Markierung beim öffnen der Hilfeseite
function openHelp() {
  document.querySelectorAll('.nav-link').forEach(item => {

    item.classList.remove('active');
  });

// vergibt die Klasse "help-open" an den Body, damit das Hilfesymbol ausgeblendet wird, und entfernt die Klasse "has-active-page", damit das Hilfesymbol nicht mehr angezeigt wird
  document.body.classList.add('help-open');
  document.body.classList.remove('has-active-page');
}

//öffnet das Dropdown-Menü, wenn auf den Avatar geklickt wird, und schließt es, wenn irgendwo anders auf der Seite geklickt wird
function toggleAvatarDropdown(event) {
  event.stopPropagation(); // verhindert sofortiges Schließen

  const dropdown = document.getElementById('avatarDropdown');
  dropdown.classList.toggle('open');
}

//schließt das Dropdown-Menü, wenn irgendwo anders auf der Seite geklickt wird
function closeAvatarDropdown() {
  const dropdown = document.getElementById('avatarDropdown');
  dropdown.classList.remove('open');
}

//function zum Ausloggen
function logOut() {
  // Hier können Sie die Logik zum Ausloggen implementieren, z.B. Token löschen, Session beenden, etc.
  console.log("User logged out");
  // Nach dem Ausloggen können Sie den Benutzer zur Login-Seite weiterleiten oder die Seite neu laden
  window.location.href = '../pages/login.html'; // Beispiel: Weiterleitung zur Login-Seite

  closeAvatarDropdown(); // schließt dropdown nach dem Ausloggen
}

// Funktion zum Zurückkehren zur Login-Seite
function backToLogin() {
  window.location.href = '../index.html'; // Weiterleitung zur Login-Seite
}

//funktion schalten den zurück Pfeil aus wenn nicht eingeloggt ist
function turnOffBackarrow() {
  const backArrow = document.querySelector('.backarrow-placeholder');
    backArrow.style.display = 'none';
}

// Funktion zum Setzen des aktiven Navigationspunkts basierend auf der URL
function setActiveLoginNavFromUrl(page) {
  document.querySelectorAll('.nav-link').forEach(item => {
    item.classList.remove('active');
  });

  if (page === "imprint") {
    document.getElementById("menuLegalLogin")?.classList.add("active");
  }

  if (page === "privacy") {
    document.getElementById("menuPrivacyLogin")?.classList.add("active");
  }
}
