import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from '../utils/logger.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Extend PrismaClient with custom methods
class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    super({
      adapter,
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
      errorFormat: 'pretty',
    });
  }

  // Custom method to check connection health
  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Custom method for transaction with retry
  async transactionWithRetry<T>(
    callback: (prisma: ExtendedPrismaClient) => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.$transaction(async (tx) => {
          return await callback(tx as ExtendedPrismaClient);
        });
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Transaction attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 100)
          );
        }
      }
    }
    
    throw lastError || new Error('Transaction failed after retries');
  }
}

// Create singleton instance
const prisma = new ExtendedPrismaClient();

// Handle connection events
prisma.$connect()
  .then(() => {
    logger.info('📦 Database connected successfully');
  })
  .catch((error) => {
    logger.error('❌ Database connection failed:', error);
    if (process.env.NODE_ENV === 'production') {
      // In production, we might want to retry or notify
      process.exit(1);
    }
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  logger.info('Database disconnected');
});

// Middleware for soft delete (optional)
// prisma.$use(async (params, next) => {
//   // Auto-soft delete for models with deletedAt field
//   if (params.action === 'delete' && params.model) {
//     const model = params.model as string;
//     const modelWithSoftDelete = ['User', 'Patient', 'Provider'];
//     
//     if (modelWithSoftDelete.includes(model)) {
//       // Change action to update
//       params.action = 'update';
//       params.args.data = { deletedAt: new Date() };
//     }
//   }
//   return next(params);
// });

// Middleware for audit logging (optional)
// prisma.$use(async (params, next) => {
//   const startTime = Date.now();
//   const result = await next(params);
//   const duration = Date.now() - startTime;
//   
//   // Log slow queries
//   if (duration > 1000) {
//     logger.warn(`Slow query: ${params.model}.${params.action} took ${duration}ms`);
//   }
//   
//   return result;
// });

export default prisma;
export { ExtendedPrismaClient };