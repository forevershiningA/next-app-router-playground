/**
 * Nodemailer transport factory — creates SMTP transport per country.
 *
 * SMTP credentials are read from environment variables:
 *   SMTP_AU_HOST, SMTP_AU_PORT, SMTP_AU_USER, SMTP_AU_PASS
 *   SMTP_US_HOST, SMTP_US_PORT, SMTP_US_USER, SMTP_US_PASS
 *   etc.
 *
 * Falls back to a single SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS
 * when country-specific vars are not set.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { SmtpConfig } from './types';

function getSmtpConfig(countryCode: string): SmtpConfig {
  const prefix = `SMTP_${countryCode.toUpperCase()}`;
  const host =
    process.env[`${prefix}_HOST`] ?? process.env.SMTP_HOST ?? '';
  const port = parseInt(
    process.env[`${prefix}_PORT`] ?? process.env.SMTP_PORT ?? '587',
    10,
  );
  const user =
    process.env[`${prefix}_USER`] ?? process.env.SMTP_USER ?? '';
  const pass =
    process.env[`${prefix}_PASS`] ?? process.env.SMTP_PASS ?? '';

  return {
    host,
    port,
    secure: port === 465,
    user,
    pass,
  };
}

const transporterCache = new Map<string, Transporter>();

/**
 * Get (or create) a Nodemailer transporter for a given country code.
 * Transporters are cached per country.
 */
export function getTransporter(countryCode: string): Transporter {
  const key = countryCode.toLowerCase();
  const cached = transporterCache.get(key);
  if (cached) return cached;

  const config = getSmtpConfig(key);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth:
      config.user && config.pass
        ? { user: config.user, pass: config.pass }
        : undefined,
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });

  transporterCache.set(key, transporter);
  return transporter;
}

/**
 * Verify SMTP connection for a country. Useful for health checks.
 */
export async function verifyTransport(
  countryCode: string,
): Promise<boolean> {
  try {
    const transporter = getTransporter(countryCode);
    await transporter.verify();
    return true;
  } catch {
    return false;
  }
}
