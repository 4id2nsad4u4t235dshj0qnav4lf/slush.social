// auth.js - Firebase Authentication helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbMi_EGObuHNg3hQ49ZwvG2xNKHKDjDas",
  authDomain: "slushsocial-ec21f.firebaseapp.com",
  projectId: "slushsocial-ec21f",
  storageBucket: "slushsocial-ec21f.firebasestorage.app",
  messagingSenderId: "154904967675",
  appId: "1:154904967675:web:a021c424b5afeb462a335e",
  measurementId: "G-EGHWV0WPXE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let currentUser = null;

export function getCurrentUser() {
  return currentUser;
}

export function listenForAuthChanges(callback) {
  onAuthStateChanged(auth, user => {
    currentUser = user;
    callback(user);
  });
}

export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error("Login failed", e);
    throw e;
  }
}

export async function logout() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Logout failed", e);
    throw e;
  }
}

export async function getIdToken() {
  if (!currentUser) return null;
  return await currentUser.getIdToken();
}