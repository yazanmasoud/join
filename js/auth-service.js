import { auth, database } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { hideOverlay, showOverlay, getInitials, getRandomColor } from './utils.js';
import { guestContacts, guestTasks } from './guest-data.js';
import { getCurrentUserId, isGuestUser } from './storage.js';
import { showInputError, clearInputError, closeSignUp, clearSignupInputs } from './ui.js';
import { userContactPath, userProfilePath } from './database-paths.js';


window.loginAsGuest = loginAsGuest;
window.loginAsUser = loginAsUser;
window.handleLogin = handleLogin;
window.registerUser = registerUser;
window.validateLoginEmail = validateLoginEmail;
window.validateLoginPassword = validateLoginPassword;
window.updateLoginButtonState = updateLoginButtonState;
window.isValidEmail = isValidEmail;


//handles the complete registration flow
/**
 * Creates a Firebase user account and stores the related profile data.
 *
 * @param {string} name - The display name entered during signup.
 * @param {string} email - The email address used for the account.
 * @param {string} password - The password used for the account.
 * @returns {Promise<void>}
 */
export async function registerUser(name, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await saveUserProfile(userCredential.user, name, email);
    await saveUserAsContact(userCredential.user, name, email);
    await signOut(auth);
    handleSignupSuccess();
  } catch (error) {
    handleSignupError(error);
  }
}


/**
 * Stores the registered user as an own contact entry.
 *
 * @param {Object} user - The authenticated Firebase user.
 * @param {string} name - The contact display name.
 * @param {string} email - The contact email address.
 * @returns {Promise<void>}
 */
async function saveUserAsContact(user, name, email) {
  await set(ref(database, userContactPath(user.uid, user.uid)), {
    id: user.uid,
    name,
    email,
    phone: '',
    color: getRandomColor(),
    initials: getInitials(name),
  });
}


/**
 * Displays the mapped signup validation error in the UI.
 *
 * @param {Object} error - The Firebase signup error object.
 * @returns {void}
 */
function handleSignupError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      showInputError('signup-email', 'error-text-signup-email', 'This email is already in use.');
      break;
    case 'auth/network-request-failed':
      showInputError('signup-email', 'error-text-signup-email', 'Network error. Please check your connection.');
      break;
    case 'auth/too-many-requests':
      showInputError('signup-email', 'error-text-signup-email', 'Too many attempts. Please try again later.');
      break;
    default: showInputError('signup-email', 'error-text-signup-email', 'Something went wrong. Please try again.');
  }
}


// saves the user profile to the database
/**
 * Saves the user profile data below the profile path.
 *
 * @param {Object} user - The authenticated Firebase user.
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address.
 * @returns {Promise<void>}
 */
async function saveUserProfile(user, name, email) {
  await set(ref(database, userProfilePath(user.uid)), {
    name,
    email,
  });
}


// resets the UI after successful signup
/**
 * Resets signup UI elements and shows the success overlay.
 *
 * @returns {void}
 */
function handleSignupSuccess() {
  showOverlay('Account created. Please log in.');
  setTimeout(() => {
    hideOverlay();
  }, 2000);
  closeSignUp();
  clearSignupInputs();
}


/**
 * Authenticates a regular user and initializes local session state.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<void>}
 */
export async function loginAsUser(email, password) {
  localStorage.clear();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('isGuest', 'false');
    localStorage.setItem('currentUserId', userCredential.user.uid);
    loginSuccess('Logged in as User!');
  } catch (error) {
    handleLoginError(error);
  }
}


/**
 * Validates the login email input and updates the error state.
 *
 * @returns {boolean} True if the email input is valid.
 */
export function validateLoginEmail() {
  const email = document.getElementById('email');
  const emailValue = email.value.trim();
  if (!emailValue) {
    showInputError('email', 'error-text-email', 'Please enter your email.');
    return false;
  }
  if (!isValidEmail(emailValue)) {
    showInputError('email', 'error-text-email', 'Invalid email address.');
    return false;
  }
  clearInputError('email', 'error-text-email');
  return true;
}


/**
 * Handles Firebase login errors and displays matching UI feedback.
 *
 * @param {Object} error - The Firebase login error object.
 * @returns {void}
 */
function handleLoginError(error) {
  const errors = {
    'auth/invalid-email': {input: 'email', text: 'error-text-email', message: 'Please enter a valid email address.'},
    'auth/invalid-credential': {input: 'password', text: 'error-text-password', message: 'Check your email and password. Please try again.'},
    'auth/user-not-found': {input: 'password', text: 'error-text-password', message: 'Check your email and password. Please try again.'},
    'auth/wrong-password': {input: 'password', text: 'error-text-password', message: 'Check your email and password. Please try again.'},
    'auth/too-many-requests': {input: 'password', text: 'error-text-password', message: 'Too many failed attempts. Please try again later.'},
    'auth/network-request-failed': {input: 'password', text: 'error-text-password', message: 'Network error. Please check your connection.'},
  };
  const currentError = errors[error.code];
  if (!currentError) {console.error(error);
    return;
  }
  showInputError(currentError.input, currentError.text, currentError.message);
}


/**
 * Starts a guest session and redirects into the application.
 *
 * @returns {Promise<void>}
 */
export async function loginAsGuest() {
  initGuestStorage();
  loginSuccess('Logged in as Guest!');
}


/**
 * Signs out the active user, clears session data and redirects to login.
 *
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  if (!isGuestUser()) {
    await signOut(auth);
  }
  localStorage.clear();
  window.location.href = '../index.html';
}


/**
 * Initializes local storage with default guest session data.
 *
 * @returns {void}
 */
function initGuestStorage() {
  localStorage.setItem('isGuest', 'true');
  localStorage.setItem('currentUserId', 'guest_user');
  localStorage.setItem('tasks', JSON.stringify(guestTasks));
  localStorage.setItem('currentUser', JSON.stringify({ name: 'Guest', email: 'guest@test.de' }));
}


/**
 * Shows a login success overlay and navigates to the summary page.
 *
 * @param {string} message - The success message shown in the overlay.
 * @returns {void}
 */
function loginSuccess(message) {
  sessionStorage.removeItem('mobileGreetingPlayed');
  showOverlay(message);
  setTimeout(() => {
    hideOverlay();
    setTimeout(() => {
      window.location.href = './pages/layout.html?page=summary';
    }, 300);
  }, 1200);
}


/**
 * Handles login form submission and starts user authentication.
 *
 * @param {Event} event - The login form submit event.
 * @returns {Promise<void>}
 */
async function handleLogin(event) {
  event.preventDefault();
  if (!validateLoginEmail() || !validateLoginPassword()) return;
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  await loginAsUser(email, password);
}


/**
 * Retrieves the authenticated user's database entry.
 * @returns {Object|null} User data object or null.
 */
export async function getCurrentUserData() {
  if (isGuestUser()) {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
  const uid = getCurrentUserId();
  const snapshot = await get(ref(database, userProfilePath(uid)));
  if (!snapshot.exists()) {
    throw new Error('Authenticated user data not found.');
  }
  return snapshot.val();
}


/**
 * Checks whether a value matches the expected email format.
 *
 * @param {string} emailValue - The email value to validate.
 * @returns {boolean} True if the value is a valid email address.
 */
function isValidEmail(emailValue) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(emailValue);
}


/**
 * Validates the login password input and updates the error state.
 *
 * @returns {boolean} True if the password input is filled.
 */
function validateLoginPassword() {
  const password = document.getElementById('password');
  if (!password.value.trim()) {
    showInputError(
      'password',
      'error-text-password',
      'Please enter your password.'
    );
    return false;
  }
  clearInputError('password', 'error-text-password');
  return true;
}


/**
 * Enables or disables the login button based on current login inputs.
 *
 * @returns {void}
 */
function updateLoginButtonState() {
  const loginButton = document.getElementById('login-button');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const isValid = isValidEmail(email.value.trim()) && password.value.trim() !== '';
  loginButton.disabled = !isValid;
}
