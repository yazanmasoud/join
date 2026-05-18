import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

/**
 * Firebase application configuration parameters mapping deployment resource targets.
 * @type {{apiKey: string, authDomain: string, databaseURL: string, projectId: string, storageBucket: string, messagingSenderId: string, appId: string}}
 */
const firebaseConfig = {
  apiKey: 'AIzaSyBb6CyWkDPNDZW6hFnKIFTKs8vdk-EWU8Q',
  authDomain: 'join-3169.firebaseapp.com',
  databaseURL:
    'https://join-3169-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'join-3169',
  storageBucket: 'join-3169.firebasestorage.app',
  messagingSenderId: '60415195264',
  appId: '1:60415195264:web:0f08ac935b01a66ab44e65',
};

/**
 * Initialized Firebase application instance.
 */
export const app = initializeApp(firebaseConfig);

/**
 * Firebase Realtime Database instance.
 */
export const database = getDatabase(app);

/**
 * Firebase Authentication instance.
 */
export const auth = getAuth(app);
