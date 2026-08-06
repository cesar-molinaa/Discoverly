
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";






// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {

  apiKey: "AIzaSyDwUNZyu7Gm9_vqLrFuxEfJ2aljgIaqlnQ",
  authDomain: "discoverly-17b1f.firebaseapp.com",
  projectId: "discoverly-17b1f",
  storageBucket: "discoverly-17b1f.firebasestorage.app",
  messagingSenderId: "115645177256",
  appId: "1:115645177256:web:fd2a74195312e82b54d19d"

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


export { app, db, auth };





