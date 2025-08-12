import { db } from '../config/firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

// Coleção para armazenar planos
const colecaoPlanos = collection(db, 'Planos');

// Obtém todos os planos
function obterPlanos() {
  return getDocs(colecaoPlanos)
    .then(snapshot => snapshot.docs.map(doc => ({
      id: doc.id,
      text: doc.data().text || 'Plano sem nome',
      value: Number(doc.data().value) || 0,
    })))
    .catch(error => {
      console.error('Erro ao obter planos:', error);
      throw error;
    });
}

// Adiciona um novo plano
function adicionarPlano(dados) {
  if (!dados.text || !dados.value) {
    console.error('Nome e valor do plano são obrigatórios:', dados);
    throw new Error('Nome e valor do plano são obrigatórios.');
  }
  return addDoc(colecaoPlanos, {
    text: dados.text,
    value: Number(dados.value),
  }).catch(error => {
    console.error('Erro ao adicionar plano:', error);
    throw error;
  });
}

// Atualiza um plano existente
function atualizarPlano(id, dados) {
  if (!id || !dados.text || !dados.value) {
    console.error('ID, nome e valor do plano são obrigatórios:', id, dados);
    throw new Error('ID, nome e valor do plano são obrigatórios.');
  }
  return updateDoc(doc(db, 'Planos', id), {
    text: dados.text,
    value: Number(dados.value),
  }).catch(error => {
    console.error('Erro ao atualizar plano:', error);
    throw error;
  });
}

// Exclui um plano
function excluirPlano(id) {
  if (!id) {
    console.error('ID do plano é obrigatório:', id);
    throw new Error('ID do plano é obrigatório.');
  }
  return deleteDoc(doc(db, 'Planos', id))
    .catch(error => {
      console.error('Erro ao excluir plano:', error);
      throw error;
    });
}

// Define um plano com ID específico
function setPlansAcess(dados) {
  if (!dados.text || !dados.value) {
    console.error('Nome e valor do plano são obrigatórios:', dados);
    throw new Error('Nome e valor do plano são obrigatórios.');
  }
  return setDoc(doc(db, 'Planos'), {
    text: dados.text,
    value: Number(dados.value),
  }).catch(error => {
    console.error('Erro ao definir plano:', error);
    throw error;
  });
}

// Obtém usuários que aderiram a um plano específico
async function obterUsuariosPorPlano(nomePlano) {
  if (!nomePlano) {
    console.error('Nome do plano é obrigatório:', nomePlano);
    return [];
  }
  try {
    const usuariosRef = collection(db, 'Usuarios');
    const snapshot = await getDocs(usuariosRef);
    const usuarios = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const planos = Array.isArray(data.planos) ? data.planos : [];
      const adesoes = planos.filter(plano => plano?.nome === nomePlano);
      if (adesoes.length > 0) {
        usuarios.push({
          id: doc.id,
          nome: data.nome || 'Sem nome',
          adesoes: adesoes.length,
          fotoUrl: data.fotoUrl || '',
          telefone: data.telefone || '',
        });
      }
    });
    console.log(`Usuários do plano ${nomePlano}:`, usuarios);
    return usuarios;
  } catch (error) {
    console.error(`Erro ao obter usuários do plano ${nomePlano}:`, error);
    throw error;
  }
}

export { adicionarPlano as addPlansAcess, obterPlanos as getPlansAcess, atualizarPlano as updatePlansAcess, excluirPlano as deletePlansAcess, setPlansAcess, obterUsuariosPorPlano };