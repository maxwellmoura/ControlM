// O QUE ESTE SCRIPT FAZ (configurável por flags):
// - Limpa coleções de relatórios/fluxo (somente documentos; as coleções continuam existindo).
// - Zera as adesões (array "planos") de todos os usuários.
// - Zera o campo "adeptos" em todos os documentos de "Planos".
// - (Opcional) Remove adesões órfãs em /Usuarios quando o plano não existe mais em /Planos.
// - Modo dry-run para você revisar antes.
//
// Uso comum:
//   node resetData.cjs
// Com flags:
//   node resetData.cjs --dry      (apenas mostra o que faria)
//   node resetData.cjs --no-users (não zera adesões dos usuários)
//   node resetData.cjs --no-adept (não zera adeptos nos planos)
//   node resetData.cjs --no-reports (não limpa coleções de relatórios)
//   node resetData.cjs --purge-orphans (remove adesões "órfãs")
// ------------------------------------------------------------------

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ---------------------- Flags de linha de comando ----------------------
const argv = new Set(process.argv.slice(2));
const DRY_RUN = argv.has('--dry');
const DO_USERS = !argv.has('--no-users'); // zerar adesões dos usuários
const DO_ADEPTS = !argv.has('--no-adept'); // zerar adeptos em Planos
const DO_REPORTS = !argv.has('--no-reports'); // limpar coleções de relatórios
const PURGE_ORPHANS = argv.has('--purge-orphans'); // remover adesões cujos planos não existem mais

// Liste aqui os nomes das coleções de relatórios/fluxo usadas no seu projeto.
// Ajuste se necessário (ex.: "Relatorios", "FluxoCaixa", "CashFlow", "Movimentos").
const REPORT_COLLECTIONS = [
  'Relatorios',
  'FluxoCaixa',
  'CashFlow',
  'Movimentos',
  'RelatoriosMensais',
];

// ---------------------- Inicialização Admin SDK ----------------------
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(
    `Erro: ${serviceAccountPath} não encontrado.\n` +
      `Baixe em Firebase Console > Project Settings > Service Accounts e salve nesta pasta.`
  );
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ---------------------- Utilitários ----------------------
async function deleteCollectionDocuments(colName, pageSize = 500) {
  const colRef = db.collection(colName);
  let total = 0;
  let snap = await colRef.limit(pageSize).get();

  while (!snap.empty) {
    if (DRY_RUN) {
      total += snap.size;
    } else {
      const batch = db.batch();
      for (const docSnap of snap.docs) {
        batch.delete(docSnap.ref);
      }
      await batch.commit();
      total += snap.size;
    }
    const last = snap.docs[snap.docs.length - 1];
    snap = await colRef.limit(pageSize).startAfter(last).get();
  }

  console.log(`${DRY_RUN ? '[DRY] ' : ''}Coleção "${colName}" limpa. Docs removidos: ${total}`);
}

async function getAllDocs(colName, pageSize = 500) {
  const colRef = db.collection(colName);
  let all = [];
  let snap = await colRef.limit(pageSize).get();

  while (!snap.empty) {
    all = all.concat(snap.docs);
    const last = snap.docs[snap.docs.length - 1];
    snap = await colRef.limit(pageSize).startAfter(last).get();
  }
  return all;
}

// ---------------------- Tarefas ----------------------
async function limparColecoesDeRelatorio() {
  if (!DO_REPORTS) return console.log('PULANDO: limpeza de coleções de relatórios (--no-reports).');

  console.log('--- Limpando coleções de relatórios/fluxo ---');
  for (const col of REPORT_COLLECTIONS) {
    try {
      await deleteCollectionDocuments(col, 500);
    } catch (e) {
      console.warn(`Aviso: falha ao limpar "${col}":`, e.message);
    }
  }
}

async function zerarAdesoesUsuarios() {
  if (!DO_USERS) return console.log('PULANDO: zerar adesões dos usuários (--no-users).');

  console.log('--- Zerando adesões em /Usuarios ---');
  const users = await getAllDocs('Usuarios', 500);
  console.log(`Encontrados ${users.length} documentos em /Usuarios.`);

  let totalAtualizados = 0;
  while (users.length > 0) {
    const chunk = users.splice(0, 500);
    if (DRY_RUN) {
      totalAtualizados += chunk.length;
      continue;
    }
    const batch = db.batch();
    for (const docSnap of chunk) {
      // Zera array "planos"
      batch.update(docSnap.ref, { planos: [] });
    }
    await batch.commit();
    totalAtualizados += chunk.length;
    console.log(`Atualizados ${chunk.length} usuários (acumulado: ${totalAtualizados})`);
  }
  console.log(
    `${DRY_RUN ? '[DRY] ' : ''}Total de usuários com adesões zeradas: ${totalAtualizados}`
  );
}

async function zerarAdeptosPlanos() {
  if (!DO_ADEPTS) return console.log('PULANDO: zerar adeptos em /Planos (--no-adept).');

  console.log('--- Zerando "adeptos" em /Planos ---');
  const planos = await getAllDocs('Planos', 500);
  console.log(`Encontrados ${planos.length} documentos em /Planos.`);

  let total = 0;
  while (planos.length > 0) {
    const chunk = planos.splice(0, 500);
    if (DRY_RUN) {
      total += chunk.length;
      continue;
    }
    const batch = db.batch();
    for (const docSnap of chunk) {
      // Define adeptos = 0 (sem mexer em outros campos)
      batch.update(docSnap.ref, { adeptos: 0 });
    }
    await batch.commit();
    total += chunk.length;
    console.log(`Atualizados ${chunk.length} planos (acumulado: ${total})`);
  }
  console.log(`${DRY_RUN ? '[DRY] ' : ''}Planos com "adeptos" zerados: ${total}`);
}

async function removerAdesoesOrfas() {
  if (!PURGE_ORPHANS)
    return console.log('PULANDO: remoção de adesões órfãs (--purge-orphans não usado).');

  console.log('--- Removendo adesões órfãs em /Usuarios ---');
  const planosDocs = await getAllDocs('Planos', 1000);
  const nomesValidos = new Set(planosDocs.map((d) => (d.data().text || '').trim()).filter(Boolean));

  console.log(`Planos válidos atualmente: ${nomesValidos.size} (por nome/text).`);

  const users = await getAllDocs('Usuarios', 500);
  let totalAjustados = 0;

  while (users.length > 0) {
    const chunk = users.splice(0, 500);
    if (DRY_RUN) {
      // Conta quantos seriam ajustados
      for (const docSnap of chunk) {
        const data = docSnap.data() || {};
        const arr = Array.isArray(data.planos) ? data.planos : [];
        const filtrados = arr.filter((p) => p?.nome && nomesValidos.has(String(p.nome).trim()));
        if (filtrados.length !== arr.length) totalAjustados++;
      }
      continue;
    }

    const batch = db.batch();
    for (const docSnap of chunk) {
      const data = docSnap.data() || {};
      const arr = Array.isArray(data.planos) ? data.planos : [];
      const filtrados = arr.filter((p) => p?.nome && nomesValidos.has(String(p.nome).trim()));

      if (filtrados.length !== arr.length) {
        batch.update(docSnap.ref, { planos: filtrados });
        totalAjustados++;
      }
    }
    await batch.commit();
    console.log(`Lote processado (ajustes aplicados até agora: ${totalAjustados})`);
  }

  console.log(
    `${DRY_RUN ? '[DRY] ' : ''}Usuários ajustados (removidas adesões órfãs): ${totalAjustados}`
  );
}

// ---------------------- Execução ----------------------
(async () => {
  console.log('================ RESET DE DADOS ================');
  console.log(`Dry-run: ${DRY_RUN ? 'SIM (nenhuma escrita será feita)' : 'NÃO'}`);
  console.log(
    `Ações: ${DO_REPORTS ? 'limpar relatórios; ' : ''}${DO_USERS ? 'zerar adesões; ' : ''}${
      DO_ADEPTS ? 'zerar adeptos; ' : ''
    }${PURGE_ORPHANS ? 'remover órfãs' : ''}`
  );
  try {
    if (DO_REPORTS) await limparColecoesDeRelatorio();
    if (DO_USERS) await zerarAdesoesUsuarios();
    if (DO_ADEPTS) await zerarAdeptosPlanos();
    if (PURGE_ORPHANS) await removerAdesoesOrfas();
  } catch (e) {
    console.error('Falha no reset:', e);
  } finally {
    await admin.app().delete();
    console.log('Encerrado.');
  }
})();
