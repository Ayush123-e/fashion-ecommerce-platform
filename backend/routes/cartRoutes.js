import express from 'express';
import { getCart, addCartItem, updateCartItem, deleteCartItem } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all cart endpoints with authentication
router.use(protect);

router.get('/', getCart);
router.post('/', addCartItem);
router.put('/:productId', updateCartItem);
router.delete('/:productId', deleteCartItem);

export default router;
