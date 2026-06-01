import { auth, database } from './firebase-config.js';
import { getInitials } from './utils.js';

import {
  ref,
  get,
  set,
  update,
  push,
  remove,
  onValue,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

import { isGuestUser } from './storage.js';
import { userContactPath, userContactsPath } from './database-paths.js';


/**
 * Loads contacts from guest storage
 * or the authenticated user's Firebase path.
 *
 * @returns {Promise<Array>} The available contacts.
 */
export async function getContacts() {
  if (isGuestUser()) {
    return getGuestUserContacts();
  }

  const uid = auth.currentUser.uid;
  const snapshot = await get(
    ref(database, userContactsPath(uid))
  );

  return mapContacts(snapshot);
}


/**
 * Loads guest contacts from local storage or the default guest data.
 *
 * @returns {Promise<Array>} The guest contact list.
 */
async function getGuestUserContacts() {
  const storedGuestContacts = getGuestContacts();

  if (storedGuestContacts.length) {
    return storedGuestContacts;
  }

  return loadDefaultGuestContacts();
}


/**
 * Loads default guest contacts from Firebase.
 *
 * @returns {Promise<Array>} The guest contacts.
 */
async function loadDefaultGuestContacts() {
  const snapshot = await get(
    ref(database, 'defaultGuestData/contacts')
  );

  const guestContacts = mapContacts(snapshot, true);

  saveGuestContacts(guestContacts);
  return guestContacts;
}


/**
 * Maps a Firebase snapshot
 * to a contact array.
 *
 * @param {Object} snapshot - Firebase snapshot.
 * @param {boolean} [withInitials=false] - Adds initials if true.
 * @returns {Array} The mapped contacts.
 */
function mapContacts(snapshot, withInitials = false) {
  if (!snapshot.exists()) return [];

  return Object.entries(snapshot.val()).map(
    ([id, contact]) => ({
      id,
      ...contact,
      ...(withInitials && {
        initials: getInitials(contact.name),
      }),
    })
  );
}


/**
 * Reads guest contacts
 * from local storage.
 *
 * @returns {Array} The stored guest contacts.
 */
function getGuestContacts() {
  return JSON.parse(
    localStorage.getItem('guestContacts')
  ) || [];
}


/**
 * Stores guest contacts
 * in local storage.
 *
 * @param {Array} contacts - Guest contacts to store.
 */
function saveGuestContacts(contacts) {
  localStorage.setItem(
    'guestContacts',
    JSON.stringify(contacts)
  );
}


/**
 * Generates a local
 * timestamp-based ID.
 *
 * @returns {string} The generated ID.
 */
function generateLocalId() {
  return Date.now().toString();
}


/**
 * Creates a contact in guest storage or Firebase.
 *
 * @param {Object} contactData - The contact values to create.
 * @returns {Promise<Object>} The created contact including its ID.
 */
export async function createContact(contactData) {
  if (isGuestUser()) {
    return createGuestUserContact(contactData);
  }

  return createFirebaseContact(contactData);
}


/**
 * Creates a guest contact object.
 *
 * @param {Object} contactData
 * @returns {Object} The guest contact.
 */
function createGuestContact(contactData) {
  return {
    id: generateLocalId(),
    ...contactData,
  };
}


/**
 * Creates a guest contact and stores it locally.
 *
 * @param {Object} contactData
 * @returns {Object} The created guest contact.
 */
function createGuestUserContact(contactData) {
  const contacts = getGuestContacts();
  const newContact = createGuestContact(contactData);

  contacts.push(newContact);
  saveGuestContacts(contacts);

  return newContact;
}


/**
 * Creates a Firebase contact.
 *
 * @param {Object} contactData
 * @returns {Promise<Object>} The created contact.
 */
async function createFirebaseContact(contactData) {
  const uid = auth.currentUser.uid;
  const newContactRef = push(
    ref(database, userContactsPath(uid))
  );

  await set(newContactRef, contactData);

  return {
    id: newContactRef.key,
    ...contactData,
  };
}


/**
 * Loads a contact by ID
 * from guest storage or Firebase.
 *
 * @param {string} contactId - Contact ID.
 * @returns {Promise<Object|null>} The matching contact.
 */
export async function getContactById(contactId) {
  if (isGuestUser()) {
    const contacts = getGuestContacts();
    return contacts.find(
      (contact) => String(contact.id) === String(contactId));
  }
  const uid = auth.currentUser.uid;
  const snapshot = await get(ref(database, userContactPath(uid, contactId)));
  if (!snapshot.exists()) return null;
  return {
    id: contactId,
    ...snapshot.val(),
  };
}


/**
 * Updates a contact in guest storage or Firebase.
 *
 * @param {string} contactId - The contact ID to update.
 * @param {Object} updatedData - The changed contact values.
 * @returns {Promise<void>}
 */
export async function updateContact(contactId, updatedData) {
  if (isGuestUser()) {
    return updateGuestContact(
      contactId,
      updatedData
    );
  }

  return updateFirebaseContact(
    contactId,
    updatedData
  );
}


/**
 * Updates a guest contact.
 *
 * @param {string} contactId
 * @param {Object} updatedData
 */
function updateGuestContact(contactId, updatedData) {
  const contacts = getGuestContacts();

  const updatedContacts = contacts.map(
    (contact) =>
      String(contact.id) === String(contactId)
        ? { ...contact, ...updatedData }
        : contact
  );

  saveGuestContacts(updatedContacts);
}


/**
 * Updates a Firebase contact.
 *
 * @param {string} contactId
 * @param {Object} updatedData
 * @returns {Promise<void>}
 */
async function updateFirebaseContact(contactId, updatedData) {
  const uid = auth.currentUser.uid;

  await update(
    ref(database, userContactPath(uid, contactId)),
    updatedData
  );
}


/**
 * Deletes a contact from guest storage or Firebase.
 *
 * @param {string} contactId - The contact ID to delete.
 * @returns {Promise<void>}
 */
export async function deleteContact(contactId) {
  if (isGuestUser()) {
    return deleteGuestContact(contactId);
  }

  return deleteFirebaseContact(contactId);
}


/**
 * Deletes a guest contact.
 *
 * @param {string} contactId
 */
function deleteGuestContact(contactId) {
  const contacts = getGuestContacts();

  const filteredContacts = contacts.filter(
    (contact) =>
      String(contact.id) !== String(contactId)
  );

  saveGuestContacts(filteredContacts);
}


/**
 * Deletes a Firebase contact.
 *
 * @param {string} contactId
 * @returns {Promise<void>}
 */
async function deleteFirebaseContact(contactId) {
  const uid = auth.currentUser.uid;

  await remove(
    ref(database, userContactPath(uid, contactId))
  );
}


/**
 * Listens for contact changes and
 * returns updated contact data.
 *
 * @param {Function} callback - Receives the contact array.
 * @returns {Function|void} Firebase unsubscribe function for authenticated users.
 */
export function listenToContacts(callback) {
  if (isGuestUser()) {
    callback(getGuestContacts());
    return;
  }

  const uid = auth.currentUser.uid;

  return onValue(
    ref(database, userContactsPath(uid)),
    (snapshot) => callback(mapContacts(snapshot))
  );
}
