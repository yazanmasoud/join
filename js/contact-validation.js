export {
    isValidPhone, isValidContactName,
    isValidEmail, showContactPhoneError,
    clearContactPhoneError, clearContactNameError,
    clearContactEmailError, showContactNameError,
    showContactEmailError, validatePhoneInput,
    validateContactNameBlur, validateEmailBlur,
    validateEmailInput
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
 * Validates that an email address
 * has a valid format.
 *
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
    const trimmedEmail = email.trim();

    return (
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) &&
        !trimmedEmail.includes('..')
    );
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


/**
 * Validates contact name when
 * the input loses focus.
 */
function validateContactNameBlur() {
    const name = document.getElementById('contact-name').value;

    if (!name) return;

    if (!isValidContactName(name)) {
        showContactNameError();
        return;
    }

    clearContactNameError();
}


/**
 * Validates email when
 * the input loses focus.
 */
function validateEmailBlur() {
    const email = document.getElementById('contact-email').value;

    if (!email) return;

    if (!isValidEmail(email)) {
        showContactEmailError();
        return;
    }

    clearContactEmailError();
}


/**
 * Clears email error when
 * the email becomes valid.
 */
function validateEmailInput() {
    const email = document.getElementById('contact-email').value;

    if (isValidEmail(email)) {
        clearContactEmailError();
    }
}