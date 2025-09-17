const admin = require("../config/firebase");
const db = admin.firestore();

const projectService = {
  async createProject(data) {
    const projectRef = db.collection("projects").doc();
    await projectRef.set({
      name: data.name,
      description: data.description || "",
      status: "active",
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      estimatedHours: data.estimatedHours || null,
      actualHours: 0,
      notes: data.notes || null,
      clients: data.clients || [],
      collaborators: data.collaborators || [],
      createdAt: new Date(),
    });
    return { id: projectRef.id, ...data };
  },

  async getProject(id) {
    const doc = await db.collection("projects").doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async listProjects() {
    const snapshot = await db.collection("projects").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};

module.exports = projectService;
