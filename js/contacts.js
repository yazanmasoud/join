import { getInitials } from './utils.js';
import { renderAvatar, clearElementsByIds } from './ui.js';
import { getCurrentUserId } from './storage.js';
import { getContacts, createContact, deleteContact, updateContact } from './contacts-service.js';
import { getContactDetails, getSingleContact, getContactLetter } from './template.js';


export let contacts = [];
let currentEditContactId = null;
let selectedContactId = null;

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
    contacts.sort(
        (a, b) => a.name.localeCompare(b.name)
    );

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
 * Deletes a contact from Firebase and updates the local contacts array and UI.
 *
 * @async
 * @param {string} contactId - The Firebase ID of the contact to delete.
 */
async function handleDeleteContact(contactId) {
    await deleteContact(contactId);

    contacts = contacts.filter(
        contact =>
            contact.id !== contactId
    );
    selectedContactId = null;
    renderContacts();
    document.getElementById('contact-details').innerHTML = '';

    closeAddContact();
    showToast('Contact deleted');
}

/**
 * Saves the edited contact to Firebase,
 * updates the local contacts array and refreshes the UI.
 *
 * @async
 */
async function handleSaveContact() {
    const contact = getCurrentEditContact();
    const updatedData = getUpdatedContactData(contact);

    await updateContact(currentEditContactId, updatedData);
    updateLocalContact(updatedData);
    refreshUpdatedContactUI();
    
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
            contact.id === currentEditContactId
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
    let name = document.getElementById('contact-name').value;
    let email = document.getElementById('contact-email').value;
    let phone = document.getElementById('contact-phone').value;

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
        contact.id === currentEditContactId
            ? { ...contact, ...updatedData }
            : contact
    );
}


/**
 * Refreshes the contacts list,
 * updates the contact details view
 * and closes the contact dialog.
 */
function refreshUpdatedContactUI() {
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();

    const updatedIndex = contacts.findIndex(
        contact =>
            contact.id === currentEditContactId
    );

    renderContactDetails(updatedIndex);
    closeAddContact();
    showToast('Contact updated');
}


/**
 * Opens the contact dialog with
 * the opening animation.
 */
function openContactDialog() {
    const dialog = document.getElementById('add-contact-popup');

    dialog.classList.remove('contact-dialog-open');
    dialog.showModal();

    setTimeout(() => {
        dialog.classList.add('contact-dialog-open');
    }, 10);
}


/**
 * Closes the add contact dialog
 * and removes the animation class.
 */

function closeAddContact() {
    const dialog = document.getElementById('add-contact-popup');

    dialog.classList.remove('contact-dialog-open');

    setTimeout(() => {
        dialog.close();
    }, 120);
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


function getContactDialogElements() {
    return {
        sidebarImage: document.getElementById('contact-dialog-sidebar-image'),
        createSaveButton: document.getElementById('create-save-button'),
        cancelDeleteButton: document.getElementById('cancel-delete-button'),
        avatar: document.getElementById('contact-dialog-avatar'),
        avatarImg: document.getElementById('contact-dialog-avatar-img'),
        avatarInitials: document.getElementById('contact-dialog-avatar-initials'),
        nameInput: document.getElementById('contact-name'),
        emailInput: document.getElementById('contact-email'),
        phoneInput: document.getElementById('contact-phone')
    };
}


function openAddContact() {
    const elements = getContactDialogElements();

    elements.sidebarImage.src = '../assets/img/Frame-add-contact.png';
    elements.createSaveButton.innerHTML = 'Create Contact';
    elements.createSaveButton.onclick = handleCreateContact;
    elements.cancelDeleteButton.innerHTML = 'Cancel';
    elements.cancelDeleteButton.onclick = closeAddContact;
    elements.createSaveButton.classList.remove('save-button');
    elements.nameInput.value = '';
    elements.emailInput.value = '';
    elements.phoneInput.value = '';
    elements.avatarImg.style.display = 'block';
    elements.avatarInitials.style.display = 'none';
    elements.avatarInitials.innerHTML = '';
    elements.avatar.style.backgroundColor = '';

    openContactDialog();
}


function openEditContact(contactId) {
    const contact = contacts.find(contact => contact.id === contactId);
    currentEditContactId = contactId;
    const elements = getContactDialogElements();

    elements.sidebarImage.src = '../assets/img/Frame-edit-contact.png';
    elements.createSaveButton.innerHTML = 'Save';
    elements.createSaveButton.onclick = handleSaveContact;
    elements.cancelDeleteButton.innerHTML = 'Delete';
    elements.cancelDeleteButton.removeAttribute('onclick');
    elements.cancelDeleteButton.onclick = () => openDeleteDialog(contactId);
    elements.createSaveButton.classList.add('save-button');
    elements.nameInput.value = contact.name || '';
    elements.emailInput.value = contact.email || '';
    elements.phoneInput.value = contact.phone || '';
    elements.avatarImg.style.display = 'none';
    elements.avatarInitials.style.display = 'flex';
    elements.avatarInitials.innerHTML = contact.initials || '';
    elements.avatar.style.backgroundColor = contact.color || '#ccc';

    openContactDialog();
}


function openDeleteDialog(contactId) {
    const dialog = document.getElementById(
        'delete-confirm-dialog'
    );

    const confirmButton = document.getElementById(
        'confirm-delete-button'
    );

    confirmButton.onclick = () => {
        dialog.close();
        handleDeleteContact(contactId);
    };

    dialog.showModal();
}


function closeDeleteDialog() {
    document
        .getElementById('delete-confirm-dialog')
        .close();
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

        getSingleContact(list, contact, i, String(contact.id) === String(selectedContactId));
    }
}


/**
 * Renders the selected contact details
 * with smooth slide animation.
 *
 * @param {number} index - Selected contact index.
 */
function renderContactDetails(index) {
    const contact = contacts[index];
    selectedContactId = contact.id;

    const detailsContainer =
        document.getElementById('contact-details');
    renderContacts();

    if (detailsContainer.innerHTML.trim()) {
        detailsContainer.classList.add('slide-out');

        setTimeout(() => {
            detailsContainer.innerHTML = getContactDetails(contact);

            detailsContainer.classList.remove('slide-out');

            detailsContainer.classList.add('slide-in');

            requestAnimationFrame(() => { detailsContainer.classList.remove('slide-in'); });
        }, 300);

    } else {
        detailsContainer.classList.add('slide-in');

        detailsContainer.innerHTML = getContactDetails(contact);

        requestAnimationFrame(() => { detailsContainer.classList.remove('slide-in'); });
    }
}


/**
 * Returns a random color
 * from the predefined color array.
 *
 * @returns {string} A random hex color value
 */
function getRandomColor() {
    const colors = [
        '#FF7A00', '#FF5EB3', '#6E52FF',
        '#9327FF', '#00BEE8', '#1FD7C1',
        '#FF745E', '#FFA35E', '#FF5E5E',
        '#FF5E9E'];

    let randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}