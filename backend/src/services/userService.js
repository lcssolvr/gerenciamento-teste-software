const admin = require("../config/firebase");
const db = admin.firestore();

const userService = {
  async createUser(data) {
    const userRef = db.collection("users").doc(data.uid);
    await userRef.set({
      email: data.email,
      fullName: data.fullName || "",
      role: data.role || "collaborator",
      isActive: true,
      createdAt: new Date(),
    });
    return { id: userRef.id, ...data };
  },

  async getUser(uid) {
    const doc = await db.collection("users").doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async listUsers() {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};

module.exports = userService;
