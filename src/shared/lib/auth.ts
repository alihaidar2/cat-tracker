// src/shared/lib/auth.ts
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase"; // ← use the exported auth, no need for getAuth/app

export function watchAuth(cb: (user: any | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function emailSignIn(email: string, pw: string) {
  return signInWithEmailAndPassword(auth, email, pw);
}

export async function emailSignUp(
  email: string,
  pw: string,
  displayName?: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, pw);
  if (displayName) await updateProfile(cred.user, { displayName });
  return cred;
}

export async function doSignOut() {
  return signOut(auth);
}
