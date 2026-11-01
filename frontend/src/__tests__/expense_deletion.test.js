import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseDeletion from '../components/ExpenseDeletion';

describe('ExpenseDeletion Component', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders correctly', () => {
    render(<ExpenseDeletion />);
    expect(screen.getByTestId('expense_deletion-container')).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ message: 'Expense deleted successfully' }) });
    render(<ExpenseDeletion />);
    userEvent.click(screen.getByRole('button', { name: /delete expense/i }));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/expense deleted successfully/i)).toBeInTheDocument();
  });

  test('shows loading state', async () => {
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 1000)));
    render(<ExpenseDeletion />);
    userEvent.click(screen.getByRole('button', { name: /delete expense/i }));
    expect(screen.getByText(/deleting.../i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/deleting.../i)).not.toBeInTheDocument());
  });

  test('handles API errors', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'Failed to delete expense' });
    render(<ExpenseDeletion />);
    userEvent.click(screen.getByRole('button', { name: /delete expense/i }));
    await waitFor(() => expect(screen.getByText(/failed to delete expense/i)).toBeInTheDocument());
  });

  test('is accessible', () => {
    render(<ExpenseDeletion />);
    expect(screen.getByRole('button', { name: /delete expense/i })).toBeEnabled();
  });
});