// header.js
import { closeOpenElements } from './ui.js';

/**
 * Sets the visibility state of the profile avatar dropdown menu to visible/invisible.
 *
 * @param {Event} event - The triggered DOM click event.
 */
export function toggleAvatarDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById('avatarDropdown');
  if (!dropdown) {
    console.warn('Avatar dropdown element not found.');
    return;
  }
  const isOpen = dropdown.classList.contains('open');
  closeOpenElements();
  if (!isOpen) {
    dropdown.classList.add('open');
  }
}