import { generateToken, agentPrompt, salonContext } from '../config/livekit.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import HelpRequestService from './helpRequestService.js';

/**
 * Service for AI Agent operations
 */
export class AgentService {
  /**
   * Generate LiveKit access token for agent
   */
  static generateAgentToken(roomName) {
    const identity = `agent-${Date.now()}`;
    return {
      token: generateToken(identity, roomName),
      identity,
      roomName,
    };
  }

  /**
   * Get agent configuration including prompt and context
   */
  static getAgentConfig() {
    return {
      systemPrompt: agentPrompt,
      context: salonContext,
      functions: [
        {
          name: 'request_help',
          description: 'Request help from supervisor when you don\'t know the answer',
          parameters: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'The customer\'s question that needs supervisor help',
              },
              customerPhone: {
                type: 'string',
                description: 'Customer phone number for follow-up',
              },
            },
            required: ['question', 'customerPhone'],
          },
        },
      ],
    };
  }

  /**
   * Handle agent function calls (e.g., request_help)
   */
  static async handleFunctionCall(functionName, args, callId) {
    if (functionName === 'request_help') {
      return await this.handleRequestHelp(args.question, args.customerPhone, callId);
    }

    throw new Error(`Unknown function: ${functionName}`);
  }

  /**
   * Handle request_help function call
   */
  static async handleRequestHelp(question, customerPhone, callId) {
    try {
      // Create help request
      const request = await HelpRequestService.createHelpRequest(
        customerPhone,
        question,
        callId
      );

      return {
        success: true,
        message: 'Let me check with my supervisor and get back to you shortly.',
        requestId: request.id,
      };
    } catch (error) {
      console.error('Error handling request_help:', error);
      return {
        success: false,
        message: 'I apologize, but I\'m having trouble processing your request. Please call us directly.',
      };
    }
  }

  /**
   * Check knowledge base before asking supervisor
   * Returns answer if found, null otherwise
   */
  static async checkKnowledgeBase(question) {
    try {
      const results = await KnowledgeBase.search(question);
      
      if (results.length > 0 && results[0].similarity > 0.7) {
        // High confidence match found
        const match = results[0];
        await KnowledgeBase.recordUse(match.id);
        
        console.log(`[KNOWLEDGE BASE HIT] Question: "${question}"`);
        console.log(`Matched: "${match.question}" (${(match.similarity * 100).toFixed(1)}% similarity)`);
        
        return match.answer;
      }

      return null;
    } catch (error) {
      console.error('Error checking knowledge base:', error);
      return null;
    }
  }

  /**
   * Simulate receiving a call
   * This would integrate with LiveKit in production
   */
  static async simulateCall(customerPhone, customerMessage) {
    const callId = `call-${Date.now()}`;
    
    console.log('\n========================================');
    console.log('📞 [INCOMING CALL]');
    console.log('========================================');
    console.log(`Call ID: ${callId}`);
    console.log(`From: ${customerPhone}`);
    console.log(`Message: "${customerMessage}"`);
    console.log('========================================\n');

    // First, check knowledge base
    const knownAnswer = await this.checkKnowledgeBase(customerMessage);
    
    if (knownAnswer) {
      console.log(`[AI RESPONSE] ${knownAnswer}\n`);
      return {
        callId,
        handled: true,
        response: knownAnswer,
        source: 'knowledge_base',
      };
    }

    // Check if it's a basic question from salon context
    const basicAnswer = this.getBasicAnswer(customerMessage);
    
    if (basicAnswer) {
      console.log(`[AI RESPONSE] ${basicAnswer}\n`);
      return {
        callId,
        handled: true,
        response: basicAnswer,
        source: 'basic_knowledge',
      };
    }

    // Need supervisor help
    console.log('[AI] I don\'t know the answer. Escalating to supervisor...\n');
    
    const result = await this.handleRequestHelp(customerMessage, customerPhone, callId);
    
    return {
      callId,
      handled: false,
      response: result.message,
      requestId: result.requestId,
      source: 'escalated',
    };
  }

  /**
   * Get basic answer from salon context
   */
  static getBasicAnswer(question) {
    const lower = question.toLowerCase();
    
    // Hours
    if (lower.includes('hour') || lower.includes('open') || lower.includes('close')) {
      return `We're open ${salonContext.hours}.`;
    }
    
    // Location
    if (lower.includes('where') || lower.includes('location') || lower.includes('address')) {
      return `We're located at ${salonContext.location}.`;
    }
    
    // Phone
    if (lower.includes('phone') || lower.includes('number') || lower.includes('contact')) {
      return `You can reach us at ${salonContext.phone}.`;
    }
    
    // Services (general)
    if (lower.includes('service') && !lower.includes('price') && !lower.includes('cost')) {
      const serviceList = salonContext.services.map(s => s.name).join(', ');
      return `We offer the following services: ${serviceList}. Would you like pricing information?`;
    }
    
    // Specific service pricing
    for (const service of salonContext.services) {
      if (lower.includes(service.name.toLowerCase())) {
        return `${service.name} costs ${service.price} and takes about ${service.duration}.`;
      }
    }
    
    return null;
  }
}

export default AgentService;