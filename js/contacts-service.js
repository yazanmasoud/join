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


function getGuestContacts() {
  return JSON.parse(
    localStorage.getItem('guestContacts')
  ) || [];
}


function saveGuestContacts(contacts) {
  localStorage.setItem(
    'guestContacts',
    JSON.stringify(contacts)
  );
}


function generateLocalId() {
  return Date.now().toString();
}


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


export async function getContactById(contactId) {
  if (isGuestUser()) {
    const contacts = getGuestContacts();
    return contacts.find((contact) => contact.id === contactId);
  }
  const uid = auth.currentUser.uid;
  const snapshot = await get(ref(database, userContactPath(uid, contactId)));
  if (!snapshot.exists()) return null;
  return {
    id: contactId,
    ...snapshot.val(),
  };
}


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
