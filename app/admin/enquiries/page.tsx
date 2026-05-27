import { revalidatePath } from 'next/cache';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Enquiries' };
import { db } from '#/lib/db/index';
import { auditLog, enquiries, projects } from '#/lib/db/schema';
import {
  EmptyState,
  FilterTab,
  PageIntro,
  SectionCard,
  StatusBadge,
  formatDate,
  requireAdminSession,
  truncateText,
} from '../_components/admin-utils';

const enquiryTabs = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'responded', label: 'Responded' },
] as const;

type EnquiryTabKey = (typeof enquiryTabs)[number]['key'];

type EnquiriesPageProps = { searchParams: Promise<{ status?: string }> };

function getSelectedStatus(value: string | undefined): EnquiryTabKey {
  return enquiryTabs.some((tab) => tab.key === value)
    ? (value as EnquiryTabKey)
    : 'all';
}

async function markEnquiryResponded(formData: FormData) {
  'use server';

  const session = await requireAdminSession();
  const enquiryId = String(formData.get('id') ?? '');

  if (!enquiryId) {
    return;
  }

  await db
    .update(enquiries)
    .set({ status: 'responded', respondedAt: new Date() })
    .where(eq(enquiries.id, enquiryId));

  await db
    .insert(auditLog)
    .values({
      accountId: session.accountId,
      action: 'admin.enquiry_responded',
      targetType: 'enquiry',
      targetId: enquiryId,
      metadata: { status: 'responded' },
    });

  revalidatePath('/admin/enquiries');
}

export default async function AdminEnquiriesPage({
  searchParams,
}: EnquiriesPageProps) {
  await requireAdminSession();

  const { status } = await searchParams;
  const selectedStatus = getSelectedStatus(status);

  const enquiryRows = await db
    .select({
      id: enquiries.id,
      email: enquiries.email,
      phone: enquiries.phone,
      message: enquiries.message,
      status: enquiries.status,
      createdAt: enquiries.createdAt,
      respondedAt: enquiries.respondedAt,
      projectId: enquiries.projectId,
      projectTitle: projects.title,
    })
    .from(enquiries)
    .leftJoin(projects, eq(enquiries.projectId, projects.id))
    .where(
      selectedStatus === 'all'
        ? undefined
        : eq(enquiries.status, selectedStatus),
    )
    .orderBy(desc(enquiries.createdAt));

  return (
    <div className="space-y-8 px-6 py-8 md:px-8">
      <PageIntro
        title="Enquiries"
        description="Review contact requests and mark them as responded once handled."
      />

      <div className="flex flex-wrap gap-3">
        {enquiryTabs.map((tab) => (
          <FilterTab
            key={tab.key}
            href={
              tab.key === 'all'
                ? '/admin/enquiries'
                : `/admin/enquiries?status=${tab.key}`
            }
            label={tab.label}
            active={selectedStatus === tab.key}
          />
        ))}
      </div>

      <SectionCard className="overflow-hidden">
        {enquiryRows.length === 0 ? (
          <EmptyState message="No enquiries match the selected filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-700">
              <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium tracking-wide">Date</th>
                  <th className="px-6 py-3 font-medium tracking-wide">Email</th>
                  <th className="px-6 py-3 font-medium tracking-wide">Phone</th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Message
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Project
                  </th>
                  <th className="px-6 py-3 font-medium tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {enquiryRows.map((enquiry, index) => (
                  <tr
                    key={enquiry.id}
                    className={`align-top hover:bg-gray-100 dark:hover:bg-gray-700/50 ${index % 2 === 1 ? 'bg-gray-100 dark:bg-gray-700/50' : 'bg-white dark:bg-transparent'}`}
                  >
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {formatDate(enquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {enquiry.email}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {enquiry.phone || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {truncateText(enquiry.message, 100)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={enquiry.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {enquiry.projectTitle || enquiry.projectId || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {enquiry.status === 'new' ? (
                        <form action={markEnquiryResponded}>
                          <input type="hidden" name="id" value={enquiry.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                          >
                            Mark responded
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDate(enquiry.respondedAt)}
                        </span>
                      )}
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
