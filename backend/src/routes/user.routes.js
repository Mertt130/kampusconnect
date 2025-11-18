const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join('uploads', req.user.id);
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || 
      ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} not allowed`));
    }
  }
});

// Get user profile
router.get('/profile/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id, isActive: true, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        studentProfile: {
          select: {
            firstName: true,
            lastName: true,
            university: true,
            department: true,
            graduationYear: true,
            about: true,
            skills: true,
            profilePhotoUrl: true,
            city: true
          }
        },
        companyProfile: {
          select: {
            companyName: true,
            sector: true,
            employeeCount: true,
            description: true,
            website: true,
            logoUrl: true,
            city: true,
            isVerified: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Update current user profile
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    
    if (req.user.role === 'STUDENT') {
      await prisma.studentProfile.update({
        where: { userId },
        data: {
          firstName: updates.firstName,
          lastName: updates.lastName,
          university: updates.university,
          department: updates.department,
          graduationYear: updates.graduationYear,
          gpa: updates.gpa,
          about: updates.about,
          skills: updates.skills,
          languages: updates.languages,
          linkedinUrl: updates.linkedinUrl,
          githubUrl: updates.githubUrl,
          portfolioUrl: updates.portfolioUrl,
          phoneNumber: updates.phoneNumber,
          city: updates.city,
          birthDate: updates.birthDate ? new Date(updates.birthDate) : undefined
        }
      });
    } else if (req.user.role === 'COMPANY') {
      await prisma.companyProfile.update({
        where: { userId },
        data: {
          companyName: updates.companyName,
          sector: updates.sector,
          employeeCount: updates.employeeCount,
          foundedYear: updates.foundedYear,
          description: updates.description,
          website: updates.website,
          address: updates.address,
          city: updates.city,
          country: updates.country,
          phoneNumber: updates.phoneNumber,
          taxNumber: updates.taxNumber,
          linkedinUrl: updates.linkedinUrl,
          twitterUrl: updates.twitterUrl,
          facebookUrl: updates.facebookUrl,
          instagramUrl: updates.instagramUrl
        }
      });
    }
    
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: true,
        companyProfile: true
      }
    });
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

// Upload profile photo
router.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const fileUrl = `/uploads/${req.user.id}/${req.file.filename}`;
    
    if (req.user.role === 'STUDENT') {
      await prisma.studentProfile.update({
        where: { userId: req.user.id },
        data: { profilePhotoUrl: fileUrl }
      });
    } else if (req.user.role === 'COMPANY') {
      await prisma.companyProfile.update({
        where: { userId: req.user.id },
        data: { logoUrl: fileUrl }
      });
    }
    
    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { url: fileUrl }
    });
  } catch (error) {
    next(error);
  }
});

// Upload CV (students only)
router.post('/me/cv', authenticate, upload.single('cv'), async (req, res, next) => {
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({
        success: false,
        message: 'Only students can upload CV'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const fileUrl = `/uploads/${req.user.id}/${req.file.filename}`;
    
    await prisma.studentProfile.update({
      where: { userId: req.user.id },
      data: { cvUrl: fileUrl }
    });
    
    res.json({
      success: true,
      message: 'CV uploaded successfully',
      data: { url: fileUrl }
    });
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/me/password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS) || 10);
      
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      });
      
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete account (soft delete)
router.delete('/me', authenticate, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });
    
    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Search users (for messaging)
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { q, role } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        id: { not: req.user.id },
        ...(role && { role }),
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { studentProfile: { 
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } }
            ]
          }},
          { companyProfile: { 
            companyName: { contains: q, mode: 'insensitive' } 
          }}
        ]
      },
      select: {
        id: true,
        email: true,
        role: true,
        studentProfile: {
          select: {
            firstName: true,
            lastName: true,
            profilePhotoUrl: true
          }
        },
        companyProfile: {
          select: {
            companyName: true,
            logoUrl: true
          }
        }
      },
      take: 10
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
