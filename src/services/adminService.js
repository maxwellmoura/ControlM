import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { obterUsuariosPorPlano } from './plansAcess';

// Função auxiliar para formatar data no fuso horário local (Brasil)
function formatarDataLocal(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Função para formatar data de YYYY-MM-DD para DD/MM/YYYY
function formatarDataParaExibicao(dataString) {
  if (!dataString || !/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
    console.log(`Data inválida para exibição: ${dataString}`);
    return 'N/A';
  }
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Função para calcular dias até o vencimento
function calcularDiasAteVencimento(dataExpiracao) {
  if (!dataExpiracao || !/^\d{4}-\d{2}-\d{2}$/.test(dataExpiracao)) {
    console.log(`Data de expiração inválida: ${dataExpiracao}`);
    return null;
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVencimento = new Date(dataExpiracao);
  dataVencimento.setHours(0, 0, 0, 0);
  if (isNaN(dataVencimento)) {
    console.log(`Data de expiração inválida (NaN): ${dataExpiracao}`);
    return null;
  }
  const diffMilissegundos = dataVencimento - hoje;
  const diffDias = Math.floor(diffMilissegundos / (1000 * 60 * 60 * 24));
  console.log(`Dias até vencimento (${dataExpiracao}): ${diffDias}, Hoje: ${hoje.toISOString()}, Vencimento: ${dataVencimento.toISOString()}`);
  return diffDias;
}

// Carrega usuários
async function carregarUsuarios() {
  try {
    const snapshot = await getDocs(collection(db, 'Usuarios'), { source: 'server' });
    const lista = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`Dados do usuário ${doc.id}:`, JSON.stringify(data, null, 2));
      return {
        id: doc.id,
        nome: data.nome || 'Sem nome',
        email: data.email || 'N/A',
        planos: Array.isArray(data.planos) ? data.planos : [],
        ehAdmin: data.admin || false,
        telefone: data.telefone || '',
        criadoEm: data.criadoEm || 'N/A',
      };
    });
    console.log('Usuários carregados:', JSON.stringify(lista, null, 2));
    return lista;
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    throw new Error('Erro ao carregar usuários.');
  }
}

// Carrega planos e adeptos
async function carregarPlanos() {
  try {
    const snapshot = await getDocs(collection(db, 'Planos'), { source: 'server' });
    const lista = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log(`Dados do plano ${doc.id}:`, JSON.stringify(data, null, 2));
      return {
        id: doc.id,
        text: data.text || 'Plano sem nome',
        value: data.value || 0,
      };
    });
    console.log('Planos carregados:', JSON.stringify(lista, null, 2));

    const adeptosPorPlano = {};
    for (let plano of lista) {
      try {
        const adeptos = await obterUsuariosPorPlano(plano.text);
        adeptosPorPlano[plano.text] = adeptos;
        console.log(`Adeptos do plano ${plano.text} carregados:`, JSON.stringify(adeptos, null, 2));
      } catch (error) {
        console.error(`Erro ao carregar adeptos do plano ${plano.text}:`, error);
      }
    }
    return { planos: lista, adeptosPorPlano };
  } catch (error) {
    console.error('Erro ao carregar planos:', error);
    throw new Error('Erro ao carregar planos.');
  }
}

// Calcula valor total dos planos
function calcularValorTotalPlanos(planosUsuario, planos) {
  if (!planosUsuario || !Array.isArray(planosUsuario) || planosUsuario.length === 0) {
    return 'R$ 0,00';
  }
  let total = 0;
  for (let plano of planosUsuario) {
    let planoEncontrado = planos.find(p => p.text === (plano?.nome || ''));
    if (planoEncontrado) {
      total += Number(planoEncontrado.value || 0);
    }
  }
  console.log(`Valor total calculado para planos ${JSON.stringify(planosUsuario)}: R$ ${total.toFixed(2)}`);
  return 'R$ ' + total.toFixed(2).replace('.', ',');
}

// Pega data de vencimento mais recente e determina a cor
function obterDataVencimentoMaisRecente(planosUsuario) {
  if (!planosUsuario || !Array.isArray(planosUsuario) || planosUsuario.length === 0) {
    console.log('Nenhum plano encontrado para o usuário');
    return { texto: 'N/A', classe: '' };
  }
  let dataMaisRecente = null;
  for (let plano of planosUsuario) {
    if (plano?.dataExpiracao) {
      const dataAtual = plano.dataExpiracao;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataAtual)) {
        console.log(`Data de expiração inválida no plano ${plano.nome}: ${dataAtual}`);
        continue;
      }
      if (!dataMaisRecente || dataAtual > dataMaisRecente) {
        dataMaisRecente = dataAtual;
      }
    }
  }
  if (!dataMaisRecente) {
    console.log('Nenhuma data de expiração válida encontrada');
    return { texto: 'N/A', classe: '' };
  }
  const diasAteVencimento = calcularDiasAteVencimento(dataMaisRecente);
  let classe = '';
  if (diasAteVencimento === null) {
    return { texto: 'N/A', classe: '' };
  } else if (diasAteVencimento > 15) {
    classe = 'bg-success bg-opacity-25';
  } else if (diasAteVencimento >= 5 && diasAteVencimento <= 15) {
    classe = 'bg-warning bg-opacity-25';
  } else {
    classe = 'bg-danger bg-opacity-25';
  }
  console.log('Data de vencimento mais recente:', dataMaisRecente, 'Classe:', classe, 'Dias:', diasAteVencimento);
  return { texto: formatarDataParaExibicao(dataMaisRecente), classe };
}

// Conta adeptos de um plano
function contarAdeptosPlano(planoNome, adeptosPorPlano) {
  const adeptos = adeptosPorPlano[planoNome] || [];
  console.log(`Adeptos do plano ${planoNome}:`, adeptos.length);
  return adeptos.length;
}

// Lista adeptos de um plano
function listarAdeptosPlano(planoNome, adeptosPorPlano) {
  const adeptos = adeptosPorPlano[planoNome] || [];
  console.log(`Lista de adeptos do plano ${planoNome}:`, JSON.stringify(adeptos, null, 2));
  return adeptos;
}

// Exclui usuário
async function excluirUsuario(id) {
  if (window.confirm('Quer mesmo excluir este usuário?')) {
    try {
      await deleteDoc(doc(db, 'Usuarios', id));
      console.log('Usuário excluído:', id);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw new Error('Erro ao excluir usuário.');
    }
  }
}

// Adiciona plano
async function adicionarPlano(dados) {
  if (!dados.text || !dados.value) {
    throw new Error('Nome e valor do plano são obrigatórios.');
  }
  try {
    await addDoc(collection(db, 'Planos'), {
      text: dados.text,
      value: Number(dados.value) || 0,
    });
    console.log('Plano adicionado:', JSON.stringify(dados, null, 2));
  } catch (error) {
    console.error('Erro ao adicionar plano:', error);
    throw new Error('Erro ao adicionar plano.');
  }
}

// Atualiza plano
async function atualizarPlano(id, dados) {
  if (!dados.text || !dados.value) {
    throw new Error('Nome e valor do plano são obrigatórios.');
  }
  try {
    await updateDoc(doc(db, 'Planos', id), {
      text: dados.text,
      value: Number(dados.value) || 0,
    });
    console.log('Plano atualizado:', id, JSON.stringify(dados, null, 2));
  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    throw new Error('Erro ao atualizar plano.');
  }
}

// Exclui plano
async function excluirPlano(id) {
  if (window.confirm('Quer mesmo excluir este plano?')) {
    try {
      await deleteDoc(doc(db, 'Planos', id));
      console.log('Plano excluído:', id);
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      throw new Error('Erro ao excluir plano.');
    }
  }
}

// Formata telefone
function formatarTelefone(telefone) {
  if (!telefone) return 'N/A';
  let limpo = telefone.replace(/\D/g, '');
  if (limpo.length === 11) {
    return '(' + limpo.slice(0, 2) + ') ' + limpo.slice(2, 7) + '-' + limpo.slice(7);
  }
  if (limpo.length === 10) {
    return '(' + limpo.slice(0, 2) + ') ' + limpo.slice(2, 6) + '-' + limpo.slice(6);
  }
  return telefone;
}

// Verifica se o usuário é administrador
async function verificarAdmin(auth, navigate) {
  const usuarioAtual = auth.currentUser;
  if (!usuarioAtual) {
    console.log('Usuário não está logado');
    return { isAdmin: false, error: 'Você precisa estar logado para acessar o painel.' };
  }
  try {
    const docSnapshot = await getDoc(doc(db, 'Usuarios', usuarioAtual.uid));
    if (docSnapshot.exists() && docSnapshot.data().admin) {
      console.log(`Usuário ${usuarioAtual.uid} é administrador`);
      return { isAdmin: true, error: '' };
    } else {
      console.log(`Usuário ${usuarioAtual.uid} não é administrador`);
      return { isAdmin: false, error: 'Acesso negado: você não é administrador.' };
    }
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return { isAdmin: false, error: 'Erro ao verificar permissões. Tente novamente.' };
  }
}

export {
  formatarDataLocal,
  formatarDataParaExibicao,
  calcularDiasAteVencimento,
  carregarUsuarios,
  carregarPlanos,
  calcularValorTotalPlanos,
  obterDataVencimentoMaisRecente,
  contarAdeptosPlano,
  listarAdeptosPlano,
  excluirUsuario,
  adicionarPlano,
  atualizarPlano,
  excluirPlano,
  formatarTelefone,
  verificarAdmin,
};