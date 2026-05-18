import { auth, database } from './firebase-config.js';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  ref,
  set,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

import { initSummary } from './summary.js'

import { showOverlay, hideOverlay } from './main.js'

export async function registerUser(name, email, password) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  await set(ref(database, `users/${user.uid}`), {
    name,
    email,
  });

  return user;
}

export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  initSummary();

  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
  localStorage.removeItem('join_user_type');
}

/**
 * Initializes local storage parameters with imported fallback mock data arrays.
 */
function initGuestStorage() {
  localStorage.setItem('isGuest', 'true');
  localStorage.setItem('contacts', JSON.stringify(guestContacts));
  localStorage.setItem('tasks', JSON.stringify(guestTasks));
  localStorage.setItem(
    'currentUser',
    JSON.stringify({ name: 'Guest', email: 'guest@test.de' }),
  );
}

/**
 * Display a success overlay with the provided message, then navigate to the summary page.
 * @param {string} message - The success message to show in the overlay.
 * @returns {void}
 */
function loginSuccess(message) {
  showOverlay(message);

  setTimeout(() => {
    hideOverlay();

    setTimeout(() => {
      window.location.href = './pages/layout.html?page=summary';
      initLayout();
    }, 300);

  }, 1200);
}

/**
Initialize guest session data in localStorage (contacts, tasks, currentUser) and
perform the guest login flow by showing a success overlay and redirecting.
@returns {void}
*/
export async function loginAsGuest() {
  initGuestStorage();
  loginSuccess("Logged in as Guest!");
}

/**
Perform the standard user login flow by showing a success overlay and redirecting.
Does not modify localStorage (intended for authenticated users).
@returns {void}
*/
function loginAsUser() {
  loginSuccess("Logged in as User!");
}

window.loginAsGuest = loginAsGuest;
window.loginAsUser = loginAsUser;