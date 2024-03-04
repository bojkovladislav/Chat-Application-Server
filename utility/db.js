import 'dotenv/config';
import admin from 'firebase-admin';
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

const { AUTH_DOMAIN } = process.env;

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key,
    projectId: serviceAccount.project_id,
  }),
  databaseURL: `https://${AUTH_DOMAIN}`,
});

export const db = admin.firestore();
