/**
 * @file Template management script handling board cards, task details, and editor HTML strings.
 */
import { getContactDetails, getSingleContact, getContactLetter } from './template.js';

export let contacts = [];

export function initContacts() {
    console.log('Aktuell keine initContacts() Funktionen');
}

function openContactDialog() {
    const dialog = document.getElementById('add-contact-popup');

    dialog.classList.remove('contact-dialog-open');

    dialog.showModal();

    setTimeout(() => {
        dialog.classList.add('contact-dialog-open');
    }, 10);
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
    elements.cancelDeleteButton.innerHTML = 'Cancel';
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


function openEditContact(index) {
    const contact = contacts[index];
    const elements = getContactDialogElements();

    elements.sidebarImage.src = '../assets/img/Frame-edit-contact.png';
    elements.createSaveButton.innerHTML = 'Save';
    elements.cancelDeleteButton.innerHTML = 'Delete';
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

/**
 * Closes the add contact dialog
 * and removes the animation class.
 */
function closeAddContact() {
    const dialog = document.getElementById('add-contact-popup');
    dialog.classList.remove('contact-dialog-open');
    dialog.close();
}

/**
 * Creates a new contact object
 * from the input values and adds it
 * to the contacts array.
 * Afterwards the contacts get sorted
 * alphabetically and rendered again.
 */
function createContact() {
    let name = document.getElementById('contact-name').value;
    let email = document.getElementById('contact-email').value;
    let phone = document.getElementById('contact-phone').value;

    // if editing an existing contact, update it; otherwise create new
    const editing = window._editingContactIndex;
    let savedContactRef = null;
    if (editing !== undefined && editing !== null) {
        const existing = contacts[editing] || {};
        const newInitials = getInitials(name);
        existing.name = name;
        existing.email = email;
        existing.phone = phone;
        existing.initials = newInitials;
        // keep existing.color
        contacts[editing] = existing;
        savedContactRef = existing;
        window._editingContactIndex = null;
    } else {
        let initials = getInitials(name);
        let color = getRandomColor();
        let contact = { name, email, phone, initials, color };
        contacts.push(contact);
        savedContactRef = contact;
    }
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-email').value = '';
    document.getElementById('contact-phone').value = '';
    closeAddContact();
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

        getSingleContact(list, contact, i);
    }
}

function renderContactDetails(index) {
    const contact = contacts[index];
    const detailsContainer = document.getElementById('contact-details');
    detailsContainer.innerHTML = getContactDetails(contact, index);
}

/**
 * Generates initials from a contact name.
 * Returns the first letter of the first name
 * and the first letter of the last name.
 *
 * @param {string} name - The full contact name
 * @returns {string} The generated initials
 */
function getInitials(name) {
    let words = name
        .trim()
        .split(' ')
        .filter((word) => word !== '');

    if (words.length === 0) {
        return '';
    }

    if (words.length === 1) {
        return words[0][0].toUpperCase();
    }

    let firstLetter = words[0][0].toUpperCase();
    let lastLetter = words[words.length - 1][0].toUpperCase();

    return firstLetter + lastLetter;
}

/**
 * Returns a random color
 * from the predefined color array.
 *
 * @returns {string} A random hex color value
 */
function getRandomColor() {
    const colors = [
        '#FF7A00',
        '#FF5EB3',
        '#6E52FF',
        '#9327FF',
        '#00BEE8',
        '#1FD7C1',
        '#FF745E',
        '#FFA35E',
        '#FF5E5E',
        '#FF5E9E',
    ];

    let randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}
window.openAddContact = openAddContact;
window.createContact = createContact;
window.closeAddContact = closeAddContact;
window.getContactDetails = getContactDetails;
window.renderContactDetails = renderContactDetails;
window.openEditContact = openEditContact;