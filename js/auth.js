// auth.js - Firebase Authentication helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


const firebaseConfig = YOUR_FIREBASE_CONFIG;
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
}
}


export async function logout() {
try {
await signOut(auth);
} catch (e) {
console.error("Logout failed", e);
}
}