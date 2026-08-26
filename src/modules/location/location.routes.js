import express from 'express';
import * as locationController from './location.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js'; // Updated
import roleMiddleware from '../../middlewares/role.middleware.js'; // Updated

const router = express.Router();

// Public route for frontend search bar
router.get('/', locationController.getLocations);

// Protected route for Admin panel
router.post(
  '/', 
  authMiddleware, // 'protect' এর বদলে 'authMiddleware'
  roleMiddleware('SUPER_ADMIN', 'ADMIN'), 
  locationController.createLocation
);

export default router;