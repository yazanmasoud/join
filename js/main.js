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

animateLogo(500);

function openSignUp() {
  const signup = document.getElementById("signup");
  const login = document.getElementById("login");

  if (!signup || !login) return;

  signup.classList.remove("hidden"); // anzeigen
  login.classList.add("hidden");     // verstecken
}

function openLogin() {
  const signup = document.getElementById("signup");
  const login = document.getElementById("login");

  if (!signup || !login) return;

  signup.classList.add("hidden");    // verstecken
  login.classList.remove("hidden");  // anzeigen
}