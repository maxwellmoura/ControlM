import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export async function getOverdueUsers() {
  const today = new Date();
  const usuariosRef = collection(db, 'Usuarios');
  const snapshot = await getDocs(usuariosRef);
  const overdueUsers = [];

  snapshot.forEach((doc) => {
    const userData = doc.data();
    const planos = Array.isArray(userData.planos) ? userData.planos : [];
    planos.forEach((plano) => {
      if (plano.dataExpiracao) {
        const expiracaoDate = new Date(plano.dataExpiracao);
        if (expiracaoDate < today && userData.telefone) {
          const message = `Olá, ${userData.nome}! Seu plano "${plano.nome}" venceu em ${new Date(
            plano.dataExpiracao
          ).toLocaleDateString('pt-BR')}. Renove agora para continuar treinando!`;
          const encodedMessage = encodeURIComponent(message);
          overdueUsers.push({
            id: doc.id,
            nome: userData.nome || 'Sem nome',
            email: userData.email || 'N/A',
            telefone: userData.telefone || 'N/A',
            planoNome: plano.nome || 'N/A',
            dataExpiracao: plano.dataExpiracao,
            whatsAppUrl: `https://wa.me/${userData.telefone}?text=${encodedMessage}`,
          });
        }
      }
    });
  });

  return overdueUsers;
}
