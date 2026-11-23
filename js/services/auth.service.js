import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { auth } from "./firebase.js";

async function login(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

async function logout() {
  await signOut(auth);
}

function onUserChange(cb) {
  return onAuthStateChanged(auth, cb);
}

export const authService = { login, logout, onUserChange };
