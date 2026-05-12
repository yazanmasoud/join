/**
 * Initial fallback collection of standard mock contact records used during guest user sessions.
 * @type {Array<{id: number, name: string, email: string, phone: string, color: string}>}
 */
export const guestContacts = [
  {
    id: 1,
    name: 'Max Mustermann',
    email: 'max@test.de',
    phone: '015111111111',
    color: '#FF7A00',
  },
  {
    id: 2,
    name: 'Anna Becker',
    email: 'anna@test.de',
    phone: '015122222222',
    color: '#FF5EB3',
  },
  {
    id: 3,
    name: 'Leon Wagner',
    email: 'leon@test.de',
    phone: '015133333333',
    color: '#6E52FF',
  },
  {
    id: 4,
    name: 'Julia Hoffmann',
    email: 'julia@test.de',
    phone: '015144444444',
    color: '#9327FF',
  },
  {
    id: 5,
    name: 'Tim Schneider',
    email: 'tim@test.de',
    phone: '015155555555',
    color: '#00BEE8',
  },
  {
    id: 6,
    name: 'Laura Fischer',
    email: 'laura@test.de',
    phone: '015166666666',
    color: '#1FD7C1',
  },
  {
    id: 7,
    name: 'Paul Meyer',
    email: 'paul@test.de',
    phone: '015177777777',
    color: '#FF745E',
  },
  {
    id: 8,
    name: 'Sophie Klein',
    email: 'sophie@test.de',
    phone: '015188888888',
    color: '#FFA35E',
  },
  {
    id: 9,
    name: 'David Wolf',
    email: 'david@test.de',
    phone: '015199999999',
    color: '#FC71FF',
  },
  {
    id: 10,
    name: 'Marie Braun',
    email: 'marie@test.de',
    phone: '015110101010',
    color: '#FFC701',
  },
  {
    id: 11,
    name: 'Felix Koch',
    email: 'felix@test.de',
    phone: '015111212121',
    color: '#0038FF',
  },
  {
    id: 12,
    name: 'Nina Richter',
    email: 'nina@test.de',
    phone: '015113131313',
    color: '#C3FF2B',
  },
  {
    id: 13,
    name: 'Jonas Schulz',
    email: 'jonas@test.de',
    phone: '015114141414',
    color: '#4B4B4B',
  },
  {
    id: 14,
    name: 'Lisa Bauer',
    email: 'lisa@test.de',
    phone: '015115151515',
    color: '#2AD300',
  },
  {
    id: 15,
    name: 'Ben Hartmann',
    email: 'ben@test.de',
    phone: '015116161616',
    color: '#FF4646',
  },
];

/**
 * Default pipeline array of template boarding tasks generated dynamically to guide first-time platform users.
 * @type {Array<{id: number, title: string, description: string, assignedTo: number[], dueDate: string, priority: string, category: string, status: string, subtasks: Array<{title: string, done: boolean}>}>}
 */
export const guestTasks = [
  {
    id: 1,
    title: 'Willkommen bei Join',
    description: 'Erstelle deine erste Aufgabe und verschiebe sie im Board.',
    assignedTo: [1, 2],
    dueDate: '2026-05-20',
    priority: 'medium',
    category: 'User Story',
    status: 'todo',
    subtasks: [
      { title: 'Task öffnen', done: false },
      { title: 'Details lesen', done: false },
    ],
  },
  {
    id: 2,
    title: 'Kontakte kennenlernen',
    description: 'Sieh dir die Kontaktliste an und öffne ein Kontaktprofil.',
    assignedTo: [3],
    dueDate: '2026-05-22',
    priority: 'low',
    category: 'Technical Task',
    status: 'todo',
    subtasks: [
      { title: 'Kontaktliste öffnen', done: false },
      { title: 'Kontakt auswählen', done: false },
    ],
  },
  {
    id: 3,
    title: 'Board testen',
    description: 'Ziehe eine Aufgabe per Drag & Drop in eine andere Spalte.',
    assignedTo: [4, 5],
    dueDate: '2026-05-24',
    priority: 'urgent',
    category: 'User Story',
    status: 'todo',
    subtasks: [
      { title: 'Task auswählen', done: false },
      { title: 'Task verschieben', done: false },
    ],
  },
  {
    id: 4,
    title: 'Neue Aufgabe anlegen',
    description: 'Erstelle eine eigene Aufgabe mit Titel und Beschreibung.',
    assignedTo: [6],
    dueDate: '2026-05-25',
    priority: 'medium',
    category: 'Technical Task',
    status: 'todo',
    subtasks: [
      { title: 'Titel eingeben', done: false },
      { title: 'Speichern', done: false },
    ],
  },
  {
    id: 5,
    title: 'Prioritäten testen',
    description: 'Lege Aufgaben mit low, medium und urgent an.',
    assignedTo: [7, 8],
    dueDate: '2026-05-27',
    priority: 'low',
    category: 'User Story',
    status: 'todo',
    subtasks: [
      { title: 'Low anlegen', done: false },
      { title: 'Urgent anlegen', done: false },
    ],
  },
  {
    id: 6,
    title: 'Subtasks ausprobieren',
    description: 'Erstelle eine Aufgabe mit mehreren Unteraufgaben.',
    assignedTo: [9, 10],
    dueDate: '2026-05-30',
    priority: 'medium',
    category: 'Technical Task',
    status: 'todo',
    subtasks: [
      { title: 'Subtask 1', done: false },
      { title: 'Subtask 2', done: false },
    ],
  },
];
