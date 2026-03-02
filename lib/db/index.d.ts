import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type * as schema from './schema';

export const db: PostgresJsDatabase<typeof schema>;
export * from './schema';
export type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
