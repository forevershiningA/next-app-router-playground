'use server';

import { revalidatePath } from 'next/cache';
import { db } from '#/lib/db/index';
import { auditLog, enquiries } from '#/lib/db/schema';
import { requireAdminSession } from './admin-utils';

export async function createQuickEnquiry(formData: FormData) {
  const session = await requireAdminSession();

  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim() || null;
  const message = String(formData.get('message') ?? '').trim();

  if (!email || !message) return { error: 'Email and message are required.' };

  const [row] = await db
    .insert(enquiries)
    .values({ email, phone, message, status: 'new' })
    .returning({ id: enquiries.id });

  await db.insert(auditLog).values({
    accountId: session.accountId,
    action: 'admin.enquiry_created',
    targetType: 'enquiry',
    targetId: row.id,
    metadata: { email },
  });

  revalidatePath('/admin/enquiries');
  revalidatePath('/admin');

  return { success: true };
}
