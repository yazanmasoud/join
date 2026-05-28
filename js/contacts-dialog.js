import {contacts, setCurrentEditContactId} from './contacts.js';

export {
    closeAddContact,
    openAddContact,
    openEditContact,
    openDeleteDialog,
    closeDeleteDialog
};

/**
 * Returns dialog elements.
 *
 * @returns {Object} Dialog elements.
 */
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
 * Opens the dialog
 * in create contact mode.
 */
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


/**
 * Closes the add contact dialog
 * and removes the animation class.
 */
function closeAddContact() {
    const dialog = document.getElementById('add-contact-popup');

    dialog.classList.remove('contact-dialog-open');

    setTimeout(() => {
        dialog.close();
    }, 125);
}


/**
 * Opens the dialog
 * in edit contact mode.
 *
 * @param {string} contactId - Contact ID.
 */
function openEditContact(contactId) {
    const contact = getContactById(contactId);

    if (!contact) return;

    setCurrentEditContactId(contactId);

    const elements = getContactDialogElements();

    setupEditDialog(elements, contact, contactId);
    openContactDialog();
}


/**
 * Returns a contact
 * by its ID.
 *
 * @param {string} contactId
 * @returns {Object|undefined}
 */
function getContactById(contactId) {
    return contacts.find(
        contact =>
            String(contact.id) ===
            String(contactId)
    );
}


/**
 * Configures the dialog
 * for edit mode.
 *
 * @param {Object} elements
 * @param {Object} contact
 * @param {string} contactId
 */
function setupEditDialog(elements, contact, contactId) {
    setupEditButtons(elements, contactId);
    fillEditInputs(elements, contact);

    elements.sidebarImage.src =
        '../assets/img/Frame-edit-contact.png';
}


/**
 * Configures edit
 * dialog buttons.
 *
 * @param {Object} elements
 * @param {string} contactId
 */
function setupEditButtons(elements, contactId) {
    elements.createSaveButton.innerHTML ='Save';

    elements.createSaveButton.onclick = handleSaveContact;

    elements.cancelDeleteButton.innerHTML ='Delete';

    elements.cancelDeleteButton.onclick = () => openDeleteDialog(contactId);

    elements.createSaveButton.classList.add('save-button');
}


/**
 * Fills edit dialog
 * with contact data.
 *
 * @param {Object} elements
 * @param {Object} contact
 */
function fillEditInputs(elements, contact) {
    elements.nameInput.value = contact.name || '';

    elements.emailInput.value = contact.email || '';

    elements.phoneInput.value = contact.phone || '';

    elements.avatarImg.style.display = 'none';

    elements.avatarInitials.style.display = 'flex';

    elements.avatarInitials.innerHTML = contact.initials || '';

    elements.avatar.style.backgroundColor = contact.color || '#ccc';
}


/**
 * Opens delete confirmation dialog.
 *
 * @param {string} contactId - Contact ID.
 */
function openDeleteDialog(contactId) {
    const dialog = document.getElementById('delete-confirm-dialog');
    const confirmButton = document.getElementById('confirm-delete-button');

    confirmButton.onclick = () => {
        dialog.close();
        handleDeleteContact(contactId);
    };

    dialog.showModal();
}


/**
 * Closes delete dialog.
 */
function closeDeleteDialog() {
    document.getElementById('delete-confirm-dialog').close();
}