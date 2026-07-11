import jwt from 'jsonwebtoken';
import prisma from '../lib/db.js';

// Protect routes to ensure user is logged in
export const protect = async (req, res, next) => {
  let token;

  // Check if authorization header is present and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from database and exclude password
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found, authentication failed' });
      }

      // Attach user to req object
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT validation error:', error);
      return res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token signature missing' });
  }
};

// Gate routes for admin access only
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    return res.status(403).json({ message: 'Access forbidden, administrator permission required' });
  }
};
