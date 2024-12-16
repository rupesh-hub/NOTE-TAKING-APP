// In logging.routes.js
import express from 'express';
import { 
  getUserProjectLogs, 
  getLogDetails 
} from '../controller/logging.controller.js';
import { authenticationMiddleware } from '../../middleware/authentication.middleware.js';

const router = express.Router();

// Get user's project logs
router.get('/project-logs', authenticationMiddleware, getUserProjectLogs);

// Get specific log details
router.get('/logs/:logId', authenticationMiddleware, getLogDetails);

export default router;