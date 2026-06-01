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
 * Loads contacts from guest storage or the authenticated user's Firebase path.
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
  const snapshot = await get(
    ref(database, 'defaultGuestData/contacts')
  );
  const guestContacts = mapContacts(
    snapshot,
    true
  );
  saveGuestContacts(guestContacts);
  return guestContacts;
}


/**
 * Maps a Firebase contacts snapshot to an array of contact objects.
 *
 * @param {Object} snapshot - The Firebase snapshot to map.
 * @param {boolean} [withInitials=false] - Whether initials should be generated.
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
 * Reads guest contacts from local storage.
 *
 * @returns {Array} The stored guest contacts.
 */
function getGuestContacts() {
  return JSON.parse(
    localStorage.getItem('guestContacts')
  ) || [];
}


/**
 * Writes guest contacts to local storage.
 *
 * @param {Array} contacts - The guest contacts to store.
 * @returns {void}
 */
function saveGuestContacts(contacts) {
  localStorage.setItem(
    'guestContacts',
    JSON.stringify(contacts)
  );
}


/**
 * Creates a local timestamp-based contact ID.
 *
 * @returns {string} The generated local ID.
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
    const contacts = getGuestContacts();
    const newContact = {id: generateLocalId(),...contactData,};
    contacts.push(newContact);
    saveGuestContacts(contacts);

    return newContact;
  }
  const uid = auth.currentUser.uid;
  const newContactRef = push(ref(database, userContactsPath(uid)));
  await set(newContactRef, contactData);
  return {
    id: newContactRef.key,
    ...contactData,
  };
}


/**
 * Loads a single contact by ID from the active data source.
 *
 * @param {string} contactId - The contact ID to load.
 * @returns {Promise<Object|null>} The matching contact or null.
 */
export async function getContactById(contactId) {
  if (isGuestUser()) {
    const contacts = getGuestContacts();

    return contacts.find(
      (contact) => contact.id === contactId
    );
  }

  const uid = auth.currentUser.uid;
  const snapshot = await get(
    ref(database, userContactPath(uid, contactId))
  );

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
    const contacts = getGuestContacts();

    const updatedContacts = contacts.map((contact) =>
      contact.id === contactId
        ? { ...contact, ...updatedData }
        : contact
    );

    saveGuestContacts(updatedContacts);
    return;
  }

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
    const contacts = getGuestContacts();

    const filteredContacts = contacts.filter(
      (contact) => contact.id !== contactId
    );

    saveGuestContacts(filteredContacts);
    return;
  }

  const uid = auth.currentUser.uid;

  await remove(ref(database, userContactPath(uid, contactId)));
}


/**
 * Subscribes to contact changes and forwards the mapped contact list.
 *
 * @param {Function} callback - Receives the current contact array.
 * @returns {Function|void} Firebase unsubscribe function for authenticated users.
 */
export function listenToContacts(callback) {
  if (isGuestUser()) {
    callback(getGuestContacts());
    return;
  }

  const uid = auth.currentUser.uid;

  return onValue(ref(database, userContactsPath(uid)), (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const contactsArray = Object.entries(snapshot.val()).map(
      ([id, contact]) => ({
        id,
        ...contact,
      })
    );

    callback(contactsArray);
  });
}
