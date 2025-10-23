import { db, collections } from '../config/firebase.js';

export class HelpRequest {
  static collection = collections.HELP_REQUESTS;

  /**
   * Create a new help request
   */
  static async create(data) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (process.env.REQUEST_TIMEOUT_MINUTES || 30) * 60 * 1000);

    const requestData = {
      customerPhone: data.customerPhone,
      customerQuestion: data.customerQuestion,
      callId: data.callId || null,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
      resolvedAt: null,
      supervisorAnswer: null,
      supervisorName: null,
      notifiedCustomer: false,
    };

    const docRef = await db.collection(this.collection).add(requestData);
    return { id: docRef.id, ...requestData };
  }

  /**
   * Get a help request by ID
   */
  static async getById(id) {
    const doc = await db.collection(this.collection).doc(id).get();
    if (!doc.exists) {
      throw new Error('Help request not found');
    }
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Get all pending help requests
   */
  static async getPending() {
    const snapshot = await db.collection(this.collection)
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Get all help requests (with optional filter)
   */
  static async getAll(filter = {}) {
    let query = db.collection(this.collection);

    if (filter.status) {
      query = query.where('status', '==', filter.status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(100).get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Resolve a help request with supervisor answer
   */
  static async resolve(id, answer, supervisorName) {
    const updateData = {
      status: 'resolved',
      resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
      supervisorAnswer: answer,
      supervisorName: supervisorName || 'Supervisor',
    };

    await db.collection(this.collection).doc(id).update(updateData);
    return this.getById(id);
  }

  /**
   * Mark request as expired
   */
  static async expire(id) {
    await db.collection(this.collection).doc(id).update({
      status: 'expired',
    });
    return this.getById(id);
  }

  /**
   * Mark customer as notified
   */
  static async markNotified(id) {
    await db.collection(this.collection).doc(id).update({
      notifiedCustomer: true,
    });
  }

  /**
   * Check and expire old pending requests
   */
  static async expireOldRequests() {
    const now = new Date();
    const snapshot = await db.collection(this.collection)
      .where('status', '==', 'pending')
      .where('expiresAt', '<=', now)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { status: 'expired' });
    });

    await batch.commit();
    return snapshot.size;
  }
}

export default HelpRequest;