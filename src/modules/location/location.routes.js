import express from 'express';
import * as locationController from './location.controller.js';
import authMiddleware from '../../middlewares/auth.middleware.js';
import roleMiddleware from '../../middlewares/role.middleware.js';

const router = express.Router();

// Public: পেশেন্টদের জন্য (শুধু Active লোকেশন যাবে)
router.get('/', locationController.getLocations);

// Protected: Admin/Super Admin এর জন্য
router.get('/admin', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), locationController.getAdminLocations);

router.post('/', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), locationController.createLocation);

// Status Change (Pause/Active)
router.patch('/:id/toggle', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), locationController.toggleLocation);

// Delete Location
router.delete('/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), locationController.deleteLocation);

export default router;