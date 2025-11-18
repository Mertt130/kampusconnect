const { prisma } = require('../config/database');

/**
 * Get all companies with their job counts
 */
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { sector, size, search, verified, page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {
      role: 'COMPANY',
      isActive: true,
      companyProfile: {
        isNot: null
      }
    };

    // Build company profile filters
    const companyProfileWhere = {};
    
    if (sector) {
      companyProfileWhere.sector = sector;
    }
    
    if (size) {
      companyProfileWhere.employeeCount = size;
    }
    
    if (verified !== undefined) {
      companyProfileWhere.isVerified = verified === 'true';
    }
    
    if (search) {
      companyProfileWhere.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get companies
    const companies = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        companyProfile: {
          where: Object.keys(companyProfileWhere).length > 0 ? companyProfileWhere : undefined,
          select: {
            companyName: true,
            sector: true,
            employeeCount: true,
            description: true,
            website: true,
            logoUrl: true,
            isVerified: true,
            city: true,
            country: true
          }
        },
        _count: {
          select: {
            jobs: {
              where: {
                isActive: true,
                deletedAt: null
              }
            }
          }
        }
      }
    });

    // Filter out companies without profiles
    const filteredCompanies = companies.filter(c => c.companyProfile);

    // Transform data
    const transformedCompanies = filteredCompanies.map(company => ({
      id: company.id,
      company_name: company.companyProfile.companyName,
      sector: company.companyProfile.sector,
      company_size: company.companyProfile.employeeCount,
      description: company.companyProfile.description,
      website: company.companyProfile.website,
      logo_url: company.companyProfile.logoUrl,
      verified: company.companyProfile.isVerified,
      city: company.companyProfile.city,
      country: company.companyProfile.country,
      _count: {
        jobs: company._count.jobs
      }
    }));

    // Get total count
    const total = await prisma.user.count({
      where: {
        ...where,
        companyProfile: Object.keys(companyProfileWhere).length > 0 ? companyProfileWhere : undefined
      }
    });

    res.json({
      success: true,
      companies: transformedCompanies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    next(error);
  }
};

/**
 * Get company by ID
 */
exports.getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await prisma.user.findUnique({
      where: {
        id,
        role: 'COMPANY',
        isActive: true
      },
      include: {
        companyProfile: true,
        jobs: {
          where: {
            isActive: true,
            deletedAt: null
          },
          select: {
            id: true,
            title: true,
            jobType: true,
            location: true,
            city: true,
            isRemote: true,
            createdAt: true,
            applicationDeadline: true,
            _count: {
              select: {
                applications: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            jobs: {
              where: {
                isActive: true,
                deletedAt: null
              }
            }
          }
        }
      }
    });

    if (!company || !company.companyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Transform data
    const transformedCompany = {
      id: company.id,
      company_name: company.companyProfile.companyName,
      sector: company.companyProfile.sector,
      company_size: company.companyProfile.employeeCount,
      description: company.companyProfile.description,
      website: company.companyProfile.website,
      logo_url: company.companyProfile.logoUrl,
      cover_photo_url: company.companyProfile.coverPhotoUrl,
      verified: company.companyProfile.isVerified,
      city: company.companyProfile.city,
      country: company.companyProfile.country,
      address: company.companyProfile.address,
      phone_number: company.companyProfile.phoneNumber,
      linkedin_url: company.companyProfile.linkedinUrl,
      twitter_url: company.companyProfile.twitterUrl,
      facebook_url: company.companyProfile.facebookUrl,
      instagram_url: company.companyProfile.instagramUrl,
      founded_year: company.companyProfile.foundedYear,
      jobs: company.jobs,
      _count: company._count
    };

    res.json({
      success: true,
      company: transformedCompany
    });
  } catch (error) {
    console.error('Get company error:', error);
    next(error);
  }
};

/**
 * Get company statistics
 */
exports.getCompanyStats = async (req, res, next) => {
  try {
    const totalCompanies = await prisma.user.count({
      where: {
        role: 'COMPANY',
        isActive: true,
        companyProfile: {
          isNot: null
        }
      }
    });

    const verifiedCompanies = await prisma.companyProfile.count({
      where: {
        isVerified: true
      }
    });

    const companiesBySector = await prisma.companyProfile.groupBy({
      by: ['sector'],
      _count: true,
      orderBy: {
        _count: {
          sector: 'desc'
        }
      }
    });

    res.json({
      success: true,
      stats: {
        total: totalCompanies,
        verified: verifiedCompanies,
        bySector: companiesBySector
      }
    });
  } catch (error) {
    console.error('Get company stats error:', error);
    next(error);
  }
};
