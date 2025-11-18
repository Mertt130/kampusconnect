const jwt = require('jsonwebtoken');
const { prisma } = require('./database');

const activeUsers = new Map();

const initializeSocket = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true }
      });
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);
    
    // Add user to active users
    activeUsers.set(socket.userId, socket.id);
    
    // Join user to their own room
    socket.join(socket.userId);
    
    // Emit online status
    socket.broadcast.emit('user:online', socket.userId);
    
    // Handle joining conversation rooms
    socket.on('conversation:join', async (conversationId) => {
      try {
        // Verify user is participant
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { participant1Id: socket.userId },
              { participant2Id: socket.userId }
            ]
          }
        });
        
        if (conversation) {
          socket.join(`conversation:${conversationId}`);
          console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
      }
    });
    
    // Handle sending messages
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, content } = data;
        
        // Verify user is participant
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { participant1Id: socket.userId },
              { participant2Id: socket.userId }
            ]
          }
        });
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        // Create message
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: socket.userId,
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
        
        // Update conversation last message
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageAt: new Date(),
            lastMessageId: message.id
          }
        });
        
        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit('message:new', message);
        
        // Send notification to other participant
        const otherUserId = conversation.participant1Id === socket.userId 
          ? conversation.participant2Id 
          : conversation.participant1Id;
        
        // Create notification
        await prisma.notification.create({
          data: {
            userId: otherUserId,
            type: 'MESSAGE_RECEIVED',
            title: 'Yeni Mesaj',
            content: `${message.sender.studentProfile?.firstName || message.sender.companyProfile?.companyName} size mesaj gönderdi`,
            actionUrl: `/messages/${conversationId}`
          }
        });
        
        // Emit notification if user is online
        if (activeUsers.has(otherUserId)) {
          io.to(otherUserId).emit('notification:new', {
            type: 'message',
            message: message
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId: socket.userId,
        isTyping: true
      });
    });
    
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId: socket.userId,
        isTyping: false
      });
    });
    
    // Handle marking messages as read
    socket.on('message:read', async ({ messageId }) => {
      try {
        await prisma.message.update({
          where: { id: messageId },
          data: {
            isRead: true,
            readAt: new Date()
          }
        });
        
        // Notify sender
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: {
            senderId: true,
            conversationId: true
          }
        });
        
        if (message && activeUsers.has(message.senderId)) {
          io.to(message.senderId).emit('message:read', {
            messageId,
            conversationId: message.conversationId
          });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      activeUsers.delete(socket.userId);
      
      // Emit offline status
      socket.broadcast.emit('user:offline', socket.userId);
    });
  });
};

module.exports = { initializeSocket, activeUsers };
