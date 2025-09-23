const { db, COLLECTIONS, firestoreUtils } = require("../config/database");

const clientService = {
  async createClient(data) {
    const ref = db.collection(COLLECTIONS.CLIENTS).doc();
    const payload = firestoreUtils.stampCreate({
      name: data.name,
      email: data.email || null,
      company: data.company || null,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
      isActive: data.isActive ?? true,
    });
    await ref.set(payload);
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async updateClient(id, data) {
    const ref = db.collection(COLLECTIONS.CLIENTS).doc(id);
    await ref.set(firestoreUtils.stampUpdate(data), { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async deleteClient(id) {
    await db.collection(COLLECTIONS.CLIENTS).doc(id).delete();
    return { id };
  },

  async getClient(id) {
    const doc = await db.collection(COLLECTIONS.CLIENTS).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async listClients() {
    const snap = await db.collection(COLLECTIONS.CLIENTS).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
};

module.exports = clientService;
