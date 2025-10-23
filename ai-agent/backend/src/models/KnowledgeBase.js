import admin from '../config/firebase.js'; // ADD THIS IMPORT!
import { db, collections } from '../config/firebase.js';

export class KnowledgeBase {
  static collection = collections.KNOWLEDGE_BASE;

  /**
   * Add a new learned answer
   */
  static async add(data) {
    const knowledgeData = {
      question: this.normalizeQuestion(data.question),
      answer: data.answer,
      category: data.category || 'general',
      sourceRequestId: data.sourceRequestId || null,
      learnedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsed: null,
      useCount: 0,
      isActive: true,
    };

    const docRef = await db.collection(this.collection).add(knowledgeData);
    return { id: docRef.id, ...knowledgeData };
  }

  /**
   * Search for relevant knowledge
   */
  static async search(question) {
    const normalized = this.normalizeQuestion(question);
    
    // Simple keyword-based search
    // In production, you'd use vector embeddings or semantic search
    const snapshot = await db.collection(this.collection)
      .where('isActive', '==', true)
      .get();

    const results = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const similarity = this.calculateSimilarity(normalized, data.question);
      
      if (similarity > 0.5) { // 50% similarity threshold
        results.push({
          id: doc.id,
          ...data,
          similarity,
        });
      }
    });

    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Get all knowledge entries
   */
  static async getAll() {
    const snapshot = await db.collection(this.collection)
      .where('isActive', '==', true)
      .orderBy('learnedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Update use statistics
   */
  static async recordUse(id) {
    await db.collection(this.collection).doc(id).update({
      lastUsed: admin.firestore.FieldValue.serverTimestamp(),
      useCount: admin.firestore.FieldValue.increment(1),
    });
  }

  /**
   * Deactivate a knowledge entry
   */
  static async deactivate(id) {
    await db.collection(this.collection).doc(id).update({
      isActive: false,
    });
  }

  /**
   * Delete a knowledge entry (hard delete)
   */
  static async delete(id) {
    await db.collection(this.collection).doc(id).delete();
  }

  /**
   * Normalize question for better matching
   */
  static normalizeQuestion(question) {
    return question
      .toLowerCase()
      .trim()
      .replace(/[?.,!]/g, '')
      .replace(/\s+/g, ' ');
  }

  /**
   * Calculate similarity between two questions
   * Simple word overlap - in production use embeddings
   */
  static calculateSimilarity(q1, q2) {
    const words1 = new Set(q1.split(' '));
    const words2 = new Set(q2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Auto-categorize question
   */
  static categorizeQuestion(question) {
    const lower = question.toLowerCase();
    
    if (lower.includes('price') || lower.includes('cost') || lower.includes('$')) {
      return 'pricing';
    }
    if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule')) {
      return 'scheduling';
    }
    if (lower.includes('cancel') || lower.includes('policy') || lower.includes('refund')) {
      return 'policy';
    }
    if (lower.includes('hour') || lower.includes('open') || lower.includes('close')) {
      return 'hours';
    }
    
    return 'general';
  }
}

export default KnowledgeBase;

