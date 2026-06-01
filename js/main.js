import { showInputError, clearInputError, closeSignUp, clearSignupInputs } from './ui.js';
import { registerUser } from './auth-service.js';


const isLoginPage = document.getElementById('login');
const wrapper = document.querySelector('.content-wrapper');

if (isLoginPage && wrapper) {
  initMainLoginPage();
}

/**
 * Initializes login page animation state and global form handlers.
 *
 * @returns {void}
 */
function initMainLoginPage() {
  const animationAlreadyPlayed = sessionStorage.getItem('startAnimationPlayed');
  if (animationAlreadyPlayed) {
    wrapper.classList.add('is-ready', 'no-animation');
  } else {
    wrapper.classList.add('is-loading');
  }

  initStartAnimation();

  window.openSignUp = openSignUp;
  window.openLogin = openLogin;
  window.validateForm = validateForm;
  window.handleSignup = handleSignup;
  window.closeSignUp = closeSignUp;
  window.clearSignupInputs = clearSignupInputs;
}


/**
 * Triggers the main interface entry logo scaling animation after an optional timeout delay.
 * @param {number} [delay=0] - The timeout trigger delay value in milliseconds.
 */
function animateLogo(delay = 0) {
  const logo = document.getElementById('logo');
  const login = document.getElementById('login');
  if (!logo || !login || logo.classList.contains('shrink')) return;
  setTimeout(() => {
    document.documentElement.classList.remove('skip-start-animation');
    document.documentElement.classList.remove('show-start-animation');
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
  logo.classList.add('final');
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


/**
 * Starts the login page intro animation once per browser session.
 *
 * @returns {void}
 */
function initStartAnimation() {
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


/**
 * Displays the login start page in its final state without replaying animation.
 *
 * @param {HTMLElement} wrapper - The page wrapper element.
 * @param {HTMLElement} logo - The logo element.
 * @param {HTMLElement} login - The login form container.
 * @returns {void}
 */
function showStartPageWithoutAnimation(wrapper, logo, login) {
  wrapper.classList.add('no-animation');
  logo.classList.add('no-animation');
  wrapper.classList.remove('is-loading');
  wrapper.classList.add('is-ready');
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
 * Returns from signup view to the login view.
 *
 * @returns {void}
 */
function openLogin() {
  closeSignUp();
}


/**
 * Validates the signup username input.
 *
 * @param {HTMLInputElement} username - The username input element.
 * @returns {boolean} True if the username is filled.
 */
function checkUsername(username) {
  if (username.value.trim() === '') {
    showInputError('signup-username', 'error-text-signup-username', 'Please enter a username.');
    return false;
  }
  return true;
}


/**
 * Validates password presence, length and confirmation match.
 *
 * @param {HTMLInputElement} password - The password input element.
 * @param {HTMLInputElement} confirmPassword - The confirmation input element.
 * @returns {boolean} True if all password checks pass.
 */
function checkPassword(password, confirmPassword) {
  if (!hasPassword(password)) return false;
  if (!hasValidPasswordLength(password)) return false;
  if (!hasConfirmPassword(confirmPassword)) return false;
  if (!passwordsMatch(password, confirmPassword)) return false;
  return true;
}


/**
 * Checks whether the signup password input is filled.
 *
 * @param {HTMLInputElement} password - The password input element.
 * @returns {boolean} True if a password is entered.
 */
function hasPassword(password) {
  if (password.value.trim()) return true;
  showInputError('signup-password', 'error-text-signup-password', 'Please enter a password.');
  return false;
}


/**
 * Checks whether the signup password reaches the minimum length.
 *
 * @param {HTMLInputElement} password - The password input element.
 * @returns {boolean} True if the password is long enough.
 */
function hasValidPasswordLength(password) {
  if (password.value.length >= 6) return true;
  showInputError('signup-password', 'error-text-signup-password', 'Password must be at least 6 characters.');
  return false;
}


/**
 * Checks whether the signup confirmation password is filled.
 *
 * @param {HTMLInputElement} confirmPassword - The confirmation input element.
 * @returns {boolean} True if confirmation is entered.
 */
function hasConfirmPassword(confirmPassword) {
  if (confirmPassword.value.trim()) return true;
  showInputError('signup-confirm-password', 'error-text-confirm-password', 'Please confirm your password.');
  return false;
}


/**
 * Checks whether password and confirmation password match.
 *
 * @param {HTMLInputElement} password - The password input element.
 * @param {HTMLInputElement} confirmPassword - The confirmation input element.
 * @returns {boolean} True if both values match.
 */
function passwordsMatch(password, confirmPassword) {
  if (password.value === confirmPassword.value) return true;
  showInputError('signup-confirm-password', 'error-text-confirm-password', 'Passwords do not match.');
  return false;
}


/**
 * Validates the signup privacy checkbox state.
 *
 * @param {HTMLInputElement} privacy - The privacy checkbox element.
 * @returns {boolean} True if privacy was accepted.
 */
function checkPrivacy(privacy) {
  if (!privacy.checked) {
    privacy.classList.add('input-error');
    return false;
  }
  privacy.classList.remove('input-error');
  return true;
}


/**
 * Validates the signup email input and shows feedback.
 *
 * @param {HTMLInputElement} email - The email input element.
 * @returns {boolean} True if the email is filled and valid.
 */
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


/**
 * Validates the complete signup form and updates the submit button state.
 *
 * @returns {boolean} True if all signup fields are valid.
 */
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
 * Clears all signup validation error states.
 *
 * @returns {void}
 */
export function clearSignupErrors() {
  clearInputError('signup-username', 'error-text-signup-username');
  clearInputError('signup-email', 'error-text-signup-email');
  clearInputError('signup-password', 'error-text-signup-password');
  clearInputError('signup-confirm-password', 'error-text-confirm-password');
  const privacy = document.getElementById('privacy');
  if (privacy) {
    privacy.classList.remove('input-error');
  }
}


/**
 * Handles signup form submission and starts account registration.
 *
 * @param {Event} event - The signup submit event.
 * @returns {Promise<void>}
 */
export async function handleSignup(event) {
  event.preventDefault();
  if (!validateForm()) return;
  const name = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  await registerUser(name, email, password);
}