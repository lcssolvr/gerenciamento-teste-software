const { db, COLLECTIONS, firestoreUtils } = require("../config/database");

const projectService = {
  async createProject(data, createdBy) {
    const ref = db.collection(COLLECTIONS.PROJECTS).doc();
    const payload = firestoreUtils.stampCreate({
      name: data.name,
      description: data.description || "",
      status: data.status || "active",
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      estimatedHours: data.estimatedHours || null,
      actualHours: data.actualHours || 0,
      notes: data.notes || null,
      clients: data.clients || [],
      members: data.members || [],
      createdBy: createdBy || null
    });
    await ref.set(payload);
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async updateProject(id, data) {
    const ref = db.collection(COLLECTIONS.PROJECTS).doc(id);
    await ref.set(firestoreUtils.stampUpdate(data), { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async deleteProject(id) {
    await db.collection(COLLECTIONS.PROJECTS).doc(id).delete();
    return { id };
  },

  async getProject(id) {
    const doc = await db.collection(COLLECTIONS.PROJECTS).doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async listProjectsForUser(user) {
    const col = db.collection(COLLECTIONS.PROJECTS);
    if (user.role === 'admin' || user.role === 'collaborator') {
      const snap = await col.get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    // client role: filtrar por clientId
    if (user.role === 'client' && user.clientId) {
      const snap = await col.where('clients', 'array-contains', user.clientId).get();
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return [];
  },
};

module.exports = projectService;
