const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');
const { sendEmail } = require('../utils/email.utils');

const router = express.Router();

// ============================================
// SUPER ADMIN ROUTES
// ============================================

// Dashboard stats (Super Admin + Moderator)
router.get('/dashboard', 
  authenticate, 
  authorize('SUPER_ADMIN', 'MODERATOR'),
  async (req, res, next) => {
    try {
      const [
        totalUsers,
        totalStudents,
        totalCompanies,
        totalJobs,
        totalApplications,
        pendingCompanies,
        pendingReports,
        recentUsers,
        recentJobs
      ] = await Promise.all([
        prisma.user.count({ where: { isActive: true, deletedAt: null } }),
        prisma.user.count({ where: { role: 'STUDENT', isActive: true, deletedAt: null } }),
        prisma.user.count({ where: { role: 'COMPANY', isActive: true, deletedAt: null } }),
        prisma.job.count({ where: { isActive: true, deletedAt: null } }),
        prisma.application.count(),
        prisma.companyProfile.count({ where: { isVerified: false } }),
        prisma.report.count({ where: { status: 'PENDING' } }),
        prisma.user.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            studentProfile: {
              select: { firstName: true, lastName: true }
            },
            companyProfile: {
              select: { companyName: true }
            }
          }
        }),
        prisma.job.findMany({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            company: {
              select: {
                companyProfile: {
                  select: { companyName: true }
                }
              }
            }
          }
        })
      ]);
      
      // Monthly stats for charts
      const currentDate = new Date();
      const monthlyStats = [];
      
      for (let i = 5; i >= 0; i--) {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);
        
        const [users, jobs] = await Promise.all([
          prisma.user.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }),
          prisma.job.count({
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          })
        ]);
        
        monthlyStats.push({
          month: startDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
          users,
          jobs
        });
      }
      
      res.json({
        success: true,
        data: {
          stats: {
            totalUsers,
            totalStudents,
            totalCompanies,
            totalJobs,
            totalApplications,
            pendingCompanies,
            pendingReports
          },
          recentUsers,
          recentJobs,
          monthlyStats
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all users (Super Admin only)
router.get('/users',
  authenticate,
  authorize('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, role, search, isActive } = req.query;
      
      const where = {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { studentProfile: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } }
              ]
            }},
            { companyProfile: {
              companyName: { contains: search, mode: 'insensitive' }
            }}
          ]
        })
      };
      
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            studentProfile: {
              select: {
                firstName: true,
                lastName: true,
                university: true,
                department: true
              }
            },
            companyProfile: {
              select: {
                companyName: true,
                sector: true,
                isVerified: true
              }
            }
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);
      
      res.json({
        success: true,
        data: users,
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

// Change user role (Super Admin only)
router.patch('/users/:id/role',
  authenticate,
  authorize('SUPER_ADMIN'),
  [body('role').isIn(['STUDENT', 'COMPANY', 'MODERATOR'])],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const user = await prisma.user.update({
        where: { id },
        data: { role }
      });
      
      // Log admin action
      await prisma.adminLog.create({
        data: {
          adminId: req.user.id,
          actionType: 'CHANGE_USER_ROLE',
          targetUserId: id,
          details: { oldRole: user.role, newRole: role },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      
      res.json({
        success: true,
        message: 'User role updated',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
);

// Ban/Unban user (Super Admin only)
router.patch('/users/:id/ban',
  authenticate,
  authorize('SUPER_ADMIN'),
  [body('isActive').isBoolean()],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const user = await prisma.user.update({
        where: { id },
        data: { isActive }
      });
      
      // Log admin action
      await prisma.adminLog.create({
        data: {
          adminId: req.user.id,
          actionType: isActive ? 'UNBAN_USER' : 'BAN_USER',
          targetUserId: id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      
      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'banned'} successfully`,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
);

// Delete user (Super Admin only - soft delete)
router.delete('/users/:id',
  authenticate,
  authorize('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      
      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          deletedAt: new Date()
        }
      });
      
      // Log admin action
      await prisma.adminLog.create({
        data: {
          adminId: req.user.id,
          actionType: 'DELETE_USER',
          targetUserId: id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================
// MODERATOR ROUTES (Also accessible by Super Admin)
// ============================================

// Get pending company verifications
router.get('/pending-companies',
  authenticate,
  authorize('SUPER_ADMIN', 'MODERATOR'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      const where = { isVerified: false };
      
      const [companies, total] = await Promise.all([
        prisma.companyProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                email: true,
                createdAt: true
              }
            }
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'asc' }
        }),
        prisma.companyProfile.count({ where })
      ]);
      
      res.json({
        success: true,
        data: companies,
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

// Verify company
router.patch('/companies/:id/verify',
  authenticate,
  authorize('SUPER_ADMIN', 'MODERATOR'),
  [body('isVerified').isBoolean()],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;
      
      const company = await prisma.companyProfile.update({
        where: { id },
        data: {
          isVerified,
          verifiedAt: isVerified ? new Date() : null,
          verifiedBy: isVerified ? req.user.id : null
        },
        include: {
          user: {
            select: { email: true }
          }
        }
      });
      
      // Send email notification
      if (isVerified) {
        await sendEmail(company.user.email, 'companyVerified', {
          companyName: company.companyName,
          dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`
        }).catch(console.error);
      }
      
      // Create notification
      await prisma.notification.create({
        data: {
          userId: company.userId,
          type: 'COMPANY_VERIFIED',
          title: isVerified ? 'Şirket Hesabınız Doğrulandı' : 'Şirket Doğrulaması Reddedildi',
          content: isVerified 
            ? 'Tebrikler! Şirket hesabınız doğrulandı. Artık iş ilanı yayınlayabilirsiniz.'
            : 'Şirket doğrulama talebiniz reddedildi. Lütfen bilgilerinizi güncelleyip tekrar deneyin.',
          actionUrl: '/profile'
        }
      });
      
      // Log admin action
      await prisma.adminLog.create({
        data: {
          adminId: req.user.id,
          actionType: isVerified ? 'VERIFY_COMPANY' : 'REJECT_COMPANY',
          targetUserId: company.userId,
          details: { companyId: id, companyName: company.companyName },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      
      res.json({
        success: true,
        message: `Company ${isVerified ? 'verified' : 'rejected'} successfully`,
        data: company
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get reports
router.get('/reports',
  authenticate,
  authorize('SUPER_ADMIN', 'MODERATOR'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 20, status, reportType } = req.query;
      
      const where = {
        ...(status && { status }),
        ...(reportType && { reportType })
      };
      
      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          include: {
            reporter: {
              select: {
                id: true,
                email: true,
                studentProfile: {
                  select: { firstName: true, lastName: true }
                },
                companyProfile: {
                  select: { companyName: true }
                }
              }
            },
            reportedUser: {
              select: {
                id: true,
                email: true,
                studentProfile: {
                  select: { firstName: true, lastName: true }
                },
                companyProfile: {
                  select: { companyName: true }
                }
              }
            },
            reportedJob: {
              select: {
                id: true,
                title: true
              }
            },
            reportedMessage: {
              select: {
                id: true,
                content: true
              }
            }
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.report.count({ where })
      ]);
      
      res.json({
        success: true,
        data: reports,
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

// Update report status
router.patch('/reports/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'MODERATOR'),
  [
    body('status').isIn(['REVIEWING', 'RESOLVED', 'DISMISSED']),
    body('moderatorNotes').optional()
  ],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, moderatorNotes } = req.body;
      
      const report = await prisma.report.update({
        where: { id },
        data: {
          status,
          moderatorNotes,
          resolvedBy: req.user.id,
          resolvedAt: new Date()
        }
      });
      
      // Log admin action
      await prisma.adminLog.create({
        data: {
          adminId: req.user.id,
          actionType: 'UPDATE_REPORT',
          details: { reportId: id, status, moderatorNotes },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      
      res.json({
        success: true,
        message: 'Report updated successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get admin logs (Super Admin only)
router.get('/logs',
  authenticate,
  authorize('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const { page = 1, limit = 50, adminId, actionType } = req.query;
      
      const where = {
        ...(adminId && { adminId }),
        ...(actionType && { actionType })
      };
      
      const [logs, total] = await Promise.all([
        prisma.adminLog.findMany({
          where,
          include: {
            admin: {
              select: {
                id: true,
                email: true,
                role: true
              }
            },
            targetUser: {
              select: {
                id: true,
                email: true
              }
            }
          },
          skip: (parseInt(page) - 1) * parseInt(limit),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.adminLog.count({ where })
      ]);
      
      res.json({
        success: true,
        data: logs,
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

// Get/Update site settings (Super Admin only)
router.get('/settings',
  authenticate,
  authorize('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      let settings = await prisma.siteSettings.findUnique({
        where: { id: 'default' }
      });
      
      if (!settings) {
        settings = await prisma.siteSettings.create({
          data: { id: 'default' }
        });
      }
      
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put('/settings',
  authenticate,
  authorize('SUPER_ADMIN'),
  async (req, res, next) => {
    try {
      const settings = await prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: req.body,
        create: {
          id: 'default',
          ...req.body
        }
      });
      
      // Log admin action
      await prisma.adminLog.create({
        data: {
          adminId: req.user.id,
          actionType: 'UPDATE_SETTINGS',
          details: req.body,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
      
      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
