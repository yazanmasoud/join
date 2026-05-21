import { auth, database } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set, get } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { hideOverlay, showOverlay } from './utils.js';
import { guestContacts, guestTasks } from './guest-data.js';
import { closeSignUp, clearSignupInputs } from './main.js';
import { getCurrentUserId, isGuestUser } from './storage.js';


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
    showSignupFailed(); //hier müssen die Fehlercodes ausgewertet und angezeigt werden.
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


// get signup information and start signup flow
async function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  await registerUser(name, email, password);
}


export async function loginAsUser(email, password) {
  localStorage.clear();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem('isGuest', 'false');
    localStorage.setItem('currentUserId', userCredential.user.uid);
    loginSuccess('Logged in as User!');
    // hier kann man später if (error.code === 'auth/wrong-password') {} verwenden statt catch(error)
  } catch (error) {
    console.error(error);
    showWrongCredentials();
  }
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
  localStorage.setItem(
    'currentUser',
    JSON.stringify({ name: 'Guest', email: 'guest@test.de' }),
  );
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


//holt die input werte
async function handleLogin() {
  const email = document.getElementById('email').value;
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


window.loginAsGuest = loginAsGuest;
window.loginAsUser = loginAsUser;
window.handleLogin = handleLogin;
window.registerUser = registerUser;
window.handleSignup = handleSignup;