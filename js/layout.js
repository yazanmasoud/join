async function loadTemplate(containerId, templatePath) {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container nicht gefunden: ${containerId}`);
    return;
  }

  try {
    const response = await fetch(templatePath);

    if (!response.ok) {
      throw new Error(`Template konnte nicht geladen werden: ${templatePath}`);
    }

    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error(error);
  }
}

function initLayout() {
  loadTemplate("headerContent", "../templates/header.html");
  loadTemplate("sidebarContent", "../templates/aside.html");
  loadTemplate("mainContent", "../pages/summary.html");
}

// Ändert die Hintergundfarbe des Menüpunktes, der angeklickt wurde, und entfernt die Hintergundfarbe von den anderen Menüpunkten
function setActiveNavItem(clickedItem) {
  document.querySelectorAll('.navLink').forEach(item => {
    item.classList.remove('active');
  });

  clickedItem.classList.add('active');
}