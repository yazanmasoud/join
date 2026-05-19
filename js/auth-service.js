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
import { guestContacts, guestTasks } from './guest-data.js';
import { showOverlay, hideOverlay } from './main.js'


/**
 * =========================
 * LOGIN
 * =========================
 */

/**
Perform the standard user login flow by showing a success overlay and redirecting.
Does not modify localStorage (intended for authenticated users).
@returns {void}
*/
async function loginAsUser() {
    const loginData = getLoginFormData();               // 1. Login Daten holen

    const isValid = validateLoginData(loginData);       // 2. Eingaben prüfen

    if (!isValid) return;

    try {
        const user = await loginUser(                   // 3. User authentifizieren
            loginData.email,
            loginData.password
        );

        persistLogin(user);                             // 4. Session speichern

        await loadUserAppData(user);                    // 5. Userdaten laden

        prepareGreeting(user);                          // 6. Greeting vorbereiten

        loginSuccess("Logged in successfully");         // 7. Erfolgs Overlay + Redirect

    } catch(error) {
        handleLoginError(error);
    }
}

function getLoginFormData() {
    return {
        email: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value.trim(),
    };
}

function validateLoginData(data) {
    if (!data.email || !data.password) {
        alert("Please enter email and password");
        return false;
    }
    return true;
}

function persistLogin(user) {

    localStorage.setItem('join_user_type', 'user');

    localStorage.setItem(
        'currentUser',
        JSON.stringify({
            uid: user.uid,
            email: user.email
        })
    );
}

async function loadUserAppData(user) {
    // später: contacts + tasks laden
}

function prepareGreeting(user) {

    localStorage.setItem(
        'userGreetingName',
        user.email
    );
}

function handleLoginError(error) {
    console.error(error);
    alert('Login failed');
}


/**
 * =========================
 * GUEST LOGIN
 * =========================
 */

/**
Initialize guest session data in localStorage (contacts, tasks, currentUser) and
perform the guest login flow by showing a success overlay and redirecting.
@returns {void}
*/
export async function loginAsGuest() {
   try {

        const guestData = {                // 1. Guest Daten laden
           contacts: guestContacts,
           tasks: guestTasks
        };

        initGuestSession(guestData)                  // 2. Guest Session in localStorage einrichten + Greeting vorbereiten

        loginSuccess("Logged in as Guest"); // 3. Weiterleitung

    } catch(error) {
        handleGuestLoginError(error);
    }
}

function initGuestSession(guestData) {
    localStorage.setItem(
        'contacts',
        JSON.stringify(guestData.contacts)
    );

    localStorage.setItem(
        'tasks',
        JSON.stringify(guestData.tasks)
    );

    localStorage.setItem('join_user_type', 'guest');
    localStorage.setItem('userGreetingName', 'Guest');
}

function handleGuestLoginError(error) {
    console.error(error);
    alert('Guest login failed');
}


/**
 * =========================
 * SIGNUP
 * =========================
 */

async function signUpUser() {
    const signupData = getSignupFormData();           // 1. Signup Daten holen
    const isValid = validateSignupData(signupData);   // 2. Eingaben prüfen

    if (!isValid) return;

    try {
        const user = await registerUser(              // 3. Firebase User erstellen
            signupData.name,
            signupData.email,
            signupData.password
        );

        persistLogin(user);                           // 4. Login persistieren 

        prepareSignupGreeting(signupData);            // 5. Greeting vorbereiten

        loginSuccess("You Signed Up successfully");   // 6. Erfolgs Overlay + Redirect

    } catch(error) {
        handleSignupError(error);
    }
}

function getSignupFormData() {
    return {
        name: document.getElementById('signup-username').value.trim(),
        email: document.getElementById('signup-email').value.trim(),
        password: document.getElementById('signup-password').value.trim(),
        confirmPassword: document.getElementById('signup-confirm-password').value.trim(),
    };
}

function validateSignupData(data) {

    if (!data.name) {
        alert("Please enter your name");
        return false;
    }

    if (!data.email) {
        alert("Please enter your email");
        return false;
    }

    if (!data.password || data.password.length < 6) {
        alert("Password must contain at least 6 characters");
        return false;
    }

    if (data.password !== data.confirmPassword) {
        alert("Passwords do not match");
        return false;
    }

    return true;
}

function prepareSignupGreeting(signupData) {
    localStorage.setItem(
        'userGreetingName',
        signupData.name
    );
}

function handleSignupError(error) {

    console.error(error);

    if (error.code === 'auth/email-already-in-use') {
        alert('Email already exists');
        return;
    }

    alert('Signup failed');
}


/**
 * =========================
 * LOGOUT
 * =========================
 */

export async function logoutUser() {
    await signOut(auth);
    localStorage.removeItem('join_user_type');
}


/**
 * =========================
 * FIREBASE HELPERS
 * =========================
 */

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
    createdAt: Date.now(),
    contacts: [],
    tasks: []
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


/**
 * =========================
 * UI SUCCESS FLOW
 * =========================
 */

function loginSuccess(message) {
  showOverlay(message);

  setTimeout(() => {
    hideOverlay();

    setTimeout(() => {
      window.location.href = './pages/layout.html?page=summary';
    }, 300);

  }, 1200);
}


/**
 * =========================
 * GLOBAL ACCESS
 * =========================
 */

window.loginAsGuest = loginAsGuest;
window.loginAsUser = loginAsUser;