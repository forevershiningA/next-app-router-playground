import { and, desc, eq } from 'drizzle-orm';
import { db, projects } from '#/lib/db/index';
import type { DesignerSnapshot, PricingBreakdown, ProjectSummary, ProjectRecordWithState } from '#/lib/project-schemas';

const normalizePublicPath = (value: string | null | undefined) =>
  value ? value.replace(/\\/g, '/') : null;

function ensureDb() {
  if (!db) {
    throw new Error('Database not configured. Please set DATABASE_URL environment variable.');
  }
  return db;
}

/** Returns true if the error indicates json_path column doesn't exist yet in production DB. */
function isJsonPathColumnMissing(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('json_path') || (err as any)?.code === '42703';
}

const toSummary = (record: typeof projects.$inferSelect, skipJsonPath = false): ProjectSummary => ({
  id: record.id,
  title: record.title,
  status: record.status,
  totalPriceCents: record.totalPriceCents ?? null,
  currency: record.currency ?? 'AUD',
  screenshotPath: normalizePublicPath(record.screenshotPath),
  thumbnailPath: normalizePublicPath(record.thumbnailPath),
  jsonPath: skipJsonPath ? null : normalizePublicPath(record.jsonPath),
  updatedAt: record.updatedAt.toISOString(),
  createdAt: record.createdAt.toISOString(),
});

const withState = (record: typeof projects.$inferSelect): ProjectRecordWithState => ({
  ...toSummary(record),
  materialId: record.materialId,
  shapeId: record.shapeId,
  borderId: record.borderId,
  designState: record.designState as DesignerSnapshot,
  pricingBreakdown: (record.pricingBreakdown as PricingBreakdown) ?? null,
});

type SaveProjectInput = {
  accountId: string;
  projectId?: string;
  title: string;
  status?: string;
  totalPriceCents?: number | null;
  currency?: string;
  materialId?: number | null;
  shapeId?: number | null;
  borderId?: number | null;
  screenshotPath?: string | null;
  thumbnailPath?: string | null;
  jsonPath?: string | null;
  designState: DesignerSnapshot;
  pricingBreakdown?: PricingBreakdown | null;
};

export async function saveProjectRecord(input: SaveProjectInput): Promise<ProjectSummary> {
  const database = ensureDb();
  const { accountId } = input;
  const title = input.title?.trim() || 'Untitled Design';
  const status = input.status ?? 'draft';
  const currency = input.currency ?? 'AUD';
  const pricingBreakdown = input.pricingBreakdown ?? {};
  const totalPriceCents = typeof input.totalPriceCents === 'number' ? input.totalPriceCents : null;

  // Shared column values used in both INSERT and UPDATE
  const baseValues = {
    accountId,
    title,
    status,
    totalPriceCents,
    currency,
    materialId: input.materialId ?? null,
    shapeId: input.shapeId ?? null,
    borderId: input.borderId ?? null,
    screenshotPath: normalizePublicPath(input.screenshotPath),
    thumbnailPath: normalizePublicPath(input.thumbnailPath),
    designState: input.designState,
  };

  const withJsonPath = { ...baseValues, jsonPath: normalizePublicPath(input.jsonPath) };

  if (input.projectId) {
    // UPDATE existing project — try with jsonPath, fall back without if column missing
    try {
      const [updated] = await database
        .update(projects)
        .set({ ...withJsonPath, updatedAt: new Date() })
        .where(and(eq(projects.id, input.projectId), eq(projects.accountId, accountId)))
        .returning();
      if (!updated) throw new Error('PROJECT_NOT_FOUND');
      return toSummary(updated);
    } catch (err) {
      if (!isJsonPathColumnMissing(err)) throw err;
      console.warn('[projects-db] json_path column missing in production DB. Run: ALTER TABLE "projects" ADD COLUMN "json_path" text;');
      const [updated] = await database
        .update(projects)
        .set({ ...baseValues, updatedAt: new Date() })
        .where(and(eq(projects.id, input.projectId), eq(projects.accountId, accountId)))
        .returning();
      if (!updated) throw new Error('PROJECT_NOT_FOUND');
      return toSummary(updated, true);
    }
  }

  // INSERT new project — try with jsonPath, fall back without if column missing
  try {
    const [created] = await database
      .insert(projects)
      .values({ ...withJsonPath, pricingBreakdown })
      .returning();
    return toSummary(created);
  } catch (err) {
    if (!isJsonPathColumnMissing(err)) throw err;
    console.warn('[projects-db] json_path column missing in production DB. Run: ALTER TABLE "projects" ADD COLUMN "json_path" text;');
    const [created] = await database
      .insert(projects)
      .values({ ...baseValues, pricingBreakdown })
      .returning();
    return toSummary(created, true);
  }
}

export async function listProjectSummaries(accountId: string, limit = 20): Promise<ProjectSummary[]> {
  const database = ensureDb();

  const mapRows = (rows: { id: string; title: string; status: string; totalPriceCents: number | null; currency: string | null; screenshotPath: string | null; thumbnailPath: string | null; jsonPath?: string | null; updatedAt: Date; createdAt: Date }[]): ProjectSummary[] =>
    rows.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      totalPriceCents: row.totalPriceCents ?? null,
      currency: row.currency ?? 'AUD',
      screenshotPath: normalizePublicPath(row.screenshotPath),
      thumbnailPath: normalizePublicPath(row.thumbnailPath),
      jsonPath: normalizePublicPath(row.jsonPath ?? null),
      updatedAt: row.updatedAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
    }));

  try {
    const results = await database
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        totalPriceCents: projects.totalPriceCents,
        currency: projects.currency,
        screenshotPath: projects.screenshotPath,
        thumbnailPath: projects.thumbnailPath,
        jsonPath: projects.jsonPath,
        updatedAt: projects.updatedAt,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(eq(projects.accountId, accountId))
      .orderBy(desc(projects.updatedAt))
      .limit(limit);
    return mapRows(results);
  } catch (err) {
    if (!isJsonPathColumnMissing(err)) throw err;
    console.warn('[projects-db] json_path column missing, listing without it.');
    const results = await database
      .select({
        id: projects.id,
        title: projects.title,
        status: projects.status,
        totalPriceCents: projects.totalPriceCents,
        currency: projects.currency,
        screenshotPath: projects.screenshotPath,
        thumbnailPath: projects.thumbnailPath,
        updatedAt: projects.updatedAt,
        createdAt: projects.createdAt,
      })
      .from(projects)
      .where(eq(projects.accountId, accountId))
      .orderBy(desc(projects.updatedAt))
      .limit(limit);
    return mapRows(results.map((r) => ({ ...r, jsonPath: null })));
  }
}

export async function getProjectRecord(projectId: string, accountId: string): Promise<ProjectRecordWithState | null> {
  const database = ensureDb();
  const record = await database.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.accountId, accountId)),
  });

  if (!record) {
    return null;
  }

  return withState(record);
}

export async function deleteProjectRecord(projectId: string, accountId: string): Promise<boolean> {
  const database = ensureDb();
  const result = await database
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.accountId, accountId)))
    .returning();

  return result.length > 0;
}
