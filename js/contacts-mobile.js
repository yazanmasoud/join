window.showMobileListView = showMobileListView;
window.toggleMobileActionMenu = toggleMobileActionMenu;
window.mobileEditContact = mobileEditContact;
window.mobileDeleteContact = mobileDeleteContact;


export function isMobile() {
    return window.innerWidth <= 1100;
}


export function showMobileDetailView() {
    document.querySelector('.contacts-page')?.classList.add('mobile-detail-active');
}


function showMobileListView() {
    document.querySelector('.contacts-page')?.classList.remove('mobile-detail-active');
    if (typeof window.resetSelection === 'function') window.resetSelection();
}


function toggleMobileActionMenu(event) {
    event?.stopPropagation();
    document.getElementById('mobile-action-menu')?.classList.toggle('open');
}


function closeMobileActionMenu() {
    document.getElementById('mobile-action-menu')?.classList.remove('open');
}


function mobileEditContact(contactId) {
    closeMobileActionMenu();
    window.openEditContact(contactId);
}


function mobileDeleteContact(contactId) {
    closeMobileActionMenu();
    window.openDeleteDialog(contactId);
}


export function updateMobileActionMenu(contactId) {
    const editBtn = document.getElementById('mobile-action-edit');
    const deleteBtn = document.getElementById('mobile-action-delete');
    if (editBtn) editBtn.onclick = () => mobileEditContact(contactId);
    if (deleteBtn) deleteBtn.onclick = () => mobileDeleteContact(contactId);
}
