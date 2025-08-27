const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();
const db = admin.firestore();

// Função que escuta atualizações na coleção de 'Usuarios' e atualiza os feedbacks
exports.updateFeedbacksOnUserNameChange = functions.firestore
    .document('Usuarios/{userId}')
    .onUpdate(async (change, context) => {
        const userId = context.params.userId;
        const newName = change.after.data().name; // Supondo que o campo do nome do usuário seja 'name'

        // Verifica se o nome foi alterado
        if (change.before.data().name !== newName) {
            // Atualiza todos os feedbacks relacionados ao usuário
            const feedbackRef = db.collection('Feedbacks');
            const feedbackSnapshot = await feedbackRef.where('userId', '==', userId).get();

            if (!feedbackSnapshot.empty) {
                let batch = db.batch();
                feedbackSnapshot.forEach(doc => {
                    batch.update(doc.ref, { userName: newName }); // Atualiza o nome nos feedbacks
                });
                await batch.commit();
                console.log('Feedbacks atualizados com sucesso!');
            } else {
                console.log('Nenhum feedback encontrado para o usuário:', userId);
            }
        }
    });

// Função que dispara após a conclusão de um plano ou aula e solicita feedback
exports.requestFeedback = functions.firestore
    .document('Usuarios/{userId}/Planos/{planoId}')
    .onUpdate(async (change, context) => {
        const userData = change.after.data();
        const userId = context.params.userId;
        const planoId = context.params.planoId;

        if (userData.status === 'completed') {
            const feedbackPayload = {
                notification: {
                    title: 'Avalie sua aula/plano',
                    body: 'Sua experiência é importante para nós! Por favor, nos diga o que achou da aula/plano.',
                },
            };

            // Buscando o token FCM do usuário
            const userDoc = await db.collection('Usuarios').doc(userId).get();
            const userToken = userDoc.data().fcmToken;

            if (userToken) {
                await admin.messaging().sendToDevice(userToken, feedbackPayload);
                console.log('Notificação de feedback enviada!');
            }
        }
    });
