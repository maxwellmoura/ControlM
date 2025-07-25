import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

const usersReference = collection(db, 'Usuarios');

export async function addUserAccess(user) {
  if (!user || typeof user !== 'object') {
    throw new Error('Dados inválidos');
  }
  const response = await addDoc(usersReference, user);
  return response;
}

export async function updateUserAccess(userId, data) {
  if (!userId || !data || typeof data !== 'object') {
    throw new Error('ID ou dados inválidos.');
  }
  const userRef = doc(db, 'Usuarios', userId);
  await updateDoc(userRef, data);
}

export async function getAdminStatus() {
  const auth = getAuth();
  const usuario = auth.currentUser;

  if (!usuario) return false;

  const token = await usuario.getIdTokenResult(true);
  return token.claims.admin === true;
}