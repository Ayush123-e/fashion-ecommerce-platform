import prisma from '../lib/db.js';

// @desc    Get current user's wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  const userId = req.user.id;

  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return res.status(500).json({ message: 'Internal server error while fetching wishlist' });
  }
};

// @desc    Add product to user's wishlist
// @route   POST /api/wishlist
// @access  Private
export const addWishlistItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'ProductId is required' });
  }

  try {
    // Validate if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is already in the user's wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Product is already in wishlist' });
    }

    const item = await prisma.wishlistItem.create({
      data: {
        userId,
        productId
      },
      include: {
        product: {
          include: {
            category: {
              select: { name: true }
            }
          }
        }
      }
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return res.status(500).json({ message: 'Internal server error while adding to wishlist' });
  }
};

// @desc    Remove product from user's wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const deleteWishlistItem = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    // Validate existence
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    if (!existingItem) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }

    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    return res.status(200).json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return res.status(500).json({ message: 'Internal server error while removing from wishlist' });
  }
};
