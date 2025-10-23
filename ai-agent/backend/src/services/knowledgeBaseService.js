import admin from '../config/firebase.js'; // ADD THIS IMPORT!
import { db, collections } from '../config/firebase.js';
import KnowledgeBaseService from '../services/knowledgeBaseService.js';


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
   * Update a knowledge entry
   */
  static async update(id, updates) {
    const allowedUpdates = {
      question: updates.question ? this.normalizeQuestion(updates.question) : undefined,
      answer: updates.answer,
      category: updates.category,
      isActive: updates.isActive,
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    await db.collection(this.collection).doc(id).update(allowedUpdates);
    
    // Get updated document
    const doc = await db.collection(this.collection).doc(id).get();
    return { id: doc.id, ...doc.data() };
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

    static async getStats() {
    try {
      const allKnowledge = await KnowledgeBase.getAll();
      
      const stats = {
        total: allKnowledge.length,
        byCategory: {},
        mostUsed: [],
      };

      // Count by category
      allKnowledge.forEach(item => {
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      });

      // Get most used (top 5)
      stats.mostUsed = allKnowledge
        .sort((a, b) => b.useCount - a.useCount)
        .slice(0, 5)
        .map(item => ({
          question: item.question,
          useCount: item.useCount,
          category: item.category,
        }));

      return stats;
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      throw error;
    }
  }

    static async addKnowledge(question, answer, category) {
    try {
      return await KnowledgeBase.add({
        question,
        answer,
        category: category || KnowledgeBase.categorizeQuestion(question),
      });
    } catch (error) {
      console.error('Error adding knowledge:', error);
      throw error;
    }
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


  static async getAllKnowledge() {
    try {
      const snapshot = await db.collection('knowledge_base').get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all knowledge:', error);
      throw error;
    }
  }

  static async deleteKnowledge(id) {
    try {
      await KnowledgeBase.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error in deleteKnowledge:', error);
      throw error;
    }
  }


}

export default KnowledgeBase;

