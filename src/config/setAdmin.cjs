
const admin = require('firebase-admin');
const serviceAccount = require('../src/config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function definirAdmin(uid) {
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log('Usuário ADMIN definido com sucesso.');
  } catch (error) {
    console.error('Erro ao definir admin:', error);
  }
}



