import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

let persistenceSetupPromise: Promise<void> | null = null;

async function ensureAuthPersistence() {
  if (!auth) {
    throw new Error("Firebase Auth is not configured. Check environment variables.");
  }

  if (!persistenceSetupPromise) {
    persistenceSetupPromise = setPersistence(auth, browserLocalPersistence);
  }

  await persistenceSetupPromise;
  return auth;
}

export async function registerUser(email: string, password: string) {
  try {
    const authInstance = await ensureAuthPersistence();
    const credential = await createUserWithEmailAndPassword(authInstance, email, password);
    return credential.user;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Unable to register user at this time."
    );
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const authInstance = await ensureAuthPersistence();
    const credential = await signInWithEmailAndPassword(authInstance, email, password);
    return credential.user;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Unable to login at this time."
    );
  }
}
