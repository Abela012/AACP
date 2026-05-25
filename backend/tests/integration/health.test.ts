import { describe, expect, it } from 'vitest';
import { api } from '../helpers/app';
import { seedPlatformSettings } from '../helpers/fixtures';

describe('GET /api/v1/health', () => {
  it('returns healthy status', async () => {
    await seedPlatformSettings();
    const res = await api().get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'healthy' });
  });
});
