const categoryOptions = ['Technical Task', 'User Story', 'Feature Task'];

const contactOptions = [
  'Maximilian Müller',
  'Sofia Schneider',
  'Benedikt Bauer',
];

/* ===== Local Storage Handling ===== */

function getStoredContacts() {
  if (isGuest()) {
    return JSON.parse(localStorage.getItem("guestContacts")) || [];
  }

  return contacts;
}

function getStoredTasks() {
  if (isGuest()) {
    return JSON.parse(localStorage.getItem("guestTasks")) || [];
  }

  return tasks;
}

/* renderContacts(getStoredContacts()); */
/* renderTasks(getStoredTasks()); */