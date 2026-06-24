import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LiveStream from './LiveStream';
import { MOCK_TEAM_MEMBERS } from '../data/mockData';

vi.mock('../lib/api', () => {
  return {
    apiClient: {
      predictEmotion: vi.fn(async () => {
        throw new Error('offline');
      }),
      health: vi.fn(async () => ({ status: 'ok' })),
    },
    ApiError: class ApiError extends Error {},
  };
});

describe('LiveStream', () => {
  it('shows non-blocking warning when backend request fails', async () => {
    const onShowToast = vi.fn();
    render(
      <LiveStream
        onAddEscalation={() => {}}
        teamMembers={MOCK_TEAM_MEMBERS}
        activeScenario={null}
        onClearScenario={() => {}}
        onShowToast={onShowToast}
        isDemoMode={false}
      />
    );

    const input = screen.getByPlaceholderText('Enter custom customer simulated response...');
    fireEvent.change(input, { target: { value: 'I am not happy with this service' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(onShowToast).toHaveBeenCalled();
    });
  });
});

