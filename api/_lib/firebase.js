import admin from "firebase-admin";

let initialized = false;

export function getAdminApp() {
  if (initialized) return admin.app();

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured.");
  }

  const serviceAccount = JSON.parse(json);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  initialized = true;
  return admin.app();
}

export function getAuth() {
  return getAdminApp().auth();
}

export function getFirestore() {
  return getAdminApp().firestore();
}
