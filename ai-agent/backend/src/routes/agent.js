import express from 'express';
import AgentController from '../controllers/agentController.js';
import { AccessToken } from 'livekit-server-sdk'; // ← Add this import at the top

const router = express.Router();

// Agent configuration
router.get('/config', AgentController.getConfig);

// Generate LiveKit token
router.post('/token', AgentController.generateToken);

// Handle function calls
router.post('/function-call', AgentController.handleFunctionCall);

// Simulate call (for testing)
router.post('/simulate-call', AgentController.simulateCall);

// Check knowledge base
router.post('/check-knowledge', AgentController.checkKnowledge);

// Voice token route - FIXED VERSION
router.post('/voice/token', async (req, res) => {
  try {
    const { customerPhone, roomName } = req.body;
    
    console.log('📞 Voice token request:', { customerPhone, roomName });
    
    // Validate environment variables
    if (!process.env.LIVEKIT_API_KEY || !process.env.LIVEKIT_API_SECRET) {
      throw new Error('LiveKit credentials not configured');
    }
    
    // Create access token
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: customerPhone || `user-${Date.now()}`,
      }
    );
    
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    
    console.log('✅ Token generated successfully for room:', roomName);
    
    res.json({
      token,
      roomName,
      serverUrl: process.env.LIVEKIT_URL
    });
  } catch (error) {
    console.error('❌ Token generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message 
    });
  }
});

export default router;