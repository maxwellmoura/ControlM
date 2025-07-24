<<<<<<< HEAD
import { getAuth } from 'firebase/auth';

export async function getAdminStatus() {
  const auth = getAuth();
  const usuario = auth.currentUser;

  if (!usuario) return false;

  const token = await usuario.getIdTokenResult(true);
  return token.claims.admin === true;
=======
import { getAuth } from 'firebase/auth';

export async function getAdminStatus() {
  const auth = getAuth();
  const usuario = auth.currentUser;

  if (!usuario) return false;

  const token = await usuario.getIdTokenResult(true);
  return token.claims.admin === true;
>>>>>>> 063e2937bc709c9ed9d4fc5f6e0ce9b9253aca11
}