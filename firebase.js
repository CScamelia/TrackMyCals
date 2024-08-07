// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBM57D0tMtfvW3Bjqw6pW-Ubd7K0CvzZwo',
  authDomain: 'fir-auth-11fad.firebaseapp.com',
  projectId: 'fir-auth-11fad',
  storageBucket: 'fir-auth-11fad.appspot.com',
  messagingSenderId: '718714853178',
  appId: '1:718714853178:web:b1fd0f2c9b4e6c32f56203',
};

// Initialize Firebase
const firebaseapp = initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage();

// Initialize Firebase Auth
const auth = getAuth();
// const auth = getAuth(app);

export { auth, db, storage };








