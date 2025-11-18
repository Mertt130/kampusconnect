const express = require('express');
const { body } = require('express-validator');
const { prisma } = require('../config/database');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validation.middleware');

const router = express.Router();

// Get conversations
router.get('/conversations', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      include: {
        participant1: {
          select: {
            id: true,
            email: true,
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
          }
        },
        participant2: {
          select: {
            id: true,
            email: true,
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
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            isRead: true,
            senderId: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });
    
    // Get unread counts
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
            deletedAt: null
          }
        });
        
        return {
          ...conv,
          unreadCount,
          otherParticipant: conv.participant1Id === userId ? conv.participant2 : conv.participant1
        };
      })
    );
    
    res.json({
      success: true,
      data: conversationsWithUnread
    });
  } catch (error) {
    next(error);
  }
});

// Start or get conversation
router.post('/conversations',
  authenticate,
  [body('participantId').notEmpty()],
  validate,
  async (req, res, next) => {
    try {
      const { participantId } = req.body;
      const userId = req.user.id;
      
      if (participantId === userId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot start conversation with yourself'
        });
      }
      
      // Check if participant exists
      const participant = await prisma.user.findUnique({
        where: { id: participantId, isActive: true }
      });
      
      if (!participant) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Check if conversation exists
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: userId, participant2Id: participantId },
            { participant1Id: participantId, participant2Id: userId }
          ]
        }
      });
      
      // Create if doesn't exist
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1Id: userId,
            participant2Id: participantId
          }
        });
      }
      
      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get messages in conversation
router.get('/conversations/:id/messages', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;
    
    // Check if user is participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      }
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          conversationId: id,
          deletedAt: null
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
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
            }
          }
        },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.message.count({
        where: {
          conversationId: id,
          deletedAt: null
        }
      })
    ]);
    
    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    
    res.json({
      success: true,
      data: messages.reverse(), // Return in chronological order
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

// Send message
router.post('/conversations/:id/messages',
  authenticate,
  [body('content').notEmpty().isLength({ max: 1000 })],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;
      
      // Check if user is participant
      const conversation = await prisma.conversation.findFirst({
        where: {
          id,
          OR: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        }
      });
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId: id,
          senderId: userId,
          content
        },
        include: {
          sender: {
            select: {
              id: true,
              email: true,
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
            }
          }
        }
      });
      
      // Update conversation
      await prisma.conversation.update({
        where: { id },
        data: {
          lastMessageAt: new Date(),
          lastMessageId: message.id
        }
      });
      
      // Create notification
      const otherUserId = conversation.participant1Id === userId 
        ? conversation.participant2Id 
        : conversation.participant1Id;
      
      await prisma.notification.create({
        data: {
          userId: otherUserId,
          type: 'MESSAGE_RECEIVED',
          title: 'Yeni Mesaj',
          content: `${message.sender.studentProfile?.firstName || message.sender.companyProfile?.companyName} size mesaj gönderdi`,
          actionUrl: `/messages/${id}`
        }
      });
      
      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      next(error);
    }
  }
);

// Mark message as read
router.patch('/messages/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const message = await prisma.message.findUnique({
      where: { id },
      include: { conversation: true }
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Check if user is recipient
    const isParticipant = 
      message.conversation.participant1Id === userId || 
      message.conversation.participant2Id === userId;
    
    if (!isParticipant || message.senderId === userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    await prisma.message.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    next(error);
  }
});

// Delete message (soft delete)
router.delete('/messages/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const message = await prisma.message.findUnique({
      where: { id }
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    await prisma.message.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    
    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
