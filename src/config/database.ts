import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { logger } from '../utils/logger.js';

let prismaInstance: ExtendedPrismaClient | null = null;

class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
      errorFormat: 'pretty',
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$executeRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }
}

function createPrismaClient(): ExtendedPrismaClient {
  if (!prismaInstance) {
    prismaInstance = new ExtendedPrismaClient();
    logger.info('📦 Database client initialized');
  }
  return prismaInstance;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = createPrismaClient();
    if (prop === 'healthCheck') {
      return client.healthCheck.bind(client);
    }
    return (client as any)[prop];
  }
}) as any;

export default prisma;
export { ExtendedPrismaClient };
