import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebaseConfig';
import { obterUsuariosPorPlano } from './plansAcess';

function formatarDataLocal(date) {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formatarDataParaExibicao(dataString) {
  if (!dataString || !/^\d{4}-\d{2}-\d{2}$/.test(dataString)) {
    console.log(`Data invalida para exibicao: ${dataString}`);
    return 'N/A';
  }
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
}

function calcularDiasAteVencimento(dataExpiracao) {
  if (!dataExpiracao || !/^\d{4}-\d{2}-\d{2}$/.test(dataExpiracao)) {
    console.log(`Data de expiracao invalida: ${dataExpiracao}`);
    return null;
  }
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVencimento = new Date(dataExpiracao);
  dataVencimento.setHours(0, 0, 0, 0);
  if (isNaN(dataVencimento)) {
    console.log(`Data de expiracao invalida (NaN): ${dataExpiracao}`);
    return null;
  }
  const diffMilissegundos = dataVencimento - hoje;
  const diffDias = Math.floor(diffMilissegundos / (1000 * 60 * 60 * 24));
  console.log(
    `Dias ate vencimento (${dataExpiracao}): ${diffDias}, Hoje: ${hoje.toISOString()}, Vencimento: ${dataVencimento.toISOString()}`
  );
  return diffDias;
}

async function carregarUsuarios() {
  try {
    const snapshot = await getDocs(collection(db, 'Usuarios'), { source: 'server' });
    const lista = snapshot.docs.map((d) => {
      const data = d.data();
      console.log(`Dados do usuario ${d.id}:`, JSON.stringify(data, null, 2));
      return {
        id: d.id,
        nome: data.nome || 'Sem nome',
        email: data.email || 'N/A',
        planos: Array.isArray(data.planos) ? data.planos : [],
        ehAdmin: data.admin || false,
        telefone: data.telefone || '',
        criadoEm: data.criadoEm || 'N/A',
      };
    });
    console.log('Usuarios carregados:', JSON.stringify(lista, null, 2));
    return lista;
  } catch (error) {
    console.error('Erro ao carregar usuarios:', error);
    throw new Error('Erro ao carregar usuarios.');
  }
}

async function carregarPlanos() {
  try {
    const snapshot = await getDocs(collection(db, 'Planos'), { source: 'server' });
    const lista = snapshot.docs.map((d) => {
      const data = d.data();
      console.log(`Dados do plano ${d.id}:`, JSON.stringify(data, null, 2));
      return {
        id: d.id,
        text: data.text || 'Plano sem nome',
        value: data.value || 0,
      };
    });
    console.log('Planos carregados:', JSON.stringify(lista, null, 2));

    const adeptosPorPlano = {};
    for (const plano of lista) {
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

function calcularValorTotalPlanos(planosUsuario, planos) {
  if (!planosUsuario || !Array.isArray(planosUsuario) || planosUsuario.length === 0) {
    return 'R$ 0,00';
  }
  let total = 0;
  for (const plano of planosUsuario) {
    const encontrado = planos.find((p) => p.text === (plano?.nome || ''));
    if (encontrado) total += Number(encontrado.value || 0);
  }
  console.log(`Valor total calculado para planos ${JSON.stringify(planosUsuario)}: R$ ${total.toFixed(2)}`);
  return 'R$ ' + total.toFixed(2).replace('.', ',');
}

function obterDataVencimentoMaisRecente(planosUsuario) {
  if (!planosUsuario || !Array.isArray(planosUsuario) || planosUsuario.length === 0) {
    console.log('Nenhum plano encontrado para o usuario');
    return { texto: 'N/A', classe: '' };
  }
  let dataMaisRecente = null;
  for (const plano of planosUsuario) {
    if (plano?.dataExpiracao) {
      const dataAtual = plano.dataExpiracao;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dataAtual)) {
        console.log(`Data de expiracao invalida no plano ${plano.nome}: ${dataAtual}`);
        continue;
      }
      if (!dataMaisRecente || dataAtual > dataMaisRecente) {
        dataMaisRecente = dataAtual;
      }
    }
  }
  if (!dataMaisRecente) {
    console.log('Nenhuma data de expiracao valida encontrada');
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

function contarAdeptosPlano(planoNome, adeptosPorPlano) {
  const adeptos = adeptosPorPlano[planoNome] || [];
  console.log(`Adeptos do plano ${planoNome}:`, adeptos.length);
  return adeptos.length;
}

function listarAdeptosPlano(planoNome, adeptosPorPlano) {
  const adeptos = adeptosPorPlano[planoNome] || [];
  console.log(`Lista de adeptos do plano ${planoNome}:`, JSON.stringify(adeptos, null, 2));
  return adeptos;
}

async function excluirUsuario(id) {
  if (window.confirm('Quer mesmo excluir este usuario?')) {
    try {
      await deleteDoc(doc(db, 'Usuarios', id));
      console.log('Usuario excluido:', id);
    } catch (error) {
      console.error('Erro ao excluir usuario:', error);
      throw new Error('Erro ao excluir usuario.');
    }
  }
}

async function adicionarPlano(dados) {
  if (!dados.text || !dados.value) {
    throw new Error('Nome e valor do plano sao obrigatorios.');
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

async function atualizarPlano(id, dados) {
  if (!dados.text || !dados.value) {
    throw new Error('Nome e valor do plano sao obrigatorios.');
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

async function excluirPlano(id) {
  if (window.confirm('Quer mesmo excluir este plano?')) {
    try {
      await deleteDoc(doc(db, 'Planos', id));
      console.log('Plano excluido:', id);
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
      throw new Error('Erro ao excluir plano.');
    }
  }
}

function formatarTelefone(telefone) {
  if (!telefone) return 'N/A';
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
  }
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }
  return telefone;
}

async function verificarAdmin(authInstance) {
  const auth = authInstance || getAuth();
  const usuarioAtual = auth.currentUser;
  if (!usuarioAtual) {
    return { isAdmin: false, error: 'Voce precisa estar logado para acessar o painel.' };
  }
  try {
    const token = await usuarioAtual.getIdTokenResult(true);
    const isAdmin = token.claims?.admin === true;
    if (!isAdmin) {
      return { isAdmin: false, error: 'Acesso negado: voce nao e administrador.' };
    }
    return { isAdmin: true, error: '' };
  } catch (error) {
    console.error('Erro ao verificar usuario:', error);
    return { isAdmin: false, error: 'Erro ao verificar permissoes. Tente novamente.' };
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
