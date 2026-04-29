function hideSpinner(delay = 0) {
  setTimeout(() => {
    const spinner = document.getElementById("spinner-container");
    if (spinner) {
      spinner.style.display = "none";
    }
  }, delay);
}

hideSpinner(4000);