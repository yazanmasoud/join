import { getInitials } from './utils.js';
import { createContact, deleteContact, updateContact } from './contacts-service.js';
import { contacts, currentEditContactId, setContacts, setSelectedContactId, renderContacts } from './contacts.js';
import { closeAddContact, closeDeleteDialog } from './contacts-dialog.js';
import { getContactDetails } from './template.js';
import { getRandomColor } from './utils.js';


export {
    handleCreateContact,
    handleDeleteContact,
    handleSaveContact,
    showToast
};


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

    setContacts(contacts.filter(contact => String(contact.id) !== String(contactId)));

    setSelectedContactId(null);

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
    setContacts(
        contacts.map(contact =>
            String(contact.id) === String(currentEditContactId)
                ? { ...contact, ...updatedData }
                : contact
        )
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
        contact => String(contact.id) === String(currentEditContactId));

    if (index !== -1) {
        setSelectedContactId(contacts[index].id);
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