function hideSpinner(delay = 0) {
  setTimeout(() => {
    const spinner = document.getElementById("spinner-container");
    if (spinner) {
      spinner.style.display = "none";
    }
  }, delay);
}

hideSpinner(1500);

function animateLogo(delay = 0) {
  const logo = document.querySelector(".logo-start");
  if (!logo) return;

  setTimeout(() => {
    logo.classList.add("shrink");
  }, delay);
}

animateLogo(1500);