import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

describe('GroupExpenseCreation Component', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders correctly', () => {
    render(<GroupExpenseCreation />);
    expect(screen.getByTestId('group_expense_creation-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/expense name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/members/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create expense/i })).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    render(<GroupExpenseCreation />);
    userEvent.type(screen.getByLabelText(/expense name/i), 'Lunch');
    userEvent.type(screen.getByLabelText(/amount/i), '50');
    userEvent.type(screen.getByLabelText(/members/i), 'Alice, Bob, Charlie');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'Expense created successfully' }),
    });

    userEvent.click(screen.getByRole('button', { name: /create expense/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.ainative.studio/group-expense',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': expect.any(String),
          }),
          body: JSON.stringify({
            expenseName: 'Lunch',
            amount: 50,
            members: ['Alice', 'Bob', 'Charlie'],
          }),
        })
      );
      expect(screen.getByText(/expense created successfully/i)).toBeInTheDocument();
    });
  });

  test('shows loading state', async () => {
    render(<GroupExpenseCreation />);
    userEvent.type(screen.getByLabelText(/expense name/i), 'Dinner');
    userEvent.type(screen.getByLabelText(/amount/i), '75');
    userEvent.type(screen.getByLabelText(/members/i), 'David, Eve');

    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(), 200)));

    userEvent.click(screen.getByRole('button', { name: /create expense/i }));

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  test('handles API errors', async () => {
    render(<GroupExpenseCreation />);
    userEvent.type(screen.getByLabelText(/expense name/i), 'Coffee');
    userEvent.type(screen.getByLabelText(/amount/i), '10');
    userEvent.type(screen.getByLabelText(/members/i), 'Frank');

    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
    });

    userEvent.click(screen.getByRole('button', { name: /create expense/i }));

    await waitFor(() => {
      expect(screen.getByText(/error: bad request/i)).toBeInTheDocument();
    });
  });

  test('is accessible', async () => {
    render(<GroupExpenseCreation />);
    expect(await screen.findByLabelText(/expense name/i)).toHaveAttribute('aria-required', 'true');
    expect(await screen.findByLabelText(/amount/i)).toHaveAttribute('aria-required', 'true');
    expect(await screen.findByLabelText(/members/i)).toHaveAttribute('aria-required', 'true');
    expect(await screen.findByRole('button', { name: /create expense/i })).toBeEnabled();
  });
});