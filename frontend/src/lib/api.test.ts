import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient, ApiError } from './api';

describe('apiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed emotion payload', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          emotion: 'anger',
          confidence: 0.9,
          drift_score: 0.8,
          risk_level: 'HIGH RISK',
          escalation_required: true,
          session_id: 'default',
        }),
        { status: 200 }
      ) as unknown as Response
    );

    const result = await apiClient.predictEmotion({ message: 'test message' });
    expect(result.emotion).toBe('anger');
    expect(result.escalation_required).toBe(true);
  });

  it('throws ApiError on non-2xx status', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'validation_error' }), { status: 422 }) as unknown as Response
    );

    await expect(apiClient.predictEmotion({ message: '' })).rejects.toBeInstanceOf(ApiError);
  });
});

