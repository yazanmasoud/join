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