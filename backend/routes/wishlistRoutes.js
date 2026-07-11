import express from 'express';
import { getWishlist, addWishlistItem, deleteWishlistItem } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all endpoints under this router with JWT auth
router.use(protect);

router.get('/', getWishlist);
router.post('/', addWishlistItem);
router.delete('/:productId', deleteWishlistItem);

export default router;
