import { getContacts} from './contacts-service.js';
import { getContactDetails, getSingleContact, getContactLetter } from './template.js';
import { openAddContact, closeAddContact, openEditContact, openDeleteDialog, closeDeleteDialog } from './contacts-dialog.js';
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

        getSingleContact(list, contact, i,
            String(contact.id) === String(selectedContactId)
        );
    }
}


/**
 * Renders the selected contact details.
 *
 * @param {number} index
 * @param {boolean} forceRender
 * @param {boolean} animate
 */
export function renderContactDetails(index, forceRender = false, animate = true) {
    const contact = contacts[index];

    if (!canRenderContact(contact, forceRender)) return;

    selectedContactId = contact.id;
    const detailsContainer = document.getElementById('contact-details');
    renderContacts();

    if (!animate) {
        renderContactHtml(detailsContainer, contact);
        return;
    }

    animateContactDetails(detailsContainer, contact);
}

/**
 * Checks whether a contact
 * should be rendered.
 *
 * @param {Object} contact - Contact object.
 * @param {boolean} forceRender - Forces rerender.
 * @returns {boolean} True if render is allowed.
 */
function canRenderContact(contact, forceRender) {
    return contact &&
        (forceRender ||
            String(contact.id) !== String(selectedContactId));
}


/**
 * Renders contact details
 * into the details container.
 *
 * @param {HTMLElement} detailsContainer
 * @param {Object} contact - Contact object.
 */
function renderContactHtml(detailsContainer, contact) {
    detailsContainer.innerHTML =
        getContactDetails(contact);
}


/**
 * Animates contact details
 * with slide transition.
 *
 * @param {HTMLElement} detailsContainer
 * @param {Object} contact - Contact object.
 */
function animateContactDetails(detailsContainer, contact) {
    if (detailsContainer.innerHTML.trim()) {
        animateExistingContact(detailsContainer, contact);
        return;
    }

    animateNewContact(detailsContainer, contact);
}


/**
 * Animates an already
 * rendered contact.
 *
 * @param {HTMLElement} detailsContainer
 * @param {Object} contact - Contact object.
 */
function animateExistingContact(detailsContainer, contact) {
    detailsContainer.classList.add('slide-out');

    setTimeout(() => {
        renderContactHtml(detailsContainer, contact);
        detailsContainer.classList.remove('slide-out');
        detailsContainer.classList.add('slide-in');

        requestAnimationFrame(() => detailsContainer.classList.remove('slide-in'));
    }, 300);
}


/**
 * Animates a newly
 * rendered contact.
 *
 * @param {HTMLElement} detailsContainer
 * @param {Object} contact - Contact object.
 */
function animateNewContact(detailsContainer, contact) {
    detailsContainer.classList.add('slide-in');
    renderContactHtml(detailsContainer, contact);

    requestAnimationFrame(() => detailsContainer.classList.remove('slide-in'));
}