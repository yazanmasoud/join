// Firebase-Konfiguration
const firebaseConfig = {
  apiKey: 'DEIN_API_KEY',
  authDomain: 'join-3169.firebaseapp.com',
  databaseURL:
    'https://join-3169-default-rtdb.europe-west1.firebasedatabase.app/',
  projectId: 'join-3169',
  storageBucket: 'join-3169.appspot.com',
  messagingSenderId: 'DEINE_ID',
  appId: 'DEINE_APP_ID',
};

// Firebase initialisieren
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
