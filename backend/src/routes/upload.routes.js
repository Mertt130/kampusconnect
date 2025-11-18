const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Configure multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let uploadDir = 'uploads';
    
    if (req.user) {
      uploadDir = path.join('uploads', req.user.id);
    }
    
    if (file.fieldname === 'verification') {
      uploadDir = path.join(uploadDir, 'verification');
    }
    
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || 
    ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} not allowed`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

// Upload single file
router.post('/single',
  authenticate,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      const fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
      
      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: fileUrl
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload multiple files
router.post('/multiple',
  authenticate,
  upload.array('files', 5),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }
      
      const files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/${file.path.replace(/\\/g, '/')}`
      }));
      
      res.json({
        success: true,
        message: 'Files uploaded successfully',
        data: files
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload company verification documents
router.post('/verification',
  authenticate,
  authorize('COMPANY'),
  upload.array('documents', 3),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No documents uploaded'
        });
      }
      
      const documentUrls = req.files.map(file => 
        `/${file.path.replace(/\\/g, '/')}`
      );
      
      // Update company profile with verification documents
      await prisma.companyProfile.update({
        where: { userId: req.user.id },
        data: {
          verificationDocs: documentUrls
        }
      });
      
      res.json({
        success: true,
        message: 'Verification documents uploaded successfully',
        data: documentUrls
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete file
router.delete('/:filename',
  authenticate,
  async (req, res, next) => {
    try {
      const { filename } = req.params;
      const filePath = path.join('uploads', req.user.id, filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }
      
      // Delete file
      await fs.unlink(filePath);
      
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
