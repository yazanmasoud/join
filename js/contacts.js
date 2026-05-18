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

/**
 * Opens the add contact dialog with an animation effect.
 */
function openAddContact() {
    const sidebarImage = document.getElementById('contact-dialog-sidebar-image');
    const createSaveButton = document.getElementById('create-save-button');
    const cancelDelteButton = document.getElementById('cancel-delete-button');
    sidebarImage.src = '../assets/img/Frame-add-contact.png';
    createSaveButton.innerHTML = 'Create Contact';
    cancelDelteButton.innerHTML = 'Cancel';
    createSaveButton.classList.remove('save-button');
    openContactDialog();
}

function openEditContact() {
    const sidebarImage = document.getElementById('contact-dialog-sidebar-image');
    const createSaveButton = document.getElementById('create-save-button');
    const cancelDelteButton = document.getElementById('cancel-delete-button');

    sidebarImage.src = '../assets/img/Frame-edit-contact.png';
    createSaveButton.innerHTML = 'Save';
    cancelDelteButton.innerHTML = 'Delete';
    createSaveButton.classList.add('save-button');
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

    let initials = getInitials(name);
    let color = getRandomColor();

    let contact = {
        name,
        email,
        phone,
        initials,
        color,
    };

    contacts.push(contact);
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
    detailsContainer.innerHTML = getContactDetails(contact);
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