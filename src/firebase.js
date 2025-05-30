// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config dari Firebase Console (punya kamu sendiri)
const firebaseConfig = {
  apiKey: "AIzaSyCVXqjqpxt-pVyt5ThN8BKcoMkfY3_U5eg",
  authDomain: "ucup-menjelajah-nusantara.firebaseapp.com",
  projectId: "ucup-menjelajah-nusantara",
  storageBucket: "ucup-menjelajah-nusantara.appspot.com",
  messagingSenderId: "568785507179",
  appId: "1:568785507179:web:830a8aa2c4d8376dba322e",
  measurementId: "G-5V4MRCQZLE"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // ✅ Tambahkan baris ini
const db = getFirestore(app);

export { auth, provider, db };
