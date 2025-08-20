const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();
const db = admin.firestore();

// Função que dispara após a conclusão de um plano ou aula
exports.requestFeedback = functions.firestore
    .document('Usuarios/{userId}/Planos/{planoId}') // Ou sua estrutura equivalente
    .onUpdate(async (change, context) => {
        const userData = change.after.data();
        const userId = context.params.userId;
        const planoId = context.params.planoId;

        // Checa se o plano foi concluído ou se está ativo
        if (userData.status === 'completed') {
            // Enviar um feedback (notificação ou e-mail)
            const feedbackPayload = {
                notification: {
                    title: 'Avalie sua aula/plano',
                    body: 'Sua experiência é importante para nós! Por favor, nos diga o que achou da aula/plano.',
                },
            };

            // Buscando o token FCM do usuário
            const userRef = db.collection('Usuarios').doc(userId);
            const userSnap = await userRef.get();
            const user = userSnap.data();
            const fcmToken = user?.fcmToken; // Supondo que o token FCM esteja no Firestore

            if (fcmToken) {
                await admin.messaging().sendToDevice(fcmToken, feedbackPayload);
            }
        }

        return null;
    });

// Função para salvar o feedback
exports.saveFeedback = functions.firestore
    .document('Feedbacks/{feedbackId}')
    .onCreate(async (snapshot, context) => {
        const feedbackData = snapshot.data();

        // Aqui você pode fazer algo como calcular a média das avaliações ou gerar relatórios
        console.log(`Novo feedback de ${feedbackData.userId}: ${feedbackData.rating}`);
        
        return null;
    });
