import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKp4-2xoqldMuhn5PzwBDVCZKG82mS6CY",
  authDomain: "absensi-sdit-9a872.firebaseapp.com",
  projectId: "absensi-sdit-9a872",
  storageBucket: "absensi-sdit-9a872.firebasestorage.app",
  messagingSenderId: "196616421068",
  appId: "1:196616421068:web:0b64690ce5dbdcdd77cc69",
  measurementId: "G-D015K9FE6M"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);