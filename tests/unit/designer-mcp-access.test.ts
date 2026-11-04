import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn() }));
vi.mock('#/lib/auth/session', () => ({ getServerSession: mocks.session }));
import { GET } from '#/app/api/admin/designer-mcp/route';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});

describe('live designer MCP gate', () => {
  it('remains disabled without the explicit flag', async () => {
    vi.stubEnv('NEXT_PUBLIC_DESIGNER_MCP_LIVE_TEST', '0');
    mocks.session.mockResolvedValue({ accountId: 'a', role: 'admin' });
    const response = await GET();
    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(mocks.session).not.toHaveBeenCalled();
  });
  it('rejects anonymous and non-admin sessions', async () => {
    vi.stubEnv('NEXT_PUBLIC_DESIGNER_MCP_LIVE_TEST', '1');
    for (const session of [
      null,
      { accountId: 'a', role: 'user' },
      { role: 'admin' },
    ]) {
      mocks.session.mockResolvedValue(session);
      expect((await GET()).status).toBe(403);
    }
  });
  it('allows a logged-in admin when explicitly enabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_DESIGNER_MCP_LIVE_TEST', '1');
    mocks.session.mockResolvedValue({ accountId: 'a', role: 'admin' });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ enabled: true });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
