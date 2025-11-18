const express = require('express');
const { body } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { sendEmail } = require('../utils/email.utils');

const router = express.Router();

// Apply to job (student only)
router.post('/',
  authenticate,
  authorize('STUDENT'),
  [
    body('jobId').notEmpty(),
    body('coverLetter').optional().isLength({ max: 2000 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const { jobId, coverLetter, expectedSalary, availableDate } = req.body;
      const studentId = req.user.id;
      
      // Check if job exists and is active
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          isActive: true,
          deletedAt: null
        },
        include: {
          company: {
            select: {
              email: true,
              companyProfile: true
            }
          }
        }
      });
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or inactive'
        });
      }
      
      // Check if already applied
      const existingApplication = await prisma.application.findUnique({
        where: {
          jobId_studentId: {
            jobId,
            studentId
          }
        }
      });
      
      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this job'
        });
      }
      
      // Get student profile
      const student = await prisma.user.findUnique({
        where: { id: studentId },
        include: { studentProfile: true }
      });
      
      // Create application
      const application = await prisma.application.create({
        data: {
          jobId,
          studentId,
          coverLetter,
          cvUrl: student.studentProfile?.cvUrl,
          portfolioUrl: student.studentProfile?.portfolioUrl,
          expectedSalary,
          availableDate: availableDate ? new Date(availableDate) : undefined
        }
      });
      
      // Update job application count
      await prisma.job.update({
        where: { id: jobId },
        data: { applicationCount: { increment: 1 } }
      });
      
      // Create notification for company
      await prisma.notification.create({
        data: {
          userId: job.companyId,
          type: 'APPLICATION_RECEIVED',
          title: 'Yeni Başvuru',
          content: `${student.studentProfile?.firstName} ${student.studentProfile?.lastName} "${job.title}" ilanınıza başvurdu`,
          actionUrl: `/applications/${application.id}`
        }
      });
      
      // Send email to company
      await sendEmail(job.company.email, 'applicationReceived', {
        jobTitle: job.title,
        applicantName: `${student.studentProfile?.firstName} ${student.studentProfile?.lastName}`,
        university: student.studentProfile?.university,
        department: student.studentProfile?.department,
        applicationUrl: `${process.env.FRONTEND_URL}/applications/${application.id}`
      }).catch(console.error);
      
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get my applications (student)
router.get('/my',
  authenticate,
  authorize('STUDENT'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      
      const where = {
        studentId: req.user.id,
        ...(status && { status })
      };
      
      const [applications, total] = await Promise.all([
        prisma.application.findMany({
          where,
          include: {
            job: {
              include: {
                company: {
                  select: {
                    companyProfile: {
                      select: {
                        companyName: true,
                        logoUrl: true,
                        sector: true
                      }
                    }
                  }
                }
              }
            }
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.application.count({ where })
      ]);
      
      res.json({
        success: true,
        data: applications,
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

// Get job applications (company)
router.get('/job/:jobId',
  authenticate,
  authorize('COMPANY'),
  async (req, res, next) => {
    try {
      const { jobId } = req.params;
      const { page = 1, limit = 20, status } = req.query;
      
      // Check job ownership
      const job = await prisma.job.findFirst({
        where: {
          id: jobId,
          companyId: req.user.id
        }
      });
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found or unauthorized'
        });
      }
      
      const where = {
        jobId,
        ...(status && { status })
      };
      
      const [applications, total] = await Promise.all([
        prisma.application.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                email: true,
                studentProfile: true
              }
            }
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.application.count({ where })
      ]);
      
      res.json({
        success: true,
        data: applications,
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

// Get single application
router.get('/:id',
  authenticate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: {
            include: {
              company: {
                select: {
                  id: true,
                  email: true,
                  companyProfile: true
                }
              }
            }
          },
          student: {
            select: {
              id: true,
              email: true,
              studentProfile: true
            }
          }
        }
      });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      
      // Check authorization
      if (req.user.id !== application.studentId && req.user.id !== application.job.companyId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update application status (company)
router.patch('/:id/status',
  authenticate,
  authorize('COMPANY'),
  [
    body('status').isIn(['REVIEWING', 'ACCEPTED', 'REJECTED']),
    body('rejectionReason').optional()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      
      // Get application with job
      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          job: true,
          student: {
            select: {
              email: true,
              studentProfile: true
            }
          }
        }
      });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      
      // Check job ownership
      if (application.job.companyId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      // Update application
      const updatedApplication = await prisma.application.update({
        where: { id },
        data: {
          status,
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
          reviewedAt: new Date(),
          reviewedBy: req.user.id
        }
      });
      
      // Create notification for student
      const statusText = {
        'REVIEWING': 'İnceleniyor',
        'ACCEPTED': 'Kabul Edildi',
        'REJECTED': 'Reddedildi'
      }[status];
      
      await prisma.notification.create({
        data: {
          userId: application.studentId,
          type: 'APPLICATION_STATUS_CHANGED',
          title: 'Başvuru Durumu Güncellendi',
          content: `"${application.job.title}" başvurunuz ${statusText}`,
          actionUrl: `/applications/${application.id}`
        }
      });
      
      // Send email to student
      await sendEmail(application.student.email, 'applicationStatusChanged', {
        applicantName: application.student.studentProfile?.firstName,
        jobTitle: application.job.title,
        status,
        statusText,
        message: rejectionReason,
        applicationUrl: `${process.env.FRONTEND_URL}/applications/${application.id}`
      }).catch(console.error);
      
      res.json({
        success: true,
        message: 'Application status updated',
        data: updatedApplication
      });
    } catch (error) {
      next(error);
    }
  }
);

// Withdraw application (student)
router.delete('/:id',
  authenticate,
  authorize('STUDENT'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      const application = await prisma.application.findUnique({
        where: { id }
      });
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      
      if (application.studentId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized'
        });
      }
      
      if (application.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Cannot withdraw application after review'
        });
      }
      
      await prisma.application.update({
        where: { id },
        data: { status: 'WITHDRAWN' }
      });
      
      // Update job application count
      await prisma.job.update({
        where: { id: application.jobId },
        data: { applicationCount: { decrement: 1 } }
      });
      
      res.json({
        success: true,
        message: 'Application withdrawn successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
