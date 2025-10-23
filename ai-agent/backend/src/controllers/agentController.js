import AgentService from '../services/agentService.js';

/**
 * Controller for agent-related endpoints
 */
export class AgentController {
  /**
   * GET /api/agent/config
   * Get agent configuration
   */
  static async getConfig(req, res) {
    try {
      const config = AgentService.getAgentConfig();
      res.json(config);
    } catch (error) {
      console.error('Error getting agent config:', error);
      res.status(500).json({ error: 'Failed to get agent config' });
    }
  }

  /**
   * POST /api/agent/token
   * Generate LiveKit access token
   */
  static async generateToken(req, res) {
    try {
      const { roomName } = req.body;
      
      if (!roomName) {
        return res.status(400).json({ error: 'roomName is required' });
      }

      const tokenData = AgentService.generateAgentToken(roomName);
      res.json(tokenData);
    } catch (error) {
      console.error('Error generating token:', error);
      res.status(500).json({ error: 'Failed to generate token' });
    }
  }

  /**
   * POST /api/agent/function-call
   * Handle agent function calls
   */
  static async handleFunctionCall(req, res) {
    try {
      const { functionName, args, callId } = req.body;

      if (!functionName || !args) {
        return res.status(400).json({ error: 'functionName and args are required' });
      }

      const result = await AgentService.handleFunctionCall(functionName, args, callId);
      res.json(result);
    } catch (error) {
      console.error('Error handling function call:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/agent/simulate-call
   * Simulate a phone call (for testing)
   */
  static async simulateCall(req, res) {
    try {
      const { customerPhone, customerMessage } = req.body;

      if (!customerPhone || !customerMessage) {
        return res.status(400).json({ 
          error: 'customerPhone and customerMessage are required' 
        });
      }

      const result = await AgentService.simulateCall(customerPhone, customerMessage);
      res.json(result);
    } catch (error) {
      console.error('Error simulating call:', error);
      res.status(500).json({ error: 'Failed to simulate call' });
    }
  }

  /**
   * POST /api/agent/check-knowledge
   * Check if agent knows the answer
   */
  static async checkKnowledge(req, res) {
    try {
      const { question } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'question is required' });
      }

      const answer = await AgentService.checkKnowledgeBase(question);
      res.json({ 
        found: !!answer,
        answer: answer || null 
      });
    } catch (error) {
      console.error('Error checking knowledge:', error);
      res.status(500).json({ error: 'Failed to check knowledge' });
    }
  }

  // Add this new method to your existing AgentController

static async generateVoiceToken(req, res) {
  try {
    const { customerPhone, roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({ error: 'roomName is required' });
    }

    // Generate token using existing livekit config
    const { generateToken } = await import('../config/livekit.js');
    const token = generateToken(`customer-${Date.now()}`, roomName);

    console.log(`[VOICE] Token generated for ${customerPhone} in room ${roomName}`);

    res.json({
      token,
      roomName,
      serverUrl: process.env.LIVEKIT_URL,
    });
  } catch (error) {
    console.error('Error generating voice token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
}


}

export default AgentController;
