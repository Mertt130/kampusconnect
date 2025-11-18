const express = require('express');
const { body, query } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticate, authorize, companyVerificationRequired } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = express.Router();

// Get all jobs (public)
router.get('/', async (req, res, next) => {
  try {
    const {
      search,
      jobType,
      location,
      city,
      salaryMin,
      salaryMax,
      isRemote,
      companyId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;
    
    const where = {
      isActive: true,
      deletedAt: null,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { company: { companyProfile: { companyName: { contains: search, mode: 'insensitive' } } } }
        ]
      }),
      ...(jobType && { jobType }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(salaryMin && { salaryMax: { gte: parseInt(salaryMin) } }),
      ...(salaryMax && { salaryMin: { lte: parseInt(salaryMax) } }),
      ...(isRemote === 'true' && { isRemote: true }),
      ...(companyId && { companyId })
    };
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              email: true,
              companyProfile: {
                select: {
                  companyName: true,
                  logoUrl: true,
                  sector: true,
                  city: true
                }
              }
            }
          },
          _count: {
            select: { applications: true }
          }
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { [sortBy]: order }
      }),
      prisma.job.count({ where })
    ]);
    
    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single job (public)
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const job = await prisma.job.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: null
      },
      include: {
        company: {
          select: {
            id: true,
            email: true,
            companyProfile: true
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Increment view count
    await prisma.job.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
});

// Create job (company only)
router.post('/',
  authenticate,
  authorize('COMPANY'),
  companyVerificationRequired,
  [
    body('title').notEmpty().isLength({ max: 200 }),
    body('description').notEmpty(),
    body('jobType').isIn(['FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE', 'REMOTE']),
    body('location').notEmpty(),
    body('applicationDeadline').optional().isISO8601()
  ],
  validate,
  async (req, res, next) => {
    try {
      const job = await prisma.job.create({
        data: {
          ...req.body,
          companyId: req.user.id,
          applicationDeadline: req.body.applicationDeadline ? new Date(req.body.applicationDeadline) : undefined
        },
        include: {
          company: {
            select: {
              companyProfile: true
            }
          }
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update job (company only)
router.put('/:id',
  authenticate,
  authorize('COMPANY'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check ownership
      const existingJob = await prisma.job.findFirst({
        where: {
          id,
          companyId: req.user.id
        }
      });
      
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or unauthorized'
        });
      }
      
      const job = await prisma.job.update({
        where: { id },
        data: {
          ...req.body,
          applicationDeadline: req.body.applicationDeadline ? new Date(req.body.applicationDeadline) : undefined
        }
      });
      
      res.json({
        success: true,
        message: 'Job updated successfully',
        data: job
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete job (soft delete)
router.delete('/:id',
  authenticate,
  authorize('COMPANY'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check ownership
      const job = await prisma.job.findFirst({
        where: {
          id,
          companyId: req.user.id
        }
      });
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or unauthorized'
        });
      }
      
      await prisma.job.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date()
        }
      });
      
      res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// Toggle job status
router.patch('/:id/toggle',
  authenticate,
  authorize('COMPANY'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const job = await prisma.job.findFirst({
        where: {
          id,
          companyId: req.user.id
        }
      });
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or unauthorized'
        });
      }
      
      const updatedJob = await prisma.job.update({
        where: { id },
        data: {
          isActive: !job.isActive
        }
      });
      
      res.json({
        success: true,
        message: `Job ${updatedJob.isActive ? 'activated' : 'deactivated'} successfully`,
        data: updatedJob
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get company's jobs
router.get('/company/:companyId', async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const where = {
      companyId,
      isActive: true,
      deletedAt: null
    };
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          _count: {
            select: { applications: true }
          }
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.job.count({ where })
    ]);
    
    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get my jobs (company)
router.get('/my/jobs',
  authenticate,
  authorize('COMPANY'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, status = 'all' } = req.query;
      
      const where = {
        companyId: req.user.id,
        ...(status === 'active' && { isActive: true, deletedAt: null }),
        ...(status === 'inactive' && { isActive: false }),
        ...(status === 'deleted' && { deletedAt: { not: null } })
      };
      
      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            _count: {
              select: { applications: true }
            }
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.job.count({ where })
      ]);
      
      res.json({
        success: true,
        data: jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
