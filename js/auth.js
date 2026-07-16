import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

import { auth } from "./firebase.js";

// Login
export async function login(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

// Logout
export async function logout() {
    return await signOut(auth);
}

// Cek apakah user sudah login
export function cekLogin(callback) {

    onAuthStateChanged(auth, (user) => {

        if (!user) {
            window.location.href = "admin.html";
            return;
        }

        if (callback) {
            callback(user);
        }

    });

}