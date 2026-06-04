export {
    isValidPhone,
    isValidContactName,
    isValidEmail,
    showContactPhoneError,
    clearContactPhoneError,
    clearContactNameError,
    clearContactEmailError,
    showContactNameError,
    showContactEmailError,
    validatePhoneInput
};


/**
 * Validates that a phone number
 * contains numbers only.
 *
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
    return /^[0-9]+$/.test(phone.trim());
}


/**
 * Validates contact name — min. 3 chars, no leading space, not starting with digit.
 * @param {string} name
 * @returns {boolean}
 */
function isValidContactName(name) {
    return (
        name.trim().length >= 3 &&
        !name.startsWith(' ') &&
        !/^\d/.test(name)
    );
}


/**
 * Validates that an email address is non-empty and has a valid format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


/**
 * Shows phone validation error.
 */
function showContactPhoneError() {
    const input = document.getElementById('contact-phone');
    const error = document.getElementById('contact-phone-error');

    input.classList.add('input-error');
    error.textContent = 'Please enter numbers only';
    error.classList.add('visible');
}


/**
 * Shows name validation error.
 */
function showContactNameError() {
    const input = document.getElementById('contact-name');
    const error = document.getElementById('contact-name-error');

    input.classList.add('input-error');
    error.textContent =
        'Please enter a valid name';
    error.classList.add('visible');
}


/**
 * Shows the email validation error in the dialog.
 */
function showContactEmailError() {
    const input = document.getElementById('contact-email');
    const error = document.getElementById('contact-email-error');
    input.classList.add('input-error');
    if (error) { error.textContent = 'Please enter a valid email'; error.classList.add('visible'); }
}


/**
 * Clears phone validation error.
 */
function clearContactPhoneError() {
    const input = document.getElementById('contact-phone');
    const error = document.getElementById('contact-phone-error');

    input.classList.remove('input-error');
    error.textContent = '';
    error.classList.remove('visible');
}


/**
 * Clears name validation error.
 */
function clearContactNameError() {
    const input = document.getElementById('contact-name');
    const error = document.getElementById('contact-name-error');

    input.classList.remove('input-error');
    error.textContent = '';
    error.classList.remove('visible');
}


/**
 * Clears the email validation error in the dialog.
 */
function clearContactEmailError() {
    const input = document.getElementById('contact-email');
    const error = document.getElementById('contact-email-error');
    input.classList.remove('input-error');
    if (error) { error.textContent = ''; error.classList.remove('visible'); }
}


/**
 * Validates phone input live.
 */
function validatePhoneInput() {
    const phone = document.getElementById('contact-phone').value;

    if (!phone || isValidPhone(phone)) {
        clearContactPhoneError();
        return;
    }

    showContactPhoneError();
}