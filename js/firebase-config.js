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

// Initialisierung im "alten" Stil (v8), passend zu deinen HTML-Skripten
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const auth = firebase.auth();
