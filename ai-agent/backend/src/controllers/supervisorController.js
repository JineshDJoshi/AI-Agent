import HelpRequestService from '../services/helpRequestService.js';
import KnowledgeBaseService from '../services/knowledgeBaseService.js';

/**
 * Controller for supervisor-related endpoints
 */
export class SupervisorController {
  /**
   * GET /api/supervisor/requests
   * Get all help requests (with optional status filter)
   */
  static async getRequests(req, res) {
    try {
      const { status } = req.query;
      const filter = status ? { status } : {};
      
      const requests = await HelpRequestService.getRequests(filter);
      res.json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  }

  /**
 * PUT /api/supervisor/knowledge/:id
 * Update knowledge entry
 */
static async updateKnowledge(req, res) {
  try {
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const entry = await KnowledgeBaseService.updateKnowledge(id, {
      question,
      answer,
      category,
    });

    res.json(entry);
  } catch (error) {
    console.error('Error updating knowledge:', error);
    res.status(500).json({ error: 'Failed to update knowledge' });
  }
}

  /**
   * GET /api/supervisor/requests/pending
   * Get pending help requests
   */
  static async getPendingRequests(req, res) {
    try {
      const requests = await HelpRequestService.getPendingRequests();
      res.json(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      res.status(500).json({ error: 'Failed to fetch pending requests' });
    }
  }

  /**
   * POST /api/supervisor/requests/:id/resolve
   * Resolve a help request
   */
  static async resolveRequest(req, res) {
    try {
      const { id } = req.params;
      const { answer, supervisorName } = req.body;

      if (!answer) {
        return res.status(400).json({ error: 'answer is required' });
      }

      const request = await HelpRequestService.resolveRequest(
        id,
        answer,
        supervisorName || 'Supervisor'
      );

      res.json(request);
    } catch (error) {
      console.error('Error resolving request:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/supervisor/knowledge
   * Get all knowledge base entries
   */
  static async getKnowledge(req, res) {
    try {
      const knowledge = await KnowledgeBaseService.getAllKnowledge();
      res.json(knowledge);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      res.status(500).json({ error: 'Failed to fetch knowledge' });
    }
  }

  /**
   * POST /api/supervisor/knowledge
   * Add manual knowledge entry
   */
  static async addKnowledge(req, res) {
    try {
      const { question, answer, category } = req.body;

      if (!question || !answer) {
        return res.status(400).json({ 
          error: 'question and answer are required' 
        });
      }

      const entry = await KnowledgeBaseService.addKnowledge(
        question,
        answer,
        category
      );

      res.json(entry);
    } catch (error) {
      console.error('Error adding knowledge:', error);
      res.status(500).json({ error: 'Failed to add knowledge' });
    }
  }

  /**
   * DELETE /api/supervisor/knowledge/:id
   * Delete knowledge entry
   */
  static async deleteKnowledge(req, res) {
    try {
      const { id } = req.params;
      await KnowledgeBaseService.deleteKnowledge(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      res.status(500).json({ error: 'Failed to delete knowledge' });
    }
  }

  /**
   * GET /api/supervisor/stats
   * Get dashboard statistics
   */
  static async getStats(req, res) {
    try {
      const [allRequests, pendingRequests, knowledgeStats] = await Promise.all([
        HelpRequestService.getRequests(),
        HelpRequestService.getPendingRequests(),
        KnowledgeBaseService.getStats(),
      ]);

      const stats = {
        requests: {
          total: allRequests.length,
          pending: pendingRequests.length,
          resolved: allRequests.filter(r => r.status === 'resolved').length,
          expired: allRequests.filter(r => r.status === 'expired').length,
        },
        knowledge: knowledgeStats,
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
}

export default SupervisorController;