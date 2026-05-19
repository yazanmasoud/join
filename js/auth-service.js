import { auth, database } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { hideOverlay, showOverlay } from './utils.js';
import { guestContacts, guestTasks } from './guest-data.js';


export async function registerUser(name, email, password) {
  try {
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

    await signOut(auth);

    showOverlay('Account created. Please log in.');

    return user;
  } catch (error) {
    console.error(error);
    showSignupFailed();   //hier der Platzhalter für die Loginfehleranzeige
  }
}


export async function loginAsUser(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);

    localStorage.setItem('isGuest', 'false');

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
  await signOut(auth);
  localStorage.clear();
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


window.loginAsGuest = loginAsGuest;
window.loginAsUser = loginAsUser;