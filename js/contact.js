/**
 * @file Template management script handling board cards, task details, and editor HTML strings.
 */
import {
  getContactDetails,
  getSingleContact,
  getContactLetter,
} from './template.js';
import { saveData } from './storage.js';

export let contacts = [];

/**
 * Initializes the contacts section with preloaded layout manager pipeline data.
 * @param {Array} preloadedContacts - Dataset array loaded from the storage layer.
 */
function initContacts(preloadedContacts) {
  contacts = Array.isArray(preloadedContacts)
    ? preloadedContacts
    : Object.values(preloadedContacts || []);
  contacts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  renderContacts();
}

/**
 * Opens the add contact dialog with an animation effect.
 */
function openAddContact() {
  const dialog = document.getElementById('add-contact-popup');
  if (!dialog) return;
  dialog.classList.remove('contact-dialog-open');
  dialog.showModal();
  setTimeout(() => dialog.classList.add('contact-dialog-open'), 10);
}

/**
 * Closes the add contact dialog and removes the animation class.
 */
function closeAddContact() {
  const dialog = document.getElementById('add-contact-popup');
  if (!dialog) return;
  dialog.classList.remove('contact-dialog-open');
  dialog.close();
}

/**
 * Creates a new contact object, pushes it to storage, and resets inputs.
 */
async function createContact() {
  let name = document.getElementById('contact-name').value;
  let email = document.getElementById('contact-email').value;
  let phone = document.getElementById('contact-phone').value;
  if (!name || !email) return;
  const color =
    typeof window.getRandomColor === 'function'
      ? window.getRandomColor()
      : '#FF7A00';
  contacts.push({ name, email, phone, initials: getInitials(name), color });
  contacts.sort((a, b) => name.localeCompare(b.name));
  await saveData('contacts', contacts);
  renderContacts();
  ['contact-name', 'contact-email', 'contact-phone'].forEach(
    (id) => (document.getElementById(id).value = ''),
  );
  closeAddContact();
}

/**
 * Renders all contacts into the contact list grouped alphabetically without duplicates.
 * KORREKTUR: Die Zuweisung von currentLetter verhindert doppelte Buchstaben-Köpfe!
 */
function renderContacts() {
  let list = document.getElementById('contact-list');
  if (!list) return;
  list.innerHTML = '';
  let currentLetter = '';
  contacts.forEach((contact, i) => {
    let firstLetter =
      contact.name && contact.name[0] ? contact.name[0].toUpperCase() : '?';
    if (firstLetter !== currentLetter) {
      getContactLetter(list, firstLetter);
      currentLetter = firstLetter; // Verhindert doppelte Buchstaben-Titel
    }
    if (!contact.initials || contact.initials === 'undefined')
      contact.initials = getInitials(contact.name || '');
    getSingleContact(list, contact, i);
  });
}

/**
 * Generates initials from a contact name safely.
 * @param {string} name - The full contact name
 * @returns {string} The generated initials
 */
function getInitials(name) {
  const words = name
    .trim()
    .split(' ')
    .filter((w) => w !== '');
  if (words.length === 0) return '';
  const first = words[0][0] || '';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** @section GLOBAL EXPORTS FOR HTML ONCLICK */
window.initContacts = initContacts;
window.renderContactList = renderContacts;
window.openAddContact = openAddContact;
window.createContact = createContact;
window.closeAddContact = closeAddContact;
window.getContactDetails = getContactDetails;
window.getInitials = getInitials;
