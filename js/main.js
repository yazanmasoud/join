import { initializeGuestData } from './storage.js';
import { auth } from './firebase-config.js';

const isLoginPage = document.getElementById('login');

/**
 * Sets the mobile splash screen state and switches the logo source.
 * @param {HTMLImageElement} logo - The logo element.
 */
function setMobileSplash(logo) {
  if (!isMobile()) return;
  document.body.classList.add('mobile-splash');
  logo.src = './assets/logos/main-logo-white.svg';
}

/**
 * Resets the mobile splash screen state and restores the default logo source.
 * @param {HTMLImageElement} logo - The logo element.
 */
function resetMobileSplash(logo) {
  if (!isMobile()) return;
  document.body.classList.remove('mobile-splash');
  logo.src = './assets/logos/main-logo.svg';
}

/**
 * Initializes and triggers the logo shrinking animation with a delay.
 * @param {number} [delay=0] - The delay in milliseconds.
 */
function animateLogo(delay = 0) {
  const logo = document.getElementById('logo');
  const login = document.getElementById('login');
  if (!logo || !login || logo.classList.contains('shrink')) return;
  setMobileSplash(logo);
  setTimeout(() => {
    resetMobileSplash(logo);
    logo.classList.add('shrink');
    finishLogoAnimation(logo, login);
  }, delay);
}

/**
 * Handles the steps required to finalize the logo animation.
 * @param {HTMLElement} logo - The logo element.
 * @param {HTMLElement} login - The login container element.
 */
function finishLogoAnimation(logo, login) {
  setTimeout(() => {
    activateFinalLogoState(logo, login);
    showMobileSignup();
    switchLogoToLayoutMode();
  }, 820);
}

/**
 * Applies final CSS classes to the logo and makes the login form visible.
 * @param {HTMLElement} logo - The logo element.
 * @param {HTMLElement} login - The login container element.
 */
function activateFinalLogoState(logo, login) {
  logo.classList.add('final');
  login.classList.remove('hidden');
}

/**
 * Displays the mobile signup container if the device is mobile.
 */
function showMobileSignup() {
  const signupMobile = document.querySelector('.signup-container-mobile');
  if (isMobile() && signupMobile) signupMobile.classList.add('visible');
}

/**
 * Activates the layout mode for the logo wrapper container.
 */
function switchLogoToLayoutMode() {
  setTimeout(() => {
    document.querySelector('.logo-wrap')?.classList.add('layout-mode');
  }, 700);
}

/**
 * Checks if the current window width corresponds to a mobile device view.
 * @returns {boolean} True if the view width is 768px or less.
 */
function isMobile() {
  return window.innerWidth <= 768;
}

if (isLoginPage) animateLogo(500);

/**
 * Switches the interface view from login to sign up.
 */
function openSignUp() {
  document.getElementById('signup-container')?.classList.add('hidden');
  document.getElementById('signup-container-mobile')?.classList.add('hidden');
  document.getElementById('signup')?.classList.remove('hidden');
  document.getElementById('login')?.classList.add('hidden');
}

/**
 * Switches the interface view from sign up to login.
 */
function openLogin() {
  document.getElementById('signup-container')?.classList.remove('hidden');
  document
    .getElementById('signup-container-mobile')
    ?.classList.remove('hidden');
  document.getElementById('signup')?.classList.add('hidden');
  document.getElementById('login')?.classList.remove('hidden');
}

/**
 * Logs in a temporary guest user and initializes default data.
 * @returns {Promise<void>}
 */
async function loginAsGuest() {
  localStorage.setItem('isGuest', 'true');
  localStorage.setItem('currentUser', JSON.stringify({ name: 'Guest' }));
  await initializeGuestData();
  redirectToLayout('summary');
}

/**
 * Logs in a user using Firebase email and password authentication.
 */
function loginAsUser() {
  const email = document.getElementById('username')?.value.trim();
  const password = document.getElementById('password')?.value;
  if (!email || !password) return;
  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      localStorage.setItem('isGuest', 'false');
      localStorage.setItem('currentUserId', userCredential.user.uid);
      localStorage.setItem(
        'currentUser',
        JSON.stringify({ name: userCredential.user.displayName || 'User' }),
      );
      redirectToLayout('summary');
    })
    .catch((error) => console.error('Login failed:', error.message));
}

/**
 * Redirects the browser window to the layout template page with a target destination query.
 * @param {string} destinationPage - The target page identifier.
 */
function redirectToLayout(destinationPage) {
  window.location.href = `./pages/layout.html?page=${destinationPage}`;
}

/**
 * Validates all register inputs in real-time on input.
 * @returns {boolean} True if form data is valid.
 */
function validateForm() {
  const u = document.getElementById('signup-username'),
    e = document.getElementById('signup-email');
  const p = document.getElementById('signup-password'),
    cp = document.getElementById('signup-confirm-password');
  const box = document.getElementById('password-error'),
    text = document.getElementById('error-text');
  if (!u || !e || !p || !cp || !box || !text) return false;
  box.classList.add('hidden');
  if (p.value !== cp.value) {
    text.innerText = 'Passwords do not match';
    box.classList.remove('hidden');
    return false;
  }
  return u.value.trim() !== '' && e.value.includes('@') && p.value.length >= 6;
}

/**
 * Registers a new user inside Firebase Authentication and mirrors initial guest tasks.
 * @param {Event} event - The native DOM Form submit event context.
 * @returns {Promise<void>}
 */
async function registerNewUser(event) {
  if (event) event.preventDefault();
  if (!validateForm()) return;
  const e = document.getElementById('signup-email').value.trim();
  const p = document.getElementById('signup-password').value;
  const n = document.getElementById('signup-username').value.trim();
  try {
    const cred = await auth.createUserWithEmailAndPassword(e, p);
    await cred.user.updateProfile({ displayName: n });
    localStorage.setItem('isGuest', 'false');
    localStorage.setItem('currentUserId', cred.user.uid);
    localStorage.setItem('currentUser', JSON.stringify({ name: n }));
    const { guestTasks, guestContacts } = await import('./guest-data.js');
    await firebase.database().ref(`${cred.user.uid}/tasks`).set(guestTasks);
    await firebase
      .database()
      .ref(`${cred.user.uid}/contacts`)
      .set(guestContacts);
    redirectToLayout('summary');
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
}

/** @section GLOBAL EXPORTS FOR HTML ONCLICK */
window.loginAsGuest = loginAsGuest;
window.loginAsUser = loginAsUser;
window.openSignUp = openSignUp;
window.openLogin = openLogin;
window.validateForm = validateForm;
window.registerNewUser = registerNewUser;
