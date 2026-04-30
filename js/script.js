// Ändert die Hintergundfarbe des Menüpunktes, der angeklickt wurde, und entfernt die Hintergundfarbe von den anderen Menüpunkten
function setActiveNavItem(clickedItem) {
  document.querySelectorAll('.navItem').forEach(item => {
    item.classList.remove('active');
  });

  clickedItem.classList.add('active');
}

