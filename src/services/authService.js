// src/services/authService.js
// ------------------------------------------------------------
// Serviço de Autenticação e Autorização (Firebase v9+ modular)
// - Valida inputs (email/senha) no cliente
// - Cria/atualiza perfil básico em /Usuarios/{uid}
// - Verifica claims de admin com refresh do token
// - Evita erros de COOP com fallback para signInWithRedirect
// ------------------------------------------------------------

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

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../config/firebaseConfig';

// ---------------------- Helpers de validação ----------------------
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

// ----------------------------- Auth ------------------------------
const auth = getAuth();

// ----------------- Perfil /Usuarios/{uid} no Firestore -----------
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
      role: 'user', // Nunca elevar papel no cliente
    });
  } else {
    await updateDoc(ref, base);
  }
}

// ------------------------- Sign Up -------------------------------
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
  await cred.user.getIdToken(true); // garantir claims atualizadas
  return cred.user;
}

// -------------------------- Sign In ------------------------------
export async function signInWithEmail({ email, password }) {
  const cleanEmail = sanitizeString(email);

  if (!validateEmail(cleanEmail)) throw new Error('E-mail inválido.');
  if (!validatePassword(password)) throw new Error('A senha deve ter no mínimo 6 caracteres.');

  const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
  await ensureUserProfile(cred.user);
  await cred.user.getIdToken(true);
  return cred.user;
}

// -------- Login com Google (Popup com fallback Redirect) ---------
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    // Tenta popup primeiro
    const cred = await signInWithPopup(auth, provider);
    await ensureUserProfile(cred.user);
    await cred.user.getIdToken(true);
    return cred.user;
  } catch (err) {
    // Alguns navegadores/políticas COOP bloqueiam window.close/closed
    // Fallback para redirect elimina os warnings e garante login
    if (err && typeof window !== 'undefined') {
      await signInWithRedirect(auth, provider);
      // Após redirecionar e voltar, pegar o resultado:
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

// --------------------------- Logout ------------------------------
export async function logout() {
  await signOut(auth);
}

// ------------------------ User helpers ---------------------------
export function currentUser() {
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// --------------------- Verificação de Admin ----------------------
export async function verificarAdmin() {
  const user = auth.currentUser;
  if (!user) return false;

  // Forçar refresh para garantir claims atualizadas
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

// (Opcional) Força refresh manual do token
export async function refreshIdToken() {
  if (auth.currentUser) {
    await auth.currentUser.getIdToken(true);
  }
}
