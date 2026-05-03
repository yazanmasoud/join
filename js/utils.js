const CATEGORY_OPTIONS = ['Technical Task', 'User Story', 'Feature Task'];
const CONTACT_OPTIONS = [
  'Maximilian Müller',
  'Sofia Schneider',
  'Benedikt Bauer',
];

// Extrahiert den ersten Buchstaben des Vor- und Nachnamens und gibt sie in Großbuchstaben als Initialen zurück.
function getInitials(name) {
  if (!name || typeof name !== 'string') return '??';
  const parts = name.trim().split(' ');
  const first = parts[0]?.charAt(0) || '';
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

// Erzeugt basierend auf dem Namen einen eindeutigen Farbcode aus einer Liste, damit jeder Kontakt immer dieselbe Farbe behält.
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

// Erstellt einen Klassennamen wie "active-urgent", um die gewählte Priorität im CSS hervorzuheben.
function getPrioClass(prio) {
  return 'active-' + prio.toLowerCase();
}
// Entfernt Prioritäts-Statusklassen von den ausgewählten Elementen, um die visuelle Auswahl zurückzusetzen.
function clearActivePrioClasses(selector) {
  const btns = document.querySelectorAll(selector);
  btns.forEach((b) =>
    b.classList.remove('active-urgent', 'active-medium', 'active-low'),
  );
}
