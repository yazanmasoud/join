window.showMobileListView = showMobileListView;
window.toggleMobileActionMenu = toggleMobileActionMenu;
window.mobileEditContact = mobileEditContact;
window.mobileDeleteContact = mobileDeleteContact;


/**
 * Checks whether the current viewport should use the mobile contacts layout.
 *
 * @returns {boolean} True if the viewport is within the mobile breakpoint.
 */
export function isMobile() {
    return window.innerWidth <= 1100;
}


/**
 * Activates the mobile contact detail view.
 *
 * @returns {void}
 */
export function showMobileDetailView() {
    document.querySelector('.contacts-page')?.classList.add('mobile-detail-active');
}


/**
 * Returns the mobile contacts view to the list state.
 *
 * @returns {void}
 */
function showMobileListView() {
    document.querySelector('.contacts-page')?.classList.remove('mobile-detail-active');
    if (typeof window.resetSelection === 'function') window.resetSelection();
}


/**
 * Toggles the mobile contact action menu.
 *
 * @param {Event} [event] - The triggering click event.
 * @returns {void}
 */
function toggleMobileActionMenu(event) {
    event?.stopPropagation();
    document.getElementById('mobile-action-menu')?.classList.toggle('open');
}


/**
 * Closes the mobile contact action menu.
 *
 * @returns {void}
 */
function closeMobileActionMenu() {
    document.getElementById('mobile-action-menu')?.classList.remove('open');
}


/**
 * Opens the edit dialog for a selected mobile contact.
 *
 * @param {string} contactId - The contact ID to edit.
 * @returns {void}
 */
function mobileEditContact(contactId) {
    closeMobileActionMenu();
    window.openEditContact(contactId);
}


/**
 * Opens the delete dialog for a selected mobile contact.
 *
 * @param {string} contactId - The contact ID to delete.
 * @returns {void}
 */
function mobileDeleteContact(contactId) {
    closeMobileActionMenu();
    window.openDeleteDialog(contactId);
}


/**
 * Assigns mobile action menu handlers for the selected contact.
 *
 * @param {string} contactId - The selected contact ID.
 * @returns {void}
 */
export function updateMobileActionMenu(contactId) {
    const editBtn = document.getElementById('mobile-action-edit');
    const deleteBtn = document.getElementById('mobile-action-delete');
    if (editBtn) editBtn.onclick = () => mobileEditContact(contactId);
    if (deleteBtn) deleteBtn.onclick = () => mobileDeleteContact(contactId);
}
