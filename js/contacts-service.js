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


export async function getContacts() {
  if (isGuestUser()) {
    const storedGuestContacts = getGuestContacts();
    console.log('guest mode');
    if (storedGuestContacts.length) {
      return storedGuestContacts;
    }

    const snapshot = await get(
      ref(database, 'defaultGuestData/contacts')
    );
    console.log(snapshot.val());

    if (!snapshot.exists()) return [];

    const guestContacts = Object.entries(snapshot.val()).map(
      ([id, contact]) => ({
        id,
        ...contact,
        initials: getInitials(contact.name),
      })
    );

    saveGuestContacts(guestContacts);
    return guestContacts;
  }

  const uid = auth.currentUser.uid;
  const snapshot = await get(ref(database, `contacts/${uid}`));

  if (!snapshot.exists()) return [];

  return Object.entries(snapshot.val()).map(([id, contact]) => ({
    id,
    ...contact,
  }));
}


function getGuestContacts() {
  return JSON.parse(
    sessionStorage.getItem('guestContacts')
  ) || [];
}


function saveGuestContacts(contacts) {
  sessionStorage.setItem(
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

    const newContact = {
      id: generateLocalId(),
      ...contactData,
    };

    contacts.push(newContact);
    saveGuestContacts(contacts);

    return newContact;
  }

  const uid = auth.currentUser.uid;
  const newContactRef = push(ref(database, `contacts/${uid}`));

  await set(newContactRef, contactData);

  return {
    id: newContactRef.key,
    ...contactData,
  };
}


export async function getContactById(contactId) {
  if (isGuestUser()) {
    const contacts = getGuestContacts();

    return contacts.find(
      (contact) => String(contact.id) === String(contactId)
    );
  }

  const uid = auth.currentUser.uid;
  const snapshot = await get(
    ref(database, `contacts/${uid}/${contactId}`)
  );

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
      String(contact.id) === String(contactId)
        ? { ...contact, ...updatedData }
        : contact
    );

    saveGuestContacts(updatedContacts);
    return;
  }

  const uid = auth.currentUser.uid;

  await update(
    ref(database, `contacts/${uid}/${contactId}`),
    updatedData
  );
}


export async function deleteContact(contactId) {
  if (isGuestUser()) {
    const contacts = getGuestContacts();

    const filteredContacts = contacts.filter(
      (contact) => String(contact.id) !== String(contactId)
    );

    saveGuestContacts(filteredContacts);
    return;
  }

  const uid = auth.currentUser.uid;

  await remove(ref(database, `contacts/${uid}/${contactId}`));
}


export function listenToContacts(callback) {
  if (isGuestUser()) {
    callback(getGuestContacts());
    return;
  }

  const uid = auth.currentUser.uid;

  return onValue(ref(database, `contacts/${uid}`), (snapshot) => {
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