/**
 * Firebase application configuration parameters mapping deployment resource targets.
 * @type {{apiKey: string, authDomain: string, databaseURL: string, projectId: string, storageBucket: string, messagingSenderId: string, appId: string}}
 */
const firebaseConfig = {
  apiKey: 'DEIN_API_KEY',
  authDomain: 'join-3169.firebaseapp.com',
  databaseURL:
    'https://join-3169-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'join-3169',
  storageBucket: 'join-3169.appspot.com',
  messagingSenderId: 'DEINE_ID',
  appId: 'DEINE_APP_ID',
};

// Initialisierung
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

/**
 * Global entry point instance reference for real-time Firebase Database transaction operations.
 * @type {firebase.database.Database}
 */
const database = firebase.database();
