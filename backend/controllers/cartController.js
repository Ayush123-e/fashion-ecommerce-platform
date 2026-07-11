import prisma from '../lib/db.js';

// @desc    Get logged in user's cart items
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            stock: true
          }
        }
      }
    });

    return res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({ message: 'Internal server error while fetching cart' });
  }
};

// @desc    Add product to cart
// @route   POST /api/cart
// @access  Private
export const addCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const qty = parseInt(quantity) || 1;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    // Check if product exists and check stock limits
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already exists in the cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    let cartItem;
    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      if (newQty > product.stock) {
        return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left in inventory.` });
      }

      cartItem = await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId: req.user.id,
            productId
          }
        },
        data: { quantity: newQty },
        include: { product: true }
      });
    } else {
      if (qty > product.stock) {
        return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left in inventory.` });
      }

      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity: qty
        },
        include: { product: true }
      });
    }

    return res.status(200).json(cartItem);
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return res.status(500).json({ message: 'Internal server error while updating cart' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
export const updateCartItem = async (req, res) => {
  const productId = req.params.productId || req.params.id || req.body.productId;
  const { quantity } = req.body;
  const qty = parseInt(quantity);

  if (!productId || isNaN(qty) || qty <= 0) {
    return res.status(400).json({ message: 'Valid Product ID and positive quantity are required' });
  }

  try {
    // Check if product exists and check stock limits
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (qty > product.stock) {
      return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left in inventory.` });
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      },
      data: { quantity: qty },
      include: { product: true }
    });

    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return res.status(500).json({ message: 'Internal server error while updating item quantity' });
  }
};

// @desc    Delete cart item
// @route   DELETE /api/cart/:productId
// @access  Private
export const deleteCartItem = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    // Check if cart item exists before deleting
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId
        }
      }
    });

    return res.status(200).json({ message: 'Item successfully removed from cart' });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return res.status(500).json({ message: 'Internal server error while deleting cart item' });
  }
};
