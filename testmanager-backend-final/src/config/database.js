const admin = require('./firebase');

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Coleções do Firestore
const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients',
  PROJECTS: 'projects',
};

const nowTs = () => FieldValue.serverTimestamp();

const firestoreUtils = {
  stampCreate(data = {}) {
    return { ...data, createdAt: nowTs(), updatedAt: nowTs() };
  },
  stampUpdate(data = {}) {
    return { ...data, updatedAt: nowTs() };
  }
};

module.exports = { db, FieldValue, COLLECTIONS, firestoreUtils };
