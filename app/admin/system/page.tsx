import { desc, eq } from 'drizzle-orm';
import { db } from '#/lib/db/index';
import { accounts, auditLog } from '#/lib/db/schema';
import {
  EmptyState,
  PageIntro,
  SectionCard,
  formatDate,
  formatMetadataPreview,
  requireAdminSession,
  truncateText,
} from '../_components/admin-utils';

export default async function AdminSystemPage() {
  await requireAdminSession();

  const auditRows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      targetType: auditLog.targetType,
      targetId: auditLog.targetId,
      metadata: auditLog.metadata,
      createdAt: auditLog.createdAt,
      actorEmail: accounts.email,
    })
    .from(auditLog)
    .leftJoin(accounts, eq(auditLog.accountId, accounts.id))
    .orderBy(desc(auditLog.createdAt))
    .limit(200);

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      <PageIntro
        title="System"
        description="Audit trail for admin actions and operational events."
      />

      <SectionCard className="overflow-hidden">
        {auditRows.length === 0 ? (
          <EmptyState message="No audit entries have been recorded yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">Date</th>
                  <th className="px-6 py-3 font-medium tracking-wide">Actor</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Action
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Target Type
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Target ID
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Metadata
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {auditRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {row.actorEmail || 'System'}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      {truncateText(row.action, 40)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {row.targetType}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {truncateText(row.targetId, 32)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatMetadataPreview(row.metadata)}
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
