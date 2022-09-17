import * as admin from 'firebase-admin'

admin.initializeApp({
  credential: process.env.GCP_SERVICE_ACCOUNT
    ? admin.credential.cert(JSON.parse(process.env.GCP_SERVICE_ACCOUNT))
    : admin.credential.applicationDefault(),
})
