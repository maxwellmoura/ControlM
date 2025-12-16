const admin = require('firebase-admin');

function getCredentialJson() {
  const base64 = process.env.FIREBASE_ADMIN_CREDENTIAL_BASE64;
  const rawJson = process.env.FIREBASE_ADMIN_CREDENTIAL_JSON;

  if (base64) {
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
  }

  if (rawJson) {
    return JSON.parse(rawJson);
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return null;
  }

  throw new Error(
    'Defina FIREBASE_ADMIN_CREDENTIAL_BASE64 ou FIREBASE_ADMIN_CREDENTIAL_JSON (ou GOOGLE_APPLICATION_CREDENTIALS).'
  );
}

const credentialJson = getCredentialJson();

admin.initializeApp(
  credentialJson ? { credential: admin.credential.cert(credentialJson) } : {}
);

async function definirAdmin(uid) {
  if (!uid) {
    throw new Error('Informe o UID do usuario.');
  }
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  console.log(`Usuario ${uid} marcado como ADMIN.`);
}

module.exports = { definirAdmin };
