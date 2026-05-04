/* ===== PAGE CHECK ===== */

const isLoginPage = document.getElementById("login");


/* ===== ANIMATION ===== */
/*
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
*/
function setMobileSplash(logo) {
  if (!isMobile()) return;
  document.body.classList.add("mobile-splash");
  logo.src = "./assets/logos/main-logo-white.svg";
}

function resetMobileSplash(logo) {
  if (!isMobile()) return;
  document.body.classList.remove("mobile-splash");
  logo.src = "./assets/logos/main-logo.svg";
}

function animateLogo(delay = 0) {
  const logo = document.getElementById("logo");
  const login = document.getElementById("login");
  if (!logo || !login || logo.classList.contains("shrink")) return;

  setMobileSplash(logo);

  setTimeout(() => {
    resetMobileSplash(logo);
    logo.classList.add("shrink");
    finishLogoAnimation(logo, login);
  }, delay);
}

function finishLogoAnimation(logo, login) {
  const signupMobile = document.querySelector(".signup-container-mobile");
  const transitionMs = 700;
  const bufferMs = 120;

  setTimeout(() => {
    logo.classList.add("final");
    login.classList.remove("hidden");

    if (isMobile() && signupMobile) {
    signupMobile.classList.add("visible");
  }

  }, transitionMs + bufferMs);
}

/* ===== RESIZE HANDLER ===== */

function isMobile() {
  return window.innerWidth <= 768;
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
    username.classList.add('error-input');
    return false;
  }
  username.classList.remove('error-input');
  return true;
}

function checkEmail(email, errorText, errorBox) {
  if (!email.value.includes("@")) {
    errorText.innerText = "Ungültige Email";
    errorBox.classList.remove("hidden");
    email.classList.add('error-input');
    return false;
  }
  email.classList.remove('error-input');
  return true;
}

function checkPassword(password, confirmPassword, errorText, errorBox) {

  if (password.value === "" || confirmPassword.value === "") {
    errorText.innerText = "Bitte Passwort eingeben";
    errorBox.classList.remove("hidden");
    password.classList.add('error-input');
    confirmPassword.classList.add('error-input');
    return false;
  }

  if (password.value !== confirmPassword.value) {
    errorText.innerText = "Passwörter stimmen nicht überein";
    errorBox.classList.remove("hidden");
    password.classList.add('error-input');
    confirmPassword.classList.add('error-input');
    return false;
  }

  password.classList.remove('error-input');
  confirmPassword.classList.remove('error-input');
  return true;
}

function checkPrivacy(privacy, errorText, errorBox) {
  if (!privacy.checked) {
    errorText.innerText = "Bitte akzeptiere die Privacy Policy";
    errorBox.classList.remove("hidden");
    const privacyCheckbox = document.getElementById('privacy');
    if (privacyCheckbox) privacyCheckbox.classList.add('error-input');
    return false;
  }
  const privacyCheckbox = document.getElementById('privacy');
  if (privacyCheckbox) privacyCheckbox.classList.remove('error-input');
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


//Guest login simply redirects to the main layout page without authentication
function loginAsGuest() {
  window.location.href = './pages/layout.html';
}