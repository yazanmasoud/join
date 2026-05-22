import { guestContacts, guestTasks } from './guest-data.js';
import { showInputError, clearInputError } from './ui.js';

/**
 * DOM element indicating if the current view is the login interface.
 * @type {HTMLElement|null}
 */
const isLoginPage = document.getElementById('login');

/**
 * Applies the mobile splash layout styling and switches to the white logo variant.
 * @param {HTMLImageElement} logo - The logo image element.
 */
function setMobileSplash(logo) {
  if (!isMobile()) return;
  document.body.classList.add('mobile-splash');
  logo.src = './assets/logos/main-logo-white.svg';
}

/**
 * Removes the mobile splash layout styling and switches back to the default dark logo variant.
 * @param {HTMLImageElement} logo - The logo image element.
 */
function resetMobileSplash(logo) {
  if (!isMobile()) return;
  document.body.classList.remove('mobile-splash');
  logo.src = './assets/logos/main-logo.svg';
}

/**
 * Triggers the main interface entry logo scaling animation after an optional timeout delay.
 * @param {number} [delay=0] - The timeout trigger delay value in milliseconds.
 */
function animateLogo(delay = 0) {
  const logo = document.getElementById('logo');
  const login = document.getElementById('login');
  if (!logo || !login || logo.classList.contains('shrink')) return;
  setMobileSplash(logo);
  setTimeout(() => {
    resetMobileSplash(logo);
    login.classList.remove('hidden');
    const wrapper = document.querySelector('.content-wrapper');
    wrapper.classList.remove('is-loading');
    wrapper.classList.add('is-ready');
    logo.classList.add('shrink');
    finishLogoAnimation(logo, login);
  }, delay);
}

/**
 * Schedules the concluding transition phases of the logo scaling layout animation sequence.
 * @param {HTMLElement} logo - The logo graphics element container.
 * @param {HTMLElement} login - The login main interaction wrapper container.
 */
function finishLogoAnimation(logo, login) {
  const delay = 820;

  setTimeout(() => {
    activateFinalLogoState(logo, login);
    showMobileSignup();
  }, delay);
}

/**
 * Updates CSS configuration classes to establish the permanent non-animated resting state of the logo graphics.
 * @param {HTMLElement} logo - The logo graphics element container.
 * @param {HTMLElement} login - The login main interaction wrapper container.
 */
function activateFinalLogoState(logo, login) {
  const wrapper = document.querySelector('.content-wrapper');

  logo.classList.add('final');
  login.classList.remove('hidden');

  wrapper.classList.remove('is-loading');
  wrapper.classList.add('is-ready');
}

/**
 * Displays the specific contextual signup button row layout variants tailored for mobile viewport width states.
 */
function showMobileSignup() {
  const signupMobile = document.querySelector('.signup-container-mobile');

  if (isMobile() && signupMobile) {
    signupMobile.classList.add('visible');
  }
}


/**
 * Evaluates current browser window dimensions to determine if viewport behaves as mobile scale.
 * @returns {boolean} True if viewport width is less than or equal to 768px, false otherwise.
 */
function isMobile() {
  return window.innerWidth <= 768;
}

function initStartAnimation() {
  const wrapper = document.querySelector('.content-wrapper');
  const logo = document.getElementById('logo');
  const login = document.getElementById('login');
  if (!wrapper || !logo || !login) return;
  const animationAlreadyPlayed = sessionStorage.getItem('startAnimationPlayed');
  if (animationAlreadyPlayed) {
    showStartPageWithoutAnimation(wrapper, logo, login);
    return;
  }
  sessionStorage.setItem('startAnimationPlayed', 'true');
  animateLogo(500);
}


function showStartPageWithoutAnimation(wrapper, logo, login) {
  wrapper.classList.add('no-animation');
  logo.classList.add('no-animation');
  wrapper.classList.remove('is-loading');
  wrapper.classList.add('is-ready');
  login.classList.remove('hidden');
  logo.classList.add('shrink', 'final');
  showMobileSignup();
  requestAnimationFrame(() => {
    wrapper.classList.remove('no-animation');
    logo.classList.remove('no-animation');
  });
}


/**
 * Hides login interface input panels and switches viewport visibility focus onto signup configuration cards.
 */
function openSignUp() {
  const signupContainer = document.getElementById('signup-container');
  const signupContainerMobile = document.getElementById(
    'signup-container-mobile',
  );
  const signup = document.getElementById('signup');
  const login = document.getElementById('login');

  if (!signup || !login) return;

  signupContainer.classList.add('hidden');
  signupContainerMobile.classList.add('hidden');
  signup.classList.remove('hidden');
  login.classList.add('hidden');
}

/**
 * Resets the changes from openSignUp()
 */
export function closeSignUp() {
  const signupContainer = document.getElementById('signup-container');
  const signupContainerMobile = document.getElementById(
    'signup-container-mobile',
  );

  const signup = document.getElementById('signup');
  const login = document.getElementById('login');

  if (!signup || !login) return;

  signupContainer.classList.remove('hidden');
  signupContainerMobile.classList.remove('hidden');
  signup.classList.add('hidden');
  login.classList.remove('hidden');
}

/**
 * Hides active signup form fields and returns layout viewport visibility states back onto default login forms.
 */
function openLogin() {
  const signupContainer = document.getElementById('signup-container');
  const signupContainerMobile = document.getElementById(
    'signup-container-mobile',
  );
  const signup = document.getElementById('signup');
  const login = document.getElementById('login');

  if (!signup || !login) return;

  signupContainer.classList.remove('hidden');
  signupContainerMobile.classList.remove('hidden');
  signup.classList.add('hidden');
  login.classList.remove('hidden');
}


function checkUsername(username) {
  if (username.value.trim() === '') {
    showInputError('signup-username', 'error-text-signup-username', 'Please enter a username.');
    return false;
  }
  return true;
}


function checkPassword(password, confirmPassword) {
  if (!hasPassword(password)) return false;
  if (!hasValidPasswordLength(password)) return false;
  if (!hasConfirmPassword(confirmPassword)) return false;
  if (!passwordsMatch(password, confirmPassword)) return false;
  return true;
}


function hasPassword(password) {
  if (password.value.trim()) return true;
  showInputError('signup-password', 'error-text-signup-password', 'Please enter a password.');
  return false;
}


function hasValidPasswordLength(password) {
  if (password.value.length >= 6) return true;
  showInputError('signup-password', 'error-text-signup-password', 'Password must be at least 6 characters.');
  return false;
}


function hasConfirmPassword(confirmPassword) {
  if (confirmPassword.value.trim()) return true;
  showInputError('signup-confirm-password', 'error-text-confirm-password', 'Please confirm your password.');
  return false;
}


function passwordsMatch(password, confirmPassword) {
  if (password.value === confirmPassword.value) return true;
  showInputError('signup-confirm-password', 'error-text-confirm-password', 'Passwords do not match.');
  return false;
}


function checkPrivacy(privacy) {
  if (!privacy.checked) {
    privacy.classList.add('input-error');
    return false;
  }
  privacy.classList.remove('input-error');
  return true;
}


function isValidEmail(emailValue) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(emailValue);
}


function checkEmail(email) {
  const emailValue = email.value.trim();
  if (!emailValue) {
    showInputError('signup-email', 'error-text-signup-email', 'Please enter your email.');
    return false;
  }

  if (!isValidEmail(emailValue)) {
    showInputError('signup-email', 'error-text-signup-email', 'Invalid email address.');
    return false;
  }
  return true;
}


function validateForm() {
  clearSignupErrors();
  const username = document.getElementById('signup-username');
  const email = document.getElementById('signup-email');
  const password = document.getElementById('signup-password');
  const confirmPassword = document.getElementById('signup-confirm-password');
  const privacy = document.getElementById('privacy');
  const signupButton = document.getElementById('signup-button');
  const isValid =
    checkUsername(username) &&
    checkEmail(email) &&
    checkPassword(password, confirmPassword) &&
    checkPrivacy(privacy);
  signupButton.disabled = !isValid;
  return isValid;
}


/**
 * Cleares the Input fields after Signup
 **/
export function clearSignupInputs() {
  document.getElementById('signup-username').value = '';
  document.getElementById('signup-email').value = '';
  document.getElementById('signup-password').value = '';
  document.getElementById('signup-confirm-password').value = '';
  document.getElementById('privacy').checked = false;
}


function clearSignupErrors() {
  clearInputError('signup-username', 'error-text-signup-username');
  clearInputError('signup-email', 'error-text-signup-email');
  clearInputError('signup-password', 'error-text-signup-password');
  clearInputError('signup-confirm-password', 'error-text-confirm-password');
  const privacy = document.getElementById('privacy');
  if (privacy) {
    privacy.classList.remove('input-error');
  }
}


async function handleSignup(event) {
  event.preventDefault();

  if (!validateForm()) return;

  const name = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;

  await registerUser(name, email, password);
}


// Global verfügbare Schnittstellen für Ihre HTML-Attribute (onclick) registrieren
window.openSignUp = openSignUp;
window.openLogin = openLogin;
window.validateForm = validateForm;


if (isLoginPage) {
  initStartAnimation();
}