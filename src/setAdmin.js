const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); 

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


definirAdmin('FNpu5ImgZxbi389Um3rIO529RdZ2');
