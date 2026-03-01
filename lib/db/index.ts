import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  console.warn('DATABASE_URL is not set. Database features will be unavailable.');
}

// Create the connection (will be lazy-loaded on first use)
const client = connectionString ? postgres(connectionString) : null;

// Create the drizzle instance
export const db = client ? drizzle(client, { schema }) : null;

// Export schema and types
export * from './schema';
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
