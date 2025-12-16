import { getAuth } from 'firebase/auth';

export async function getAdminStatus() {
  const auth = getAuth();
  const usuario = auth.currentUser;

  if (!usuario) return false;

  const token = await usuario.getIdTokenResult(true);
  return token.claims.admin === true;
}
