import prisma from '../lib/db.js';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
// Simple in-memory cache for products to speed up response
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

export const getProducts = async (req, res) => {
  const { search, category, minPrice, maxPrice, size, sortBy, sort, page, limit } = req.query;

  try {
    // Generate a unique cache key based on query params
    const cacheKey = JSON.stringify(req.query || {});
    const cachedData = cache.get(cacheKey);
    
    // Return cached data if valid
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.status(200).json(cachedData.data);
    }

    const where = {};

    // Apply search filter (name or description)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Apply category filter (ignore if 'All')
    if (category && category !== 'All') {
      where.category = {
        name: { equals: category, mode: 'insensitive' }
      };
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = Number(minPrice);
      }
      if (maxPrice) {
        where.price.lte = Number(maxPrice);
      }
    }

    // Apply size filter (checks if size is in the sizes array)
    if (size) {
      where.sizes = {
        has: size
      };
    }

    // Determine sorting criteria (sortBy or sort alias)
    const selectedSort = sortBy || sort;
    let orderBy = {};
    if (selectedSort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (selectedSort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (selectedSort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else {
      // Default to sorting by newest items
      orderBy = { createdAt: 'desc' };
    }

    // Determine if pagination is requested (checks if page or limit query parameters exist)
    const hasPagination = page !== undefined || limit !== undefined;

    if (hasPagination) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 9;
      const skip = (pageNum - 1) * limitNum;

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limitNum,
          include: {
            category: {
              select: { name: true }
            }
          }
        }),
        prisma.product.count({ where })
      ]);

      const result = {
        products,
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
        limit: limitNum
      };
      
      // Save to cache
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return res.status(200).json(result);
    }

    // Unpaginated raw array callback fallback (maintains compatibility with other views)
    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    // Save to cache
    cache.set(cacheKey, { data: products, timestamp: Date.now() });
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Internal server error while fetching products', error: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return res.status(500).json({ message: 'Internal server error while fetching product details' });
  }
};
