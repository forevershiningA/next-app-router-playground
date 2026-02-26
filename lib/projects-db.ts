import { desc, eq } from 'drizzle-orm';
import { db, projects, accounts } from '#/lib/db/index';
import type { DesignerSnapshot, PricingBreakdown, ProjectSummary, ProjectRecordWithState } from '#/lib/project-schemas';

const GUEST_ACCOUNT_EMAIL = 'guest@local.project';
const GUEST_PASSWORD_PLACEHOLDER = 'guest-placeholder';

let cachedGuestAccountId: string | null = null;

const toSummary = (record: typeof projects.$inferSelect): ProjectSummary => ({
  id: record.id,
  title: record.title,
  status: record.status,
  totalPriceCents: record.totalPriceCents ?? null,
  currency: record.currency ?? 'AUD',
  screenshotPath: record.screenshotPath ?? null,
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

async function ensureGuestAccount() {
  if (cachedGuestAccountId) {
    return cachedGuestAccountId;
  }

  const existing = await db.query.accounts.findFirst({
    where: eq(accounts.email, GUEST_ACCOUNT_EMAIL),
  });

  if (existing) {
    cachedGuestAccountId = existing.id;
    return existing.id;
  }

  const [created] = await db
    .insert(accounts)
    .values({
      email: GUEST_ACCOUNT_EMAIL,
      passwordHash: GUEST_PASSWORD_PLACEHOLDER,
      role: 'client',
      status: 'active',
    })
    .returning();

  cachedGuestAccountId = created.id;
  return created.id;
}

type SaveProjectInput = {
  projectId?: string;
  title: string;
  status?: string;
  totalPriceCents?: number | null;
  currency?: string;
  materialId?: number | null;
  shapeId?: number | null;
  borderId?: number | null;
  screenshotPath?: string | null;
  designState: DesignerSnapshot;
  pricingBreakdown?: PricingBreakdown | null;
};

export async function saveProjectRecord(input: SaveProjectInput): Promise<ProjectSummary> {
  const accountId = await ensureGuestAccount();
  const title = input.title?.trim() || 'Untitled Design';
  const status = input.status ?? 'draft';
  const currency = input.currency ?? 'AUD';
  const pricingBreakdown = input.pricingBreakdown ?? {};
  const totalPriceCents = typeof input.totalPriceCents === 'number' ? input.totalPriceCents : null;

  if (input.projectId) {
    const [updated] = await db
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
        screenshotPath: input.screenshotPath ?? null,
        designState: input.designState,
        pricingBreakdown,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, input.projectId))
      .returning();

    if (!updated) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return toSummary(updated);
  }

  const [created] = await db
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
      screenshotPath: input.screenshotPath ?? null,
      designState: input.designState,
      pricingBreakdown,
    })
    .returning();

  return toSummary(created);
}

export async function listProjectSummaries(limit = 20): Promise<ProjectSummary[]> {
  const results = await db
    .select({
      id: projects.id,
      title: projects.title,
      status: projects.status,
      totalPriceCents: projects.totalPriceCents,
      currency: projects.currency,
      screenshotPath: projects.screenshotPath,
      updatedAt: projects.updatedAt,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .orderBy(desc(projects.updatedAt))
    .limit(limit);

  return results.map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    totalPriceCents: row.totalPriceCents ?? null,
    currency: row.currency ?? 'AUD',
    screenshotPath: row.screenshotPath ?? null,
    updatedAt: row.updatedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getProjectRecord(projectId: string): Promise<ProjectRecordWithState | null> {
  const record = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!record) {
    return null;
  }

  return withState(record);
}

export async function deleteProjectRecord(projectId: string): Promise<boolean> {
  const result = await db
    .delete(projects)
    .where(eq(projects.id, projectId))
    .returning();

  return result.length > 0;
}
