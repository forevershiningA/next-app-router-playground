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

const toSummary = (record: typeof projects.$inferSelect): ProjectSummary => ({
  id: record.id,
  title: record.title,
  status: record.status,
  totalPriceCents: record.totalPriceCents ?? null,
  currency: record.currency ?? 'AUD',
  screenshotPath: normalizePublicPath(record.screenshotPath),
  thumbnailPath: normalizePublicPath(record.thumbnailPath),
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

  if (input.projectId) {
    const [updated] = await database
      .update(projects)
      .set({
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
        pricingBreakdown,
        updatedAt: new Date(),
      })
      .where(and(eq(projects.id, input.projectId), eq(projects.accountId, accountId)))
      .returning();

    if (!updated) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return toSummary(updated);
  }

  const [created] = await database
    .insert(projects)
    .values({
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
      pricingBreakdown,
    })
    .returning();

  return toSummary(created);
}

export async function listProjectSummaries(accountId: string, limit = 20): Promise<ProjectSummary[]> {
  const database = ensureDb();
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

  return results.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    totalPriceCents: row.totalPriceCents ?? null,
    currency: row.currency ?? 'AUD',
    screenshotPath: normalizePublicPath(row.screenshotPath),
    thumbnailPath: normalizePublicPath(row.thumbnailPath),
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  }));
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
