import express from 'express';
import { createOrder, getMyOrders, updateCustomerOrderStatus } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all order routes with user verification
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/my-orders', getMyOrders);
router.put('/:id/status', updateCustomerOrderStatus);

export default router;
