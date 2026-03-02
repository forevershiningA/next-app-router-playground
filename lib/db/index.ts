import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

// Warn if not configured
if (!connectionString && process.env.NODE_ENV !== 'production') {
  console.warn('DATABASE_URL is not set. Database features will be unavailable.');
}

// Create the connection - will fail at runtime if no connection string in production
const client = postgres(connectionString);

// Create and export the drizzle instance
export const db = drizzle(client, { schema });

// Export schema and types
export * from './schema';
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
