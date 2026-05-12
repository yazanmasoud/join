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

// Initialisierung
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

/**
 * Global entry point instance reference for real-time Firebase Database transaction operations.
 * @type {firebase.database.Database}
 */
const database = firebase.database();
const auth = firebase.auth();
