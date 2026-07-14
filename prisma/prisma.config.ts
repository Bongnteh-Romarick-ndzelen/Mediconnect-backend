// prisma.config.ts
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // For Prisma CLI (migrations, generate, etc.)
    url: env('DIRECT_URL'),  // Uses the direct connection
  },
})