const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

// Função para enviar uma notificação push para o usuário quando o plano estiver prestes a expirar
exports.sendPushNotification = functions.firestore
    .document('Usuarios/{userId}')
    .onUpdate(async (change, context) => {
        const userData = change.after.data();

        if (userData.plan && userData.plan.status === 'active') {
            const trialEndsAt = userData.plan.trialEndsAt;
            const sevenDaysBefore = new Date(trialEndsAt.seconds * 1000 - 7 * 24 * 60 * 60 * 1000); // 7 dias antes

            if (new Date() > sevenDaysBefore) {
                const payload = {
                    notification: {
                        title: 'Seu plano está prestes a expirar!',
                        body: 'Renove seu plano para continuar acessando nossas aulas.',
                    },
                };

                // Pegue o token de FCM do usuário
                const userRef = admin.firestore().collection('Usuarios').doc(context.params.userId);
                const userSnap = await userRef.get();
                const user = userSnap.data();
                const fcmToken = user?.fcmToken; 

                if (fcmToken) {
                    await admin.messaging().sendToDevice(fcmToken, payload);
                }
            }
        }

        return null;
    });

// Função para enviar uma notificação sobre um novo plano ou evento
exports.sendNewPlanEventNotification = functions.firestore
    .document('Planos/{planoId}')
    .onCreate(async (snapshot, context) => {
        const newPlan = snapshot.data();

        const payload = {
            notification: {
                title: 'Novo plano disponível!',
                body: `Confira o novo plano de ${newPlan?.name}.`,
            },
        };

        const usersSnapshot = await admin.firestore().collection('Usuarios').where('plan.status', '==', 'active').get();
        const fcmTokens = [];
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            if (user?.fcmToken) {
                fcmTokens.push(user.fcmToken);
            }
        });

        if (fcmTokens.length > 0) {
            await admin.messaging().sendToDevice(fcmTokens, payload);
        }

        return null;
    });
