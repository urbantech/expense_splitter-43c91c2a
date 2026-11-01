import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Authentication Component', () => {
  const mockFetch = global.fetch;

  test('renders correctly', () => {
    render(<Authentication />);
    expect(screen.getByTestId('authentication-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ token: 'mockToken' }),
      ok: true,
    });

    render(<Authentication />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ainative.studio/api/v1/auth',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });
  });

  test('shows loading state during API call', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<Authentication />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
    });
  });

  test('handles API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ error: 'Invalid credentials' }),
      ok: false,
    });

    render(<Authentication />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongPassword');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('is accessible', async () => {
    render(<Authentication />);
    expect(screen.getByLabelText(/email/i)).toHaveAccessibleName(/email/i);
    expect(screen.getByLabelText(/password/i)).toHaveAccessibleName(/password/i);
    expect(screen.getByRole('button', { name: /login/i })).toBeEnabled();
  });
});