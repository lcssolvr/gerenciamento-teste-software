const admin = require("../config/firebase");
const { db, COLLECTIONS, firestoreUtils } = require("../config/database");

const userService = {
  async createUserDoc(uid, data) {
    const ref = db.collection(COLLECTIONS.USERS).doc(uid);
    const payload = firestoreUtils.stampCreate({
      email: data.email,
      fullName: data.fullName || "",
      role: data.role || "collaborator",
      clientId: data.clientId || null,
      isActive: data.isActive ?? true
    });
    await ref.set(payload, { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async getUser(uid) {
    const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async listUsers() {
    const snap = await db.collection(COLLECTIONS.USERS).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async updateUser(uid, data) {
    const ref = db.collection(COLLECTIONS.USERS).doc(uid);
    await ref.set(firestoreUtils.stampUpdate(data), { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },
};

module.exports = userService;
