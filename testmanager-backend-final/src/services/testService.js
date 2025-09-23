const admin = require("../config/firebase");
const { db } = require("../config/database");

function testsCollection(projectId) {
  return db.collection("projects").doc(projectId).collection("tests");
}

const testService = {
  async list(projectId) {
    const snap = await testsCollection(projectId).orderBy("createdAt","desc").get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  async create(projectId, data, user) {
    const ref = testsCollection(projectId).doc();
    const payload = {
      title: data.title,
      description: data.description || "",
      status: data.status || "todo",
      steps: Array.isArray(data.steps) ? data.steps : [],
      evidences: [],
      runBy: user?.uid || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(payload);
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },
  async update(projectId, testId, data) {
    const ref = testsCollection(projectId).doc(testId);
    await ref.set({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },
  async remove(projectId, testId, { cascadeStorage = true } = {}) {
    // Optionally delete evidences from Storage
    if (cascadeStorage) {
      const doc = await testsCollection(projectId).doc(testId).get();
      if (doc.exists) {
        const data = doc.data() || {};
        const evidences = Array.isArray(data.evidences) ? data.evidences : [];
        const bucket = admin.storage().bucket();
        for (const ev of evidences) {
          if (ev?.path) {
            try { await bucket.file(ev.path).delete({ ignoreNotFound: true }); } catch (_) {}
          }
        }
      }
    }
    await testsCollection(projectId).doc(testId).delete();
    return { id: testId };
  },
  async addEvidence(projectId, testId, evidence) {
    const ref = testsCollection(projectId).doc(testId);
    await ref.set({
      evidences: admin.firestore.FieldValue.arrayUnion({
        path: evidence.path,
        url: evidence.url,
        contentType: evidence.contentType || null,
        size: evidence.size || null,
        name: evidence.name || null,
        uploadedBy: evidence.uploadedBy || null,
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },
  async removeEvidence(projectId, testId, path) {
    const ref = testsCollection(projectId).doc(testId);
    const doc = await ref.get();
    if (!doc.exists) return null;
    const data = doc.data();
    const evidences = Array.isArray(data.evidences) ? data.evidences : [];
    const target = evidences.find(e => e.path === path);
    if (!target) return { id: testId, ...data };

    // delete from storage
    try {
      const bucket = admin.storage().bucket();
      await bucket.file(path).delete({ ignoreNotFound: true });
    } catch (e) {
      // ignore deletion errors
    }

    await ref.set({
      evidences: admin.firestore.FieldValue.arrayRemove(target),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    const newDoc = await ref.get();
    return { id: newDoc.id, ...newDoc.data() };
  }
};

module.exports = testService;
