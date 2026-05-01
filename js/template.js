function getPriorityButtonsHTML() {
  return `
    <button type="button" class="prio-btn color-urgent" id="prioUrgent" onclick="setPriority('Urgent')">
      Urgent <img src="../assets/icons/prio-urgent-icon.svg">
    </button>
    <button type="button" class="prio-btn color-medium" id="prioMedium" onclick="setPriority('Medium')">
      Medium <img src="../assets/icons/prio-medium-icon.svg">
    </button>
    <button type="button" class="prio-btn color-low" id="prioLow" onclick="setPriority('Low')">
      Low <img src="../assets/icons/prio-low-icon.svg">
    </button>`;
}

function getOptionHTML(value) {
  return `<option value="${value}">${value}</option>`;
}

function getSelectOptionsHTML(optionsArray, defaultText) {
  const defaultOption = `<option value="" disabled selected>${defaultText}</option>`;
  const allOptions = optionsArray.map((opt) => getOptionHTML(opt)).join('');
  return defaultOption + allOptions;
}
