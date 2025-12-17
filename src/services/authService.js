import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../config/firebaseConfig';

function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /\S+@\S+\.\S+/;
  return re.test(email.trim());
}

function validatePassword(password) {
  if (typeof password !== 'string') return false;
  return password.length >= 6;
}

function sanitizeString(s) {
  if (typeof s !== 'string') return '';
  return s.trim();
}

const auth = getAuth();

export async function ensureUserProfile(user) {
  if (!user?.uid) return;

  const ref = doc(db, 'Usuarios', user.uid);
  const snap = await getDoc(ref);

  const base = {
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...base,
      createdAt: serverTimestamp(),
      role: 'user',
    });
  } else {
    await updateDoc(ref, base);
  }
}

export async function signUpWithEmail({ email, password, displayName }) {
  const cleanEmail = sanitizeString(email);
  const cleanName = sanitizeString(displayName ?? '');

  if (!validateEmail(cleanEmail)) throw new Error('E-mail inválido.');
  if (!validatePassword(password)) throw new Error('A senha deve ter no mínimo 6 caracteres.');

  const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);

  if (cleanName) {
    await updateProfile(cred.user, { displayName: cleanName });
  }

  await ensureUserProfile(cred.user);
  await cred.user.getIdToken(true);
  return cred.user;
}

export async function signInWithEmail({ email, password }) {
  const cleanEmail = sanitizeString(email);

  if (!validateEmail(cleanEmail)) throw new Error('E-mail inválido.');
  if (!validatePassword(password)) throw new Error('A senha deve ter no mínimo 6 caracteres.');

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  await ensureUserProfile(cred.user);
  await cred.user.getIdToken(true);
  return cred.user;
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    const cred = await signInWithPopup(auth, provider);
    await ensureUserProfile(cred.user);
    await cred.user.getIdToken(true);
    return cred.user;
  } catch (err) {
    if (err && typeof window !== 'undefined') {
      await signInWithRedirect(auth, provider);
      const redirectCred = await getRedirectResult(auth);
      if (redirectCred?.user) {
        await ensureUserProfile(redirectCred.user);
        await redirectCred.user.getIdToken(true);
        return redirectCred.user;
      }
    }
    throw err;
  }
}

export async function logout() {
  await signOut(auth);
}

export function currentUser() {
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function verificarAdmin() {
  const user = auth.currentUser;
  if (!user) return false;

  const token = await user.getIdTokenResult(true);
  return token.claims?.admin === true;
}

export async function requireAdmin() {
  const isAdmin = await verificarAdmin();
  if (!isAdmin) {
    const err = new Error('Permissão insuficiente: requer perfil administrador.');
    err.code = 'auth/insufficient-permission';
    throw err;
  }
}

export async function refreshIdToken() {
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true);
  }
}
