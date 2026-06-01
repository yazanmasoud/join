import { getContacts } from './contacts-service.js';
import { getContactDetails, getSingleContact, getContactLetter } from './template.js';
import { isMobile, showMobileDetailView, updateMobileActionMenu } from './contacts-mobile.js';
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
window.resetSelection = resetSelection;
window.handleCreateContact = handleCreateContact;
window.handleDeleteContact = handleDeleteContact;
window.handleSaveContact = handleSaveContact;


/**
 * Loads, sorts and renders the contacts page data.
 *
 * @returns {Promise<void>}
 */
export async function initContacts() {
    setSelectedContactId(null);
    contacts = await getContacts();
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();
}


/**
 * Replaces the module contact list state.
 *
 * @param {Array} newContacts - The new contacts array.
 * @returns {void}
 */
export function setContacts(newContacts) {
    contacts = newContacts;
}


/**
 * Stores the currently selected contact ID.
 *
 * @param {string|null} contactId - The selected contact ID.
 * @returns {void}
 */
export function setSelectedContactId(contactId) {
    selectedContactId = contactId;
}


/**
 * Stores the contact ID currently being edited.
 *
 * @param {string|null} contactId - The edit contact ID.
 * @returns {void}
 */
export function setCurrentEditContactId(contactId) {
    currentEditContactId = contactId;
}


/**
 * Clears the selected contact and re-renders the list.
 *
 * @returns {void}
 */
export function resetSelection() {
    selectedContactId = null;
    renderContacts();
}


/**
 * Renders all contacts into the contact list,
 * grouped by the first letter of their name.
 */
export function renderContacts() {
    const list = document.getElementById('contact-list');
    list.innerHTML = '';
    let currentLetter = '';

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const firstLetter = contact.name[0].toUpperCase();

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
 * Renders the selected contact details
 * with optional slide animation.
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

    if (isMobile()) {
        showMobileDetailView();
        updateMobileActionMenu(contact.id);
    }

    if (!animate) {
        renderContactHtml(detailsContainer, contact);
        return;
    }

    animateContactDetails(detailsContainer, contact);
}


/**
 * Returns true if the contact can be rendered.
 *
 * @param {Object} contact
 * @param {boolean} forceRender
 * @returns {boolean}
 */
function canRenderContact(contact, forceRender) {
    return contact &&
        (forceRender ||
            String(contact.id) !== String(selectedContactId));
}


/**
 * Writes contact HTML into the container.
 *
 * @param {HTMLElement} detailsContainer
 * @param {Object} contact
 */
function renderContactHtml(detailsContainer, contact) {
    detailsContainer.innerHTML = getContactDetails(contact);
}


/**
 * Runs the slide animation for contact details.
 *
 * @param {HTMLElement} detailsContainer
 * @param {Object} contact
 */
function animateContactDetails(detailsContainer, contact) {
    if (detailsContainer.innerHTML.trim()) {
        animateExistingContact(detailsContainer, contact);
        return;
    }

    animateNewContact(detailsContainer, contact);
}


/**
 * Slide-out → slide-in for an already rendered contact.
 *
 * @param {HTMLElement} detailsContainer
 * @param {Object} contact
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
 * Slide-in for a freshly rendered contact.
 *
 * @param {HTMLElement} detailsContainer
 * @param {Object} contact
 */
function animateNewContact(detailsContainer, contact) {
    detailsContainer.classList.add('slide-in');
    renderContactHtml(detailsContainer, contact);
    requestAnimationFrame(() => detailsContainer.classList.remove('slide-in'));
}
