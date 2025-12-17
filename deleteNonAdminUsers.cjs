const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Verificar se o arquivo serviceAccountKey.json existe
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error(
    `Erro: Arquivo ${serviceAccountPath} não encontrado. Gere a chave em Firebase Console > Project Settings > Service Accounts e salve em ${__dirname}.`
  );
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function deleteNonAdminUsers() {
  try {
    console.log('Iniciando exclusão de usuários não administradores...');

    // Passo 1: Listar todos os usuários do Authentication
    const authUsers = [];
    let nextPageToken;
    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);
      authUsers.push(...listUsersResult.users);
      nextPageToken = listUsersResult.pageToken;
      console.log(
        `Carregados ${listUsersResult.users.length} usuários do Authentication. Total até agora: ${authUsers.length}`
      );
    } while (nextPageToken);
    console.log(`Total de usuários no Authentication: ${authUsers.length}`);

    // Passo 2: Listar todos os documentos da coleção Usuarios
    const usuariosRef = db.collection('Usuarios');
    let snapshot = await usuariosRef.limit(500).get();
    const firestoreUsers = new Map();
    const adminUsers = [];
    const nonAdminUsers = [];

    while (!snapshot.empty) {
      console.log(`Processando ${snapshot.size} documentos da coleção Usuarios...`);
      for (const doc of snapshot.docs) {
        const userData = doc.data();
        firestoreUsers.set(doc.id, userData);
        if (userData.admin === true) {
          adminUsers.push({ uid: doc.id, email: userData.email || 'sem e-mail' });
        } else {
          nonAdminUsers.push({ uid: doc.id, email: userData.email || 'sem e-mail' });
        }
      }
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      snapshot = await usuariosRef.limit(500).startAfter(lastDoc).get();
    }

    console.log(
      `Usuários administradores (${adminUsers.length}):`,
      adminUsers.map((u) => u.email)
    );
    console.log(
      `Usuários não administradores no Firestore (${nonAdminUsers.length}):`,
      nonAdminUsers.map((u) => u.email)
    );

    // Passo 3: Identificar usuários no Authentication que não estão no Firestore
    const authOnlyUsers = authUsers
      .filter((user) => !firestoreUsers.has(user.uid))
      .map((user) => ({ uid: user.uid, email: user.email || 'sem e-mail' }));
    console.log(
      `Usuários apenas no Authentication (${authOnlyUsers.length}):`,
      authOnlyUsers.map((u) => u.email)
    );

    // Combinar usuários não administradores do Firestore e Authentication
    const usersToDelete = [...nonAdminUsers, ...authOnlyUsers];

    if (usersToDelete.length === 0) {
      console.log('Nenhum usuário não administrador encontrado para exclusão.');
      return;
    }

    console.log(
      `Total de usuários a excluir (${usersToDelete.length}):`,
      usersToDelete.map((u) => u.email)
    );

    // Passo 4: Excluir usuários do Authentication
    let deletedAuthUsers = 0;
    for (const user of usersToDelete) {
      try {
        await admin.auth().deleteUser(user.uid);
        console.log(`Usuário ${user.uid} (${user.email}) excluído do Authentication.`);
        deletedAuthUsers++;
      } catch (error) {
        console.error(
          `Erro ao excluir usuário ${user.uid} (${user.email}) do Authentication:`,
          error.message
        );
      }
    }
    console.log(`Total de usuários excluídos do Authentication: ${deletedAuthUsers}`);

    // Passo 5: Excluir documentos não administradores do Firestore
    let deletedDocs = 0;
    while (nonAdminUsers.length > 0) {
      const batch = db.batch();
      const batchUsers = nonAdminUsers.splice(0, 500); // Máximo de 500 por batch
      for (const user of batchUsers) {
        const docRef = usuariosRef.doc(user.uid);
        batch.delete(docRef);
        console.log(`Adicionando exclusão do documento ${user.uid} (${user.email}) ao batch.`);
      }
      await batch.commit();
      deletedDocs += batchUsers.length;
      console.log(
        `Excluídos ${batchUsers.length} documentos no batch. Total até agora: ${deletedDocs}`
      );
    }

    console.log(`Total de documentos não administradores excluídos do Firestore: ${deletedDocs}`);
    console.log('Exclusão de usuários não administradores concluída com sucesso.');
  } catch (error) {
    console.error('Erro geral ao excluir dados:', error.message);
  } finally {
    await admin.app().delete();
    console.log('Instância do Firebase Admin finalizada.');
  }
}

deleteNonAdminUsers();
