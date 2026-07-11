import prisma from '../lib/db.js';

// --- PRODUCT CRUD OPERATIONS ---

// @desc    Create a new product listing
// @route   POST /api/admin/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, description, price, images, sizes, stock, categoryId } = req.body;

  // Basic check for required properties
  if (!name || !description || !price || !categoryId) {
    return res.status(400).json({ message: 'Name, description, price, and categoryId are required' });
  }

  // Validate price is positive
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    return res.status(400).json({ message: 'Price must be a valid number greater than 0' });
  }

  // Validate stock is non-negative integer
  if (stock !== undefined) {
    const stockNum = Number(stock);
    if (isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      return res.status(400).json({ message: 'Inventory stock must be a non-negative integer' });
    }
  }

  try {
    // Validate if Category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return res.status(400).json({ message: 'Target category does not exist' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        images: images || [],
        sizes: sizes || [],
        stock: stock !== undefined ? parseInt(stock) : 0,
        categoryId
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ message: 'Internal server error while creating product listing' });
  }
};

// @desc    Update an existing product catalog listing
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, images, sizes, stock, categoryId } = req.body;

  try {
    // Validate price if specified
    if (price !== undefined) {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        return res.status(400).json({ message: 'Price must be a valid number greater than 0' });
      }
    }

    // Validate stock if specified
    if (stock !== undefined) {
      const stockNum = Number(stock);
      if (isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
        return res.status(400).json({ message: 'Inventory stock must be a non-negative integer' });
      }
    }

    // Check if target product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Verify category if categoryId is updated
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });
      if (!category) {
        return res.status(400).json({ message: 'Target category does not exist' });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? Number(price) : undefined,
        images: images !== undefined ? images : undefined,
        sizes: sizes !== undefined ? sizes : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ message: 'Internal server error while updating product catalog' });
  }
};

// @desc    Delete a product listing
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate if product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Attempt delete
    await prisma.product.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Product listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);

    // Capture foreign key dependency block (referenced in OrderItem checks)
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: 'Cannot delete product because it is associated with historical order invoices. Consider setting its stock to 0 instead.'
      });
    }

    return res.status(500).json({ message: 'Internal server error while deleting product' });
  }
};

// --- SYSTEM-WIDE ORDER MANAGEMENT ---

// @desc    Get all orders placed in the system
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true
              }
            }
          }
        }
      }
    });

    // Map PENDING DB status to PLACED for the Admin view
    const mappedOrders = orders.map(order => ({
      ...order,
      status: order.status === 'PENDING' ? 'PLACED' : order.status
    }));

    return res.status(200).json(mappedOrders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    return res.status(500).json({ message: 'Internal server error while fetching orders history list' });
  }
};

// @desc    Update order lifecycle status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid order status. Status must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    // Validate if order exists
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Map PLACED input back to PENDING for the DB
    const dbStatus = status === 'PLACED' ? 'PENDING' : status;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: dbStatus },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, images: true }
            }
          }
        }
      }
    });

    // Map PENDING back to PLACED for response
    const mappedOrder = {
      ...updatedOrder,
      status: updatedOrder.status === 'PENDING' ? 'PLACED' : updatedOrder.status
    };

    return res.status(200).json(mappedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Internal server error while updating order lifecycle status' });
  }
};

// --- CATEGORY CRUD OPERATIONS ---

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return res.status(500).json({ message: 'Internal server error while fetching categories catalog' });
  }
};

// @desc    Create a new category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    // Check if category name already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const category = await prisma.category.create({
      data: { name: name.trim() }
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Internal server error while creating category' });
  }
};

// @desc    Update a category name
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Category name is required' });
  }

  try {
    // Validate target category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if name is taken by another category
    const existingName = await prisma.category.findUnique({
      where: { name: name.trim() }
    });

    if (existingName && existingName.id !== id) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name: name.trim() }
    });

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({ message: 'Internal server error while updating category' });
  }
};

// @desc    Delete a category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate target category exists
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category is associated with any products to prevent orphan catalog entries
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete category containing active products. Re-assign or delete those products first.'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Internal server error while deleting category' });
  }
};
