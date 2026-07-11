import express from 'express';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Gate all routes in this file behind protect (authenticated session) and adminOnly (role role checker)
router.use(protect);
router.use(adminOnly);

// Product Catalog CRUD endpoints
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Category Catalog CRUD endpoints
router.get('/categories', getAllCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Orders System-wide endpoints
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
