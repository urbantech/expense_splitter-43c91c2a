import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

const mockExpenses = [
  { id: 1, description: 'Lunch', amount: 20 },
  { id: 2, description: 'Coffee', amount: 5 },
];

describe('ExpenseListing Component', () => {
  let fetchMock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with expenses', async () => {
    fetchMock.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockExpenses),
    });

    render(<ExpenseListing />);

    expect(screen.getByTestId('expense_listing-container')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Lunch/i)).toBeInTheDocument();
      expect(screen.getByText(/Coffee/i)).toBeInTheDocument();
    });
  });

  test('shows loading state while fetching expenses', async () => {
    fetchMock.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ExpenseListing />);

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    fetchMock.mockRejectedValueOnce(new Error('API error'));

    render(<ExpenseListing />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load expenses/i)).toBeInTheDocument();
    });
  });

  test('deletes an expense when delete button is clicked', async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(mockExpenses),
      })
      .mockResolvedValueOnce({});

    render(<ExpenseListing />);

    await waitFor(() => {
      expect(screen.getByText(/Lunch/i)).toBeInTheDocument();
    });

    userEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(screen.queryByText(/Lunch/i)).not.toBeInTheDocument();
    });
  });

  test('is accessible', async () => {
    fetchMock.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockExpenses),
    });

    render(<ExpenseListing />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /expenses/i })).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      mockExpenses.forEach(expense => {
        expect(screen.getByText(expense.description)).toHaveAccessibleName(expense.description);
        expect(screen.getByText(`$${expense.amount}`)).toHaveAccessibleName(`$${expense.amount}`);
        expect(screen.getByRole('button', { name: /Delete/i })).toBeEnabled();
      });
    });
  });
});