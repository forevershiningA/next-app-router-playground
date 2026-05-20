import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// Warn if not configured
if (!connectionString && process.env.NODE_ENV !== 'production') {
  console.warn('DATABASE_URL is not set. Database features will be unavailable.');
}

// Singleton to prevent connection pool exhaustion during Next.js hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var __postgresClient: ReturnType<typeof postgres> | undefined;
}

function getClient() {
  if (!global.__postgresClient) {
    global.__postgresClient = postgres(connectionString, {
      max: 5,
      idle_timeout: 20,
      connect_timeout: 30,
      prepare: false,
    });
  }
  return global.__postgresClient;
}

const client = getClient();

// Create and export the drizzle instance
export const db = drizzle(client, { schema });

// Export schema and types
export * from './schema';
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
