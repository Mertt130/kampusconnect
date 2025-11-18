const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

// Handle connection errors
prisma.$on('error', (e) => {
  console.error('Database error:', e);
});

module.exports = { prisma };
