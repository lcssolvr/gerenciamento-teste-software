const admin = require("../config/firebase");
const db = admin.firestore();

const clientService = {
  async createClient(data) {
    const clientRef = db.collection("clients").doc();
    await clientRef.set({
      name: data.name,
      email: data.email,
      company: data.company || null,
      phone: data.phone || null,
      address: data.address || null,
      notes: data.notes || null,
      isActive: true,
      createdAt: new Date(),
    });
    return { id: clientRef.id, ...data };
  },

  async getClient(id) {
    const doc = await db.collection("clients").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async listClients() {
    const snapshot = await db.collection("clients").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};

module.exports = clientService;
