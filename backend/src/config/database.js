const { db } = require('./firebase');

const COLLECTIONS = {
  USERS: 'users',
  CLIENTS: 'clients', 
  PROJECTS: 'projects',
  TESTS: 'tests'
};

const firestoreUtils = {
  convertTimestamp: (timestamp) => {
    if (!timestamp) return null;
    return timestamp.toDate().toISOString();
  },

  convertDoc: (doc) => {
    if (!doc.exists) return null;
    
    const data = doc.data();
    const converted = { id: doc.id };
    
    Object.keys(data).forEach(key => {
      if (data[key] && typeof data[key].toDate === 'function') {
        converted[key] = firestoreUtils.convertTimestamp(data[key]);
      } else {
        converted[key] = data[key];
      }
    });
    
    return converted;
  },

  convertCollection: (querySnapshot) => {
    return querySnapshot.docs.map(doc => firestoreUtils.convertDoc(doc));
  },

  addTimestamps: (data, isUpdate = false) => {
    const now = new Date();
    
    if (!isUpdate) {
      data.createdAt = now;
    }
    data.updatedAt = now;
    
    return data;
  }
};

module.exports = {
  db,
  COLLECTIONS,
  firestoreUtils
};

