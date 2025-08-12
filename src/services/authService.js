import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

// Coleção para armazenar dados de usuários
const colecaoUsuarios = collection(db, 'Usuarios');

// Adiciona um novo usuário no Firestore
function adicionarUsuario(dadosUsuario) {
  if (!dadosUsuario) {
    throw new Error('Nenhum dado de usuário fornecido.');
  }
  return addDoc(colecaoUsuarios, {
    ...dadosUsuario,
    telefone: dadosUsuario.telefone || ''
  });
}

// Atualiza dados de um usuário no Firestore
function atualizarUsuario(idUsuario, dadosUsuario) {
  if (!idUsuario || !dadosUsuario) {
    throw new Error('ID ou dados inválidos.');
  }
  const documentoUsuario = doc(db, 'Usuarios', idUsuario);
  return updateDoc(documentoUsuario, {
    ...dadosUsuario,
    telefone: dadosUsuario.telefone || ''
  });
}

// Verifica se o usuário atual é administrador
function verificarAdmin() {
  const auth = getAuth();
  const usuarioAtual = auth.currentUser;

  if (!usuarioAtual) {
    return Promise.resolve(false);
  }

  return usuarioAtual.getIdTokenResult(true)
    .then(token => token.claims.admin === true)
    .catch(() => false);
}

export { adicionarUsuario, atualizarUsuario, verificarAdmin };