/** Shared Firebase modular imports (single SDK instance in the browser). */
export { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
export {
  getAuth,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  signInWithCustomToken,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
export {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
