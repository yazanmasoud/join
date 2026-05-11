let contacts = [];

/**
 * Opens the add contact dialog with an animation effect.
 */
function openAddContact() {
    const dialog = document.getElementById("add-contact-popup");

    dialog.classList.remove("contact-dialog-open");

    dialog.showModal();

    setTimeout(() => {
        dialog.classList.add("contact-dialog-open");
    }, 10);
}

/**
 * Closes the add contact dialog
 * and removes the animation class.
 */
function closeAddContact() {
    const dialog = document.getElementById("add-contact-popup");
    dialog.classList.remove("contact-dialog-open");
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
    let name = document.getElementById("contact-name").value;
    let email = document.getElementById("contact-email").value;
    let phone = document.getElementById("contact-phone").value;

    let initials = getInitials(name);
    let color = getRandomColor();

    let contact = {
        name,
        email,
        phone,
        initials,
        color
    };

    contacts.push(contact);
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContacts();
}

/**
 * Renders all contacts into the contact list.
 * Contacts are grouped by the first letter
 * of their name.
 */
function renderContacts() {
    let list = document.getElementById("contact-list");
    list.innerHTML = "";
    let currentLetter = "";

    for (let i = 0; i < contacts.length; i++) {
        let contact = contacts[i];
        let firstLetter = contact.name[0].toUpperCase();

        if (firstLetter !== currentLetter) {
            renderContactLetter(list, firstLetter);
            currentLetter = firstLetter;
        }

        renderSingleContact(list, contact);
    }
}

/**
 * Renders a letter separator
 * for grouping contacts alphabetically.
 *
 * @param {HTMLElement} list - The contact list container
 * @param {string} letter - The current contact letter
 */
function renderContactLetter(list, letter) {
    list.innerHTML += `
        <div class="contact-letter-container">

            <div class="contact-letter">
                ${letter}
            </div>

            <div class="contact-divider"></div>

        </div>
    `;
}

/**
 * Renders a single contact item
 * into the contact list.
 *
 * @param {HTMLElement} list - The contact list container
 * @param {Object} contact - The contact object
 */
function renderSingleContact(list, contact) {
    list.innerHTML += `
        <div class="contact-item">
            <div class="contact-avatar" style="background-color: ${contact.color}">
                ${contact.initials}
            </div>

            <div>
                <div>${contact.name}</div>
                <div>${contact.email}</div>
            </div>
        </div>
    `;
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
    let words = name.trim().split(" ").filter(word => word !== "");

    if (words.length === 0) {
        return "";
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
        "#FF7A00",
        "#FF5EB3",
        "#6E52FF",
        "#9327FF",
        "#00BEE8",
        "#1FD7C1",
        "#FF745E",
        "#FFA35E",
        "#FF5E5E",
        "#FF5E9E"
    ];

    let randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}