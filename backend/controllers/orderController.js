import prisma from '../lib/db.js';

// @desc    Create a new order from current cart (transaction-wrapped checkout)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  const userId = req.user.id;

  try {
    // Execute all database updates inside a safe database transaction to avoid race conditions
    const order = await prisma.$transaction(async (tx) => {
      // 1. Retrieve the user's current database cart items
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: {
          product: true
        }
      });

      if (cartItems.length === 0) {
        throw new Error('CART_EMPTY');
      }

      let totalPrice = 0;
      const orderItemsToCreate = [];

      // 2. Validate inventory stock levels and build order elements
      for (const item of cartItems) {
        const product = item.product;

        if (product.stock < item.quantity) {
          throw new Error(`STOCK_INSUFFICIENT:${product.name}`);
        }

        // Subtotal calculation
        const itemPrice = Number(product.price);
        const subtotal = itemPrice * item.quantity;
        totalPrice += subtotal;

        // Store current checkout price as a snapshot in OrderItem
        orderItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price
        });

        // 3. Decrement product inventory stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: product.stock - item.quantity
          }
        });
      }

      // 4. Create the final Order record and related OrderItems
      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalPrice,
          status: 'PENDING',
          orderItems: {
            create: orderItemsToCreate
          }
        },
        include: {
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true, images: true }
              }
            }
          }
        }
      });

      // 5. Clear the shopping cart
      await tx.cartItem.deleteMany({
        where: { userId }
      });

      return createdOrder;
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error('Checkout transaction failed:', error);

    if (error.message === 'CART_EMPTY') {
      return res.status(400).json({ message: 'Your shopping cart is empty.' });
    }

    if (error.message.startsWith('STOCK_INSUFFICIENT:')) {
      const productName = error.message.split(':')[1];
      return res.status(400).json({ message: `Insufficient inventory stock for item: ${productName}` });
    }

    return res.status(500).json({ message: 'Transaction failed during order placement process.' });
  }
};

// @desc    Get personal order history for logged in user
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
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

    return res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    return res.status(500).json({ message: 'Internal server error while fetching order history' });
  }
};

// @desc    Update order status by customer (Cancel pending/processing or mark shipped as delivered)
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateCustomerOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  if (status !== 'CANCELLED' && status !== 'DELIVERED') {
    return res.status(400).json({ message: 'Users can only cancel orders or mark them as delivered' });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ message: 'Access denied: You do not own this order' });
    }

    if (status === 'CANCELLED') {
      if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
        return res.status(400).json({ message: 'Only pending or processing orders can be cancelled' });
      }
    }

    if (status === 'DELIVERED') {
      if (order.status !== 'SHIPPED') {
        return res.status(400).json({ message: 'Only shipped orders can be marked as delivered' });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
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

    return res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating customer order status:', error);
    return res.status(500).json({ message: 'Internal server error while updating order status' });
  }
};
