import express from 'express';
import * as locationController from './location.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import roleMiddleware from '../../middlewares/role.middleware.js';

const router = express.Router();

// ✅ ১. Public Route: পেশেন্টরা সার্চ বারে লোকেশন দেখার জন্য (এখানে কোনো টোকেন বা পারমিশন লাগবে না)
router.get('/', locationController.getLocations);

// 🔒 ২. Protected Route: অ্যাডমিন লোকেশন অ্যাড করার জন্য (এখানে টোকেন এবং রোল লাগবে)
router.post(
  '/', 
  authMiddleware, 
  roleMiddleware('SUPER_ADMIN', 'ADMIN'), 
  locationController.createLocation
);

export default router;