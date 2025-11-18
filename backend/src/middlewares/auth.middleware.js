const { verifyAccessToken } = require('../utils/jwt.utils');
const { prisma } = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { 
        id: decoded.userId,
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        studentProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true
          }
        },
        companyProfile: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            isVerified: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid or expired token'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

const verifyEmailRequired = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required'
    });
  }
  next();
};

const companyVerificationRequired = (req, res, next) => {
  if (req.user.role === 'COMPANY' && !req.user.companyProfile?.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Company verification required'
    });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  verifyEmailRequired,
  companyVerificationRequired
};
