function getPriorityButtonsHTML() {
  return `
    <button type="button" class="prio-btn" id="prioUrgent" onclick="setPriority('Urgent')">
      Urgent <img src="../assets/icons/prio-urgent-icon.svg">
    </button>
    <button type="button" class="prio-btn active-medium" id="prioMedium" onclick="setPriority('Medium')">
      Medium <img src="../assets/icons/prio-medium-icon.svg">
    </button>
    <button type="button" class="prio-btn" id="prioLow" onclick="setPriority('Low')">
      Low <img src="../assets/icons/prio-low-icon.svg">
    </button>`;
}
