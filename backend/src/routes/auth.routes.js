const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body } = require('express-validator');
const { prisma } = require('../config/database');
const { 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken
} = require('../utils/jwt.utils');
const { sendEmail } = require('../utils/email.utils');
const { validate } = require('../middlewares/validation.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['STUDENT', 'COMPANY']).withMessage('Invalid role'),
    body('firstName').if(body('role').equals('STUDENT')).notEmpty().withMessage('First name is required'),
    body('lastName').if(body('role').equals('STUDENT')).notEmpty().withMessage('Last name is required'),
    body('companyName').if(body('role').equals('COMPANY')).notEmpty().withMessage('Company name is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password, role, firstName, lastName, companyName, remember } = req.body;
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
      
      // Generate email verification token
      const emailVerifyToken = crypto.randomBytes(32).toString('hex');
      
      // Create user with profile
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          emailVerifyToken,
          ...(role === 'STUDENT' && {
            studentProfile: {
              create: {
                firstName,
                lastName,
                university: '',
                department: '',
                graduationYear: new Date().getFullYear() + 4
              }
            }
          }),
          ...(role === 'COMPANY' && {
            companyProfile: {
              create: {
                companyName,
                sector: ''
              }
            }
          })
        },
        include: {
          studentProfile: true,
          companyProfile: true
        }
      });
      
      // Generate tokens
      const accessToken = generateAccessToken(user.id, remember);
      const refreshToken = generateRefreshToken(user.id);
      
      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });
      
      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${emailVerifyToken}`;
      await sendEmail(email, 'welcome', {
        name: firstName || companyName,
        verificationUrl
      }).catch(console.error); // Don't fail if email fails
      
      // Set cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000
      });
      
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profile: user.studentProfile || user.companyProfile
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password, remember } = req.body;
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          studentProfile: true,
          companyProfile: true
        }
      });
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });
      
      // Generate tokens
      const accessToken = generateAccessToken(user.id, remember);
      const refreshToken = generateRefreshToken(user.id);
      
      // Save refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
      
      // Set cookies
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000
      });
      
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            profile: user.studentProfile || user.companyProfile
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Refresh token
router.post('/refresh-token', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const cookieToken = req.cookies?.refresh_token;
    const token = refreshToken || cookieToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }
    
    // Verify refresh token
    const decoded = verifyRefreshToken(token);
    
    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    
    // Generate new access token
    const accessToken = generateAccessToken(storedToken.userId);
    
    // Set cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000
    });
    
    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // Delete refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user.id }
    });
    
    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      isVerified: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      studentProfile: true,
      companyProfile: true
    }
  });
  
  res.json({
    success: true,
    data: user
  });
});

// Verify email
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { emailVerifyToken: token }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerifyToken: null
      }
    });
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      
      const user = await prisma.user.findUnique({
        where: { email }
      });
      
      if (!user) {
        // Don't reveal if email exists
        return res.json({
          success: true,
          message: 'If the email exists, a reset link has been sent'
        });
      }
      
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordExpiry: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
      });
      
      // Send reset email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      await sendEmail(email, 'passwordReset', {
        name: user.studentProfile?.firstName || user.companyProfile?.companyName || 'User',
        resetUrl
      }).catch(console.error);
      
      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Reset password
router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('password').isLength({ min: 6 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { token, password } = req.body;
      
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: hashedToken,
          resetPasswordExpiry: { gt: new Date() }
        }
      });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpiry: null
        }
      });
      
      res.json({
        success: true,
        message: 'Password reset successful'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
