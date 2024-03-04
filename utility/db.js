import 'dotenv/config';
import admin from 'firebase-admin';
// import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

const { AUTH_DOMAIN, CLIENT_EMAIL, PRIVATE_KEY, PROJECT_ID } = process.env;

admin.initializeApp({
  credential: admin.credential.cert({
    clientEmail: CLIENT_EMAIL,
    privateKey: PRIVATE_KEY,
    projectId: PROJECT_ID,
  }),
  databaseURL: `https://${AUTH_DOMAIN}`,
});

export const db = admin.firestore();
