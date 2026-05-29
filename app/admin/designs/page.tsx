import { desc, eq, like, or } from 'drizzle-orm';
import type { Metadata } from 'next';
import { db } from '#/lib/db/index';
import { accounts, projects } from '#/lib/db/schema';
import { ThumbnailModal } from '../orders/_components/ThumbnailModal';
import { EditDesignButton } from '../_components/EditDesignButton';
import {
  EmptyState,
  PageIntro,
  SectionCard,
  StatusBadge,
  formatDate,
  formatMoney,
  requireAdminSession,
} from '../_components/admin-utils';

export const metadata: Metadata = { title: 'Designs' };

type DesignsPageProps = { searchParams: Promise<{ q?: string }> };

export default async function AdminDesignsPage({
  searchParams,
}: DesignsPageProps) {
  await requireAdminSession();

  const { q } = await searchParams;
  const query = q?.trim() ?? '';

  const designRows = await db
    .select({
      id: projects.id,
      title: projects.title,
      status: projects.status,
      totalPriceCents: projects.totalPriceCents,
      createdAt: projects.createdAt,
      email: accounts.email,
      screenshotPath: projects.screenshotPath,
      thumbnailPath: projects.thumbnailPath,
    })
    .from(projects)
    .leftJoin(accounts, eq(projects.accountId, accounts.id))
    .where(
      query
        ? or(
            like(projects.title, `%${query}%`),
            like(projects.id, `%${query}%`),
            like(accounts.email, `%${query}%`),
          )
        : undefined,
    )
    .orderBy(desc(projects.createdAt))
    .limit(query ? 100 : 50);

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      <PageIntro
        title="Designs"
        description="Search memorial designs by title, UUID, or designer email."
        action={
          <form className="flex w-full max-w-md gap-3">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search designs"
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        }
      />

      <SectionCard className="overflow-hidden">
        {designRows.length === 0 ? (
          <EmptyState
            message={
              query
                ? 'No designs matched your search.'
                : 'No designs have been saved yet.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">Title</th>
                  <th className="px-4 py-3 font-medium tracking-wide">Thumbnail</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Designer
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">Price</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {designRows.map((design, index) => (
                  <tr
                    key={design.id}
                    className={`hover:bg-gray-100 dark:hover:bg-gray-700/50 ${index % 2 === 1 ? 'bg-gray-100 dark:bg-gray-700/50' : 'bg-white dark:bg-transparent'}`}
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      <div>{design.title}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {design.id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {design.thumbnailPath || design.screenshotPath ? (
                        <div className="flex flex-col items-start gap-1">
                          <ThumbnailModal
                            src={design.thumbnailPath || design.screenshotPath!}
                            fullSrc={design.screenshotPath || design.thumbnailPath!}
                            alt={design.title ?? 'Design preview'}
                            thumbSize="h-32 w-32"
                          />
                          <a
                            href={`/design/${design.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-purple-600 hover:underline dark:text-purple-400"
                          >
                            View Design
                          </a>
                          <EditDesignButton projectId={design.id} />
                        </div>
                      ) : (
                        <span className="inline-block h-32 w-32 rounded bg-gray-100 dark:bg-gray-700" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {design.email || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={design.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {formatMoney(design.totalPriceCents)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(design.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
