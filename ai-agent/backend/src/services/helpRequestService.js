import HelpRequest from '../models/HelpRequest.js';
import KnowledgeBase from '../models/KnowledgeBase.js';

/**
 * Service layer for help request operations
 */
export class HelpRequestService {
  /**
   * Create a new help request and notify supervisor
   */
  static async createHelpRequest(customerPhone, customerQuestion, callId) {
    try {
      // Create the help request
      const request = await HelpRequest.create({
        customerPhone,
        customerQuestion,
        callId,
      });

      // Notify supervisor (simulated)
      await this.notifySupervisor(request);

      console.log(`[HELP REQUEST CREATED] ID: ${request.id}`);
      console.log(`Customer: ${customerPhone}`);
      console.log(`Question: ${customerQuestion}`);

      return request;
    } catch (error) {
      console.error('Error creating help request:', error);
      throw error;
    }
  }

  /**
   * Resolve a help request with supervisor's answer
   */
  static async resolveRequest(requestId, answer, supervisorName) {
    try {
      // Update the request
      const request = await HelpRequest.resolve(requestId, answer, supervisorName);

      // Add to knowledge base
      await this.addToKnowledgeBase(request);

      // Notify customer (simulated)
      await this.notifyCustomer(request);

      console.log(`[HELP REQUEST RESOLVED] ID: ${requestId}`);
      console.log(`Answer: ${answer}`);

      return request;
    } catch (error) {
      console.error('Error resolving help request:', error);
      throw error;
    }
  }

  /**
   * Get all help requests with filters
   */
  static async getRequests(filter = {}) {
    try {
      return await HelpRequest.getAll(filter);
    } catch (error) {
      console.error('Error fetching help requests:', error);
      throw error;
    }
  }

  /**
   * Get pending requests
   */
  static async getPendingRequests() {
    try {
      return await HelpRequest.getPending();
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  }

  /**
   * Add resolved request to knowledge base
   */
  static async addToKnowledgeBase(request) {
    try {
      const category = KnowledgeBase.categorizeQuestion(request.customerQuestion);
      
      await KnowledgeBase.add({
        question: request.customerQuestion,
        answer: request.supervisorAnswer,
        category,
        sourceRequestId: request.id,
      });

      console.log(`[KNOWLEDGE ADDED] Category: ${category}`);
    } catch (error) {
      console.error('Error adding to knowledge base:', error);
    }
  }

  /**
   * Simulate notifying supervisor
   * In production: send SMS via Twilio, push notification, email, etc.
   */
  static async notifySupervisor(request) {
    console.log('\n========================================');
    console.log('📱 [SUPERVISOR NOTIFICATION]');
    console.log('========================================');
    console.log(`To: Supervisor (${process.env.SUPERVISOR_PHONE || 'Not configured'})`);
    console.log(`Message: Hey, I need help answering this question:`);
    console.log(`  "${request.customerQuestion}"`);
    console.log(`From customer: ${request.customerPhone}`);
    console.log(`Request ID: ${request.id}`);
    console.log('========================================\n');

  }

  static async notifyCustomer(request) {
    console.log('\n========================================');
    console.log('📱 [CUSTOMER NOTIFICATION]');
    console.log('========================================');
    console.log(`To: ${request.customerPhone}`);
    console.log(`Message: Hi! I checked with my supervisor. Here's the answer:`);
    console.log(`  "${request.supervisorAnswer}"`);
    console.log(`Request ID: ${request.id}`);
    console.log('========================================\n');

    // Mark as notified
    await HelpRequest.markNotified(request.id);
  }

  /**
   * Background job to expire old requests
   */
  static async expireOldRequests() {
    try {
      const expiredCount = await HelpRequest.expireOldRequests();
      if (expiredCount > 0) {
        console.log(`[EXPIRED] ${expiredCount} old help requests`);
      }
    } catch (error) {
      console.error('Error expiring old requests:', error);
    }
  }
}

export default HelpRequestService;