import { auth, database } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { hideOverlay, showOverlay } from './utils.js';
import { guestContacts, guestTasks } from './guest-data.js';
import { getCurrentUserId, isGuestUser } from './storage.js';
import { showInputError, clearInputError, closeSignUp, clearSignupInputs } from './ui.js';


window.loginAsGuest = loginAsGuest;
window.loginAsUser = loginAsUser;
window.handleLogin = handleLogin;
window.registerUser = registerUser;
window.validateLoginEmail = validateLoginEmail;
window.validateLoginPassword = validateLoginPassword;
window.updateLoginButtonState = updateLoginButtonState;
window.isValidEmail = isValidEmail;


//handles the complete registration flow
export async function registerUser(name, email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await saveUserProfile(userCredential.user, name, email);
    await signOut(auth);
    handleSignupSuccess();
  } catch (error) {
    console.error(error);
    showSignupFailed();
    }
}


// saves the user profile to the database
async function saveUserProfile(user, name, email) {
  await set(ref(database, `users/${user.uid}`), {
    name,
    email,
  });
}


// resets the UI after successful signup
function handleSignupSuccess() {
  showOverlay('Account created. Please log in.');
  setTimeout(() => {
    hideOverlay();
  }, 2000);
  closeSignUp();
  clearSignupInputs();
}


export async function loginAsUser(email, password) {
  localStorage.clear();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('isGuest', 'false');
    localStorage.setItem('currentUserId', userCredential.user.uid);
    loginSuccess('Logged in as User!');
  } catch (error) {
    handleLoginError(error); // hier läuft gerade die error handling entwicklung
  }
}


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


// hier erstmal nur die Fehlercodes von Firebase. Dort muss dann auch
function handleLoginError(error) {
  const errors = {
    'auth/invalid-email': {
      input: 'email',
      text: 'error-text-email',
      message: 'Please enter a valid email address.',
    },
    'auth/invalid-credential': {
      input: 'password',
      text: 'error-text-password',
      message: 'Check your email and password. Please try again.',
    },
    'auth/user-not-found': {
      input: 'password',
      text: 'error-text-password',
      message: 'Check your email and password. Please try again.',
    },
    'auth/wrong-password': {
      input: 'password',
      text: 'error-text-password',
      message: 'Check your email and password. Please try again.',
    },
    'auth/too-many-requests': {
      input: 'password',
      text: 'error-text-password',
      message: 'Too many failed attempts. Please try again later.',
    },
    'auth/network-request-failed': {
      input: 'password',
      text: 'error-text-password',
      message: 'Network error. Please check your connection.',
    },
  };
  const currentError = errors[error.code];
  if (!currentError) {console.error(error);
    return;}
  showInputError(
    currentError.input,
    currentError.text,
    currentError.message
  );
}


export async function loginAsGuest() {
  initGuestStorage();
  loginSuccess('Logged in as Guest!');
}


export async function logoutUser() {
  if (!isGuestUser()) {
    await signOut(auth);
  }
  localStorage.clear();
  window.location.href = '../index.html';
}


function initGuestStorage() {
  localStorage.setItem('isGuest', 'true');
  localStorage.setItem('currentUserId', 'guest_user');
  localStorage.setItem('contacts', JSON.stringify(guestContacts));
  localStorage.setItem('tasks', JSON.stringify(guestTasks));
  localStorage.setItem('currentUser', JSON.stringify({ name: 'Guest', email: 'guest@test.de' }));
}


function loginSuccess(message) {
  showOverlay(message);
  setTimeout(() => {
    hideOverlay();
    setTimeout(() => {
      window.location.href = './pages/layout.html?page=summary';
    }, 300);
  }, 1200);
}


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
  const snapshot = await get(ref(database, `users/${uid}`));
  if (!snapshot.exists()) {
    throw new Error('Authenticated user data not found.');
  }
  return snapshot.val();
}


function isValidEmail(emailValue) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(emailValue);
}


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


function updateLoginButtonState() {
  const loginButton = document.getElementById('login-button');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const isValid = isValidEmail(email.value.trim()) && password.value.trim() !== '';
  loginButton.disabled = !isValid;
}