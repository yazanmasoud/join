import { renderAvatar, clearElementsByIds } from './ui.js';
import { getCurrentUserId } from './storage.js';
import { getContacts, createContact, deleteContact, updateContact } from './contacts-service.js';
import { getContactDetails, getSingleContact, getContactLetter } from './template.js';
import {openAddContact, closeAddContact, openEditContact, openDeleteDialog, closeDeleteDialog } from './contacts-dialog.js';

export let contacts = [];

export let currentEditContactId = null;

export function setCurrentEditContactId(contactId) {
    currentEditContactId = contactId;
}
export let selectedContactId = null;

window.openAddContact = openAddContact;
window.handleCreateContact = handleCreateContact;
window.closeAddContact = closeAddContact;
window.getContactDetails = getContactDetails;
window.renderContactDetails = renderContactDetails;
window.openEditContact = openEditContact;
window.handleDeleteContact = handleDeleteContact;
window.handleSaveContact = handleSaveContact;
window.openDeleteDialog = openDeleteDialog;
window.closeDeleteDialog = closeDeleteDialog;

export async function initContacts() {
    contacts = await getContacts();
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();
}

/**
 * Creates a new contact and
 * updates the contacts list and UI.
 *
 * @async
 */
async function handleCreateContact() {
    const contactData = getNewContactData();
    const savedContact = await createContact(contactData);

    addContactToList(savedContact);
    resetContactForm();
    closeAddContact();
    showToast('Contact successfully created');
}

/**
 * Reads the contact form inputs
 * and creates a new contact object.
 *
 * @returns {Object} The new contact data.
 */
function getNewContactData() {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;

    return {
        name,
        email,
        phone,
        initials: getInitials(name),
        color: getRandomColor()
    };
}

/**
 * Adds a contact to the contacts array,
 * sorts and re-renders the list.
 *
 * @param {Object} contact - The saved contact object.
 */
function addContactToList(contact) {
    contacts.push(contact);
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();
}

/**
 * Clears all contact dialog inputs.
 */
function resetContactForm() {
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-phone').value = '';
}

/**
 * Deletes a contact
 * and updates the UI.
 *
 * @async
 * @param {string} contactId - Contact ID.
 */
async function handleDeleteContact(contactId) {
    await deleteContact(contactId);

    contacts = contacts.filter(
        contact => String(contact.id) !== String(contactId)
    );

    selectedContactId = null;

    renderContacts();
    document.getElementById('contact-details').innerHTML = '';

    closeDeleteDialog();
    closeAddContact();
    showToast('Contact deleted');
}

/**
 * Saves edited contact data
 * and updates the UI.
 *
 * @async
 */
async function handleSaveContact() {
    const contact = getCurrentEditContact();

    if (!contact) return;

    const updatedData = getUpdatedContactData(contact);

    await updateContact(currentEditContactId, updatedData);

    refreshUpdatedContactUI(updatedData);
    closeAddContact();
    showToast('Contact updated');
}

/**
 * Returns the currently edited contact
 * from the contacts array.
 *
 * @returns {Object|undefined} The current contact object.
 */
function getCurrentEditContact() {
    return contacts.find(
        contact =>
            String(contact.id) ===
            String(currentEditContactId)
    );
}

/**
 * Reads the contact form inputs and
 * creates an updated contact data object.
 *
 * @param {Object} contact - The current contact object.
 * @returns {Object} The updated contact data.
 */
function getUpdatedContactData(contact) {
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const phone = document.getElementById('contact-phone').value;

    return {
        name,
        email,
        phone,
        initials: getInitials(name),
        color: contact.color
    };
}

/**
 * Updates the edited contact inside
 * the local contacts array.
 *
 * @param {Object} updatedData - The updated contact data.
 */
function updateLocalContact(updatedData) {
    contacts = contacts.map(contact =>
        String(contact.id) === String(currentEditContactId)
            ? { ...contact, ...updatedData }
            : contact
    );
}

/**
 * Updates the contact list
 * and details after saving.
 *
 * @param {Object} updatedData
 */
function refreshUpdatedContactUI(updatedData) {
    updateLocalContact(updatedData);
    renderContacts();

    const index = contacts.findIndex(
        contact =>
            String(contact.id) ===
            String(currentEditContactId)
    );

if (index !== -1) {
    selectedContactId = contacts[index].id;
    document.getElementById('contact-details').innerHTML =
        getContactDetails(contacts[index]);
}
}


/**
 * Shows a temporary toast message.
 *
 * @param {string} message - The toast text.
 */
function showToast(message) {
    const toast = document.getElementById('toast-message');

    toast.innerText = message;
    toast.classList.add('toast-message-show');

    setTimeout(() => {
        toast.classList.remove('toast-message-show');
    }, 2000);
}


/**
 * Renders all contacts into the contact list.
 * Contacts are grouped by the first letter
 * of their name.
 */
function renderContacts() {
    let list = document.getElementById('contact-list');
    list.innerHTML = '';
    let currentLetter = '';

    for (let i = 0; i < contacts.length; i++) {
        let contact = contacts[i];
        let firstLetter = contact.name[0].toUpperCase();

        if (firstLetter !== currentLetter) {
            getContactLetter(list, firstLetter);
            currentLetter = firstLetter;
        }

        getSingleContact(
            list,
            contact,
            i,
            String(contact.id) === String(selectedContactId)
        );
    }
}


/**
 * Renders the selected contact details
 * with smooth slide animation.
 *
 * @param {number} index - Selected contact index.
 * @param {boolean} forceRender - Forces rerender.
 */
function renderContactDetails(index, forceRender = false, animate = true) {
    const contact = contacts[index];

    if (!contact) return;

    if (!forceRender && String(contact.id) === String(selectedContactId)) {
        return;
    }

    selectedContactId = contact.id;

    const detailsContainer = document.getElementById('contact-details');

    renderContacts();

    if (!animate) {
        detailsContainer.innerHTML = getContactDetails(contact);
        return;
    }

    if (detailsContainer.innerHTML.trim()) {
        detailsContainer.classList.add('slide-out');

        setTimeout(() => {
            detailsContainer.innerHTML = getContactDetails(contact);
            detailsContainer.classList.remove('slide-out');
            detailsContainer.classList.add('slide-in');

            requestAnimationFrame(() => {
                detailsContainer.classList.remove('slide-in');
            });
        }, 300);
    } else {
        detailsContainer.classList.add('slide-in');
        detailsContainer.innerHTML = getContactDetails(contact);

        requestAnimationFrame(() => {
            detailsContainer.classList.remove('slide-in');
        });
    }
}

/**
 * Returns a random color
 * from the predefined color array.
 *
 * @returns {string} A random hex color value.
 */
function getRandomColor() {
    const colors = [
        '#FF7A00', '#FF5EB3', '#6E52FF',
        '#9327FF', '#00BEE8', '#1FD7C1',
        '#FF745E', '#FFA35E', '#FF5E5E',
        '#FF5E9E'
    ];

    let randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}