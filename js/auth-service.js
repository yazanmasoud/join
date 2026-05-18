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

import { setGuestUser, setRegisteredUser } from './utils.js';
import { initGuestData } from './guest-storage.js';

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

  setRegisteredUser();

  return user;
}

export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  setRegisteredUser();

  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
  localStorage.removeItem('join_user_type');
}

export function loginAsGuest() {
  setGuestUser();
  initGuestData();
}