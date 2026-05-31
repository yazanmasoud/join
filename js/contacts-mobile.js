window.showMobileListView = showMobileListView;
window.toggleMobileActionMenu = toggleMobileActionMenu;
window.mobileEditContact = mobileEditContact;
window.mobileDeleteContact = mobileDeleteContact;


/**
 * Returns true if the viewport is in mobile range.
 * @returns {boolean}
 */
export function isMobile() {
  return window.innerWidth <= 1100;
}


/**
 * Shows the contact detail panel on mobile.
 */
export function showMobileDetailView() {
  document.querySelector('.contacts-page')?.classList.add('mobile-detail-active');
}


/**
 * Returns to the contact list view on mobile and resets selection.
 */
function showMobileListView() {
  document.querySelector('.contacts-page')?.classList.remove('mobile-detail-active');
  if (typeof window.resetSelection === 'function') window.resetSelection();
}


/**
 * Toggles the mobile action menu open/closed.
 * @param {Event} event - The triggering event.
 */
function toggleMobileActionMenu(event) {
  event?.stopPropagation();
  document.getElementById('mobile-action-menu')?.classList.toggle('open');
}


/**
 * Closes the mobile action menu.
 */
function closeMobileActionMenu() {
  document.getElementById('mobile-action-menu')?.classList.remove('open');
}


/**
 * Closes the action menu and opens the edit dialog for a contact.
 * @param {string} contactId - The contact ID to edit.
 */
function mobileEditContact(contactId) {
  closeMobileActionMenu();
  window.openEditContact(contactId);
}


/**
 * Closes the action menu and opens the delete dialog for a contact.
 * @param {string} contactId - The contact ID to delete.
 */
function mobileDeleteContact(contactId) {
  closeMobileActionMenu();
  window.openDeleteDialog(contactId);
}


/**
 * Wires the mobile action menu buttons to the given contact.
 * @param {string} contactId - The contact ID to bind actions to.
 */
export function updateMobileActionMenu(contactId) {
  const editBtn = document.getElementById('mobile-action-edit');
  const deleteBtn = document.getElementById('mobile-action-delete');
  if (editBtn) editBtn.onclick = () => mobileEditContact(contactId);
  if (deleteBtn) deleteBtn.onclick = () => mobileDeleteContact(contactId);
}
