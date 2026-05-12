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
    switchLogoToLayoutMode();
  }, delay);
}

/**
 * Updates CSS configuration classes to establish the permanent non-animated resting state of the logo graphics.
 * @param {HTMLElement} logo - The logo graphics element container.
 * @param {HTMLElement} login - The login main interaction wrapper container.
 */
function activateFinalLogoState(logo, login) {
  logo.classList.add('final');
  login.classList.remove('hidden');
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
 * Transitions the logo container configuration wrapper into standard page flow layout positioning rules.
 */
function switchLogoToLayoutMode() {
  const logoWrap = document.querySelector('.logo-wrap');

  setTimeout(() => {
    logoWrap?.classList.add('layout-mode');
  }, 700);
}

/**
 * Evaluates current browser window dimensions to determine if viewport behaves as mobile scale.
 * @returns {boolean} True if viewport width is less than or equal to 768px, false otherwise.
 */
function isMobile() {
  return window.innerWidth <= 768;
}

if (isLoginPage) {
  animateLogo(500);
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

/**
 * Verifies if the username field contains characters and modifies error notifications accordingly.
 * @param {HTMLInputElement} username - The target username text field node.
 * @param {HTMLElement} errorText - The display container node for active validation warnings.
 * @param {HTMLElement} errorBox - The structural panel node wrapping warning alert components.
 * @returns {boolean} True if field is valid, false if entry is missing.
 */
function checkUsername(username, errorText, errorBox) {
  if (username.value.trim() === '') {
    errorText.innerText = 'please enter a username';
    errorBox.classList.remove('hidden');
    username.classList.add('error-input');
    return false;
  }
  username.classList.remove('error-input');
  return true;
}

/**
 * Assesses structural compliance of input text syntax against expected basic electronic mail formats.
 * @param {HTMLInputElement} email - The email input field node.
 * @param {HTMLElement} errorText - The display container node for active validation warnings.
 * @param {HTMLElement} errorBox - The structural panel node wrapping warning alert components.
 * @returns {boolean} True if valid structure, false if parameter checks fail.
 */
function checkEmail(email, errorText, errorBox) {
  if (!email.value.includes('@')) {
    errorText.innerText = 'Invalid email address';
    errorBox.classList.remove('hidden');
    email.classList.add('error-input');
    return false;
  }
  email.classList.remove('error-input');
  return true;
}

/**
 * Compares primary passphrase entries against duplicate verification entries to confirm characters align.
 * @param {HTMLInputElement} password - The primary password text input node.
 * @param {HTMLInputElement} confirmPassword - The double-check confirmation input field node.
 * @param {HTMLElement} errorText - The display container node for active validation warnings.
 * @param {HTMLElement} errorBox - The structural panel node wrapping warning alert components.
 * @returns {boolean} True if parameters match and contain data, false otherwise.
 */
function checkPassword(password, confirmPassword, errorText, errorBox) {
  if (password.value === '' || confirmPassword.value === '') {
    errorText.innerText = 'please enter a password';
    errorBox.classList.remove('hidden');
    password.classList.add('error-input');
    confirmPassword.classList.add('error-input');
    return false;
  }

  if (password.value !== confirmPassword.value) {
    errorText.innerText = 'Passwords do not match';
    errorBox.classList.remove('hidden');
    password.classList.add('error-input');
    confirmPassword.classList.add('error-input');
    return false;
  }

  password.classList.remove('error-input');
  confirmPassword.classList.remove('error-input');
  return true;
}

/**
 * Assures privacy terms authorization check boxes have been confirmed active before proceeding.
 * @param {HTMLInputElement} privacy - The target structural checkbox DOM node.
 * @param {HTMLElement} errorText - The display container node for active validation warnings.
 * @param {HTMLElement} errorBox - The structural panel node wrapping warning alert components.
 * @returns {boolean} True if checkbox is checked, false otherwise.
 */
function checkPrivacy(privacy, errorText, errorBox) {
  if (!privacy.checked) {
    errorText.innerText = 'Please accept the Privacy Policy';
    errorBox.classList.remove('hidden');
    const privacyCheckbox = document.getElementById('privacy');
    if (privacyCheckbox) privacyCheckbox.classList.add('error-input');
    return false;
  }
  const privacyCheckbox = document.getElementById('privacy');
  if (privacyCheckbox) privacyCheckbox.classList.remove('error-input');
  return true;
}

/**
 * Executes standard validation pipelines sequentially across all active registration signup input panels.
 * @returns {boolean} True if all input elements pass formatting metrics, false otherwise.
 */
function validateForm() {
  const username = document.getElementById('signup-username');
  const email = document.getElementById('signup-email');
  const password = document.getElementById('signup-password');
  const confirmPassword = document.getElementById('signup-confirm-password');
  const privacy = document.getElementById('privacy');
  const errorBox = document.getElementById('password-error');
  const errorText = document.getElementById('error-text');

  errorBox.classList.add('hidden');
  errorText.innerText = '';

  if (!checkUsername(username, errorText, errorBox)) return false;
  if (!checkEmail(email, errorText, errorBox)) return false;
  if (!checkPassword(password, confirmPassword, errorText, errorBox))
    return false;
  if (!checkPrivacy(privacy, errorText, errorBox)) return false;

  return true;
}

/**
 * Attaches guest authorization labels to active session contexts and triggers workspace redirections.
 */
function loginAsGuest() {
  sessionStorage.setItem('userStatus', 'guest');
  initGuestStorage();
  window.location.href = './pages/layout.html';
}

/**
 * Checks if current authentication parameters align with standard guest profiles.
 * @returns {boolean} True if current user session is flagged as guest, false otherwise.
 */
function isGuest() {
  return sessionStorage.getItem('userStatus') === 'guest';
}

/**
 * Seeds client local storage scopes with basic template structures when values are missing.
 */
function initGuestStorage() {
  if (!localStorage.getItem('guestContacts')) {
    localStorage.setItem('guestContacts', JSON.stringify(guestContacts));
  }

  if (!localStorage.getItem('guestTasks')) {
    localStorage.setItem('guestTasks', JSON.stringify(guestTasks));
  }
}

/**
 * Attaches standard profile tags onto runtime variables and boots layout viewport redirection routines.
 */
function loginAsUser() {
  sessionStorage.setItem('userStatus', 'user');
  window.location.href = './pages/layout.html';
}
