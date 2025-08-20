const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

// Registrar o token FCM quando o usuário for criado
exports.onAuthCreate = functions.auth.user().onCreate(async (user) => {
    const userRef = admin.firestore().collection('Usuarios').doc(user.uid);

    await userRef.set({
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        fcmToken: '', // Inicializa o campo fcmToken vazio
    }, { merge: true });
});

// Atualizar o token FCM sempre que o usuário se conectar
exports.updateFCMToken = functions.firestore
    .document('Usuarios/{userId}')
    .onUpdate(async (change, context) => {
        const userRef = admin.firestore().collection('Usuarios').doc(context.params.userId);
        const newToken = change.after.data()?.fcmToken;

        if (newToken) {
            await userRef.update({ fcmToken: newToken });
        }

        return null;
    });
