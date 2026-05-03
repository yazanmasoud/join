/* ===== PAGE CHECK ===== */

const isLoginPage = document.getElementById("login");


/* ===== ANIMATION ===== */

function animateLogo(delay = 0) {
  const logo = document.getElementById("logo");
  const login = document.getElementById("login");

  if (!logo || !login || logo.classList.contains("shrink")) return;

  setTimeout(() => {
    logo.classList.add("shrink");

    const transitionMs = 700;
    const bufferMs = 120; // small buffer to ensure animation finished

    setTimeout(() => {
      logo.classList.add('final');
      login.classList.remove('hidden');
    }, transitionMs + bufferMs);

  }, delay);
}


/* ===== INIT ===== */

if (isLoginPage) {
  animateLogo(500);
}


/* ===== UI TOGGLE ===== */

function openSignUp() {
  const signup = document.getElementById("signup");
  const login = document.getElementById("login");

  if (!signup || !login) return;

  signup.classList.remove("hidden");
  login.classList.add("hidden");
}

function openLogin() {
  const signup = document.getElementById("signup");
  const login = document.getElementById("login");

  if (!signup || !login) return;

  signup.classList.add("hidden");
  login.classList.remove("hidden");
}

/* ===== VALIDATION CHECK ===== */

function checkUsername(username, errorText, errorBox) {
  if (username.value.trim() === "") {
    errorText.innerText = "Bitte Username eingeben";
    errorBox.classList.remove("hidden");
    return false;
  }
  return true;
}

function checkEmail(email, errorText, errorBox) {
  if (!email.value.includes("@")) {
    errorText.innerText = "Ungültige Email";
    errorBox.classList.remove("hidden");
    return false;
  }
  return true;
}

function checkPassword(password, confirmPassword, errorText, errorBox) {

  if (password.value === "" || confirmPassword.value === "") {
    errorText.innerText = "Bitte Passwort eingeben";
    errorBox.classList.remove("hidden");
    return false;
  }

  if (password.value !== confirmPassword.value) {
    errorText.innerText = "Passwörter stimmen nicht überein";
    errorBox.classList.remove("hidden");
    return false;
  }

  return true;
}

function checkPrivacy(privacy, errorText, errorBox) {
  if (!privacy.checked) {
    errorText.innerText = "Bitte akzeptiere die Privacy Policy";
    errorBox.classList.remove("hidden");
    return false;
  }
  return true;
}

function validateForm() {
  const username = document.getElementById("signup-username");
  const email = document.getElementById("signup-email");
  const password = document.getElementById("signup-password");
  const confirmPassword = document.getElementById("signup-confirm-password");
  const privacy = document.getElementById("privacy");
  const errorBox = document.getElementById("password-error");
  const errorText = document.getElementById("error-text");

  errorBox.classList.add("hidden");
  errorText.innerText = "";

  if (!checkUsername(username, errorText, errorBox)) return false;
  if (!checkEmail(email, errorText, errorBox)) return false;
  if (!checkPassword(password, confirmPassword, errorText, errorBox)) return false;
  if (!checkPrivacy(privacy, errorText, errorBox)) return false;

  return true;
}