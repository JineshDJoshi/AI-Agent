import express from 'express';
import SupervisorController from '../controllers/supervisorController.js';

const router = express.Router();

// Help requests
router.get('/requests', SupervisorController.getRequests);
router.get('/requests/pending', SupervisorController.getPendingRequests);
router.post('/requests/:id/resolve', SupervisorController.resolveRequest);
router.put('/knowledge/:id', SupervisorController.updateKnowledge);

// Knowledge base
router.get('/knowledge', SupervisorController.getKnowledge);
router.post('/knowledge', SupervisorController.addKnowledge);
router.delete('/knowledge/:id', SupervisorController.deleteKnowledge);

// Dashboard stats
router.get('/stats', SupervisorController.getStats);

export default router;