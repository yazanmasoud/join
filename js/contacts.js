import { renderAvatar, clearElementsByIds } from './ui.js';
import { getCurrentUserId } from './storage.js';
import { getContacts, createContact, deleteContact, updateContact } from './contacts-service.js';
import { getContactDetails, getSingleContact, getContactLetter } from './template.js';
import { openAddContact, closeAddContact, openEditContact,
         openDeleteDialog, closeDeleteDialog } from './contacts-dialog.js';
import { handleCreateContact, handleDeleteContact, handleSaveContact } from './contacts-actions.js';

export let contacts = [];
export let currentEditContactId = null;
export let selectedContactId = null;

window.openAddContact = openAddContact;
window.closeAddContact = closeAddContact;
window.getContactDetails = getContactDetails;
window.renderContactDetails = renderContactDetails;
window.openEditContact = openEditContact;
window.openDeleteDialog = openDeleteDialog;
window.closeDeleteDialog = closeDeleteDialog;
window.handleCreateContact = handleCreateContact;
window.handleDeleteContact = handleDeleteContact;
window.handleSaveContact = handleSaveContact;

export async function initContacts() {
    contacts = await getContacts();
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();
}


export function setContacts(newContacts) {
    contacts = newContacts;
}


export function setSelectedContactId(contactId) {
    selectedContactId = contactId;
}


export function setCurrentEditContactId(contactId) {
    currentEditContactId = contactId;
}


/**
 * Renders all contacts into the contact list.
 * Contacts are grouped by the first letter
 * of their name.
 */
export function renderContacts() {
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
export function renderContactDetails(index, forceRender = false, animate = true) {
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
export function getRandomColor() {
    const colors = [
        '#FF7A00', '#FF5EB3', '#6E52FF',
        '#9327FF', '#00BEE8', '#1FD7C1',
        '#FF745E', '#FFA35E', '#FF5E5E',
        '#FF5E9E'
    ];

    let randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}