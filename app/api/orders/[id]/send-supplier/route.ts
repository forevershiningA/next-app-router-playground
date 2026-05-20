import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '#/lib/db/index';
import { accounts, orders, profiles } from '#/lib/db/schema';
import { requireAdminSession } from '#/app/admin/_components/admin-utils';
import { getTransporter } from '#/lib/email/transport';

type Params = { params: Promise<{ id: string }> };

type DesignElementPayload = {
  kind: string;
  label: string;
  detail: string;
};

export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
    const { id: orderId } = await params;

    const body = (await request.json()) as {
      supplierName: string;
      supplierEmail: string;
      elements: DesignElementPayload[];
    };

    const { supplierName, supplierEmail, elements } = body;
    if (!supplierEmail || !elements?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Load order + customer
    const [order] = await db
      .select({
        invoiceNumber: orders.invoiceNumber,
        email: accounts.email,
        firstName: profiles.firstName,
        lastName: profiles.lastName,
      })
      .from(orders)
      .leftJoin(accounts, eq(orders.accountId, accounts.id))
      .leftJoin(profiles, eq(accounts.id, profiles.accountId))
      .where(eq(orders.id, orderId))
      .limit(1);

    const customerName =
      [order?.firstName, order?.lastName].filter(Boolean).join(' ') ||
      order?.email ||
      'Customer';
    const invoiceRef = order?.invoiceNumber || orderId.slice(0, 8).toUpperCase();

    const elementsHtml = elements
      .map(
        (el) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;font-weight:500">${el.label}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;color:#666">${el.detail}</td>
        </tr>`,
      )
      .join('');

    const html = `
      <h2 style="font-family:sans-serif">Order from Forever Shining</h2>
      <p style="font-family:sans-serif"><strong>Order Ref:</strong> ${invoiceRef}</p>
      <p style="font-family:sans-serif"><strong>Customer:</strong> ${customerName}</p>
      <br>
      <table style="width:100%;border-collapse:collapse;font-size:13px;font-family:sans-serif">
        <thead>
          <tr style="background:#f5f5f5">
            <th style="padding:8px;text-align:left;width:40%">Item</th>
            <th style="padding:8px;text-align:left">Details</th>
          </tr>
        </thead>
        <tbody>${elementsHtml}</tbody>
      </table>
      <br>
      <p style="font-family:sans-serif">Please proceed with manufacturing and contact us with any questions.</p>
      <p style="font-family:sans-serif">Forever Shining<br>admin@forevershining.com.au<br>Ph (08) 6191 0396</p>
    `;

    const senderAddress =
      process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'admin@forevershining.com.au';

    const transporter = getTransporter('au');
    await transporter.sendMail({
      from: `Forever Shining <${senderAddress}>`,
      to: supplierEmail,
      replyTo: senderAddress,
      subject: `Order ${invoiceRef} — Design Elements (${supplierName})`,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error sending supplier email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

