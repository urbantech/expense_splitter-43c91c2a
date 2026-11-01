import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AINativeProvider } from '@ainative/react-sdk';
import axios from 'axios';

// Importing feature components
import GroupExpenseCreation from './components/GroupExpenseCreation';
import ExpenseDeletion from './components/ExpenseDeletion';
import ExpenseListing from './components/ExpenseListing';
import Login from './components/Login';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('ainative_token');
      if (token) {
        setIsLoggedIn(true);
      }
      setLoading(false);
    };

    checkToken();
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('https://api.ainative.studio/api/v1/auth/login', { email, password });
      localStorage.setItem('ainative_token', response.data.access_token);
      setIsLoggedIn(true);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ainative_token');
    setIsLoggedIn(false);
  };

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <BrowserRouter>
        <header className="bg-dark-navy text-white p-4">
          <nav className="flex justify-between">
            <h1>Expense Splitter</h1>
            <div className="space-x-4">
              <Link to="/group-expense" className="hover:text-gray-300">Create Group Expense</Link>
              <Link to="/expenses" className="hover:text-gray-300">List Expenses</Link>
              {isLoggedIn && (
                <button onClick={handleLogout} className="hover:text-gray-300">Logout</button>
              )}
            </div>
          </nav>
          {error && <p className="mt-2 text-red-500">{error}</p>}
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/group-expense" element={
              <PrivateRoute>
                <GroupExpenseCreation />
              </PrivateRoute>
            } />
            <Route path="/expenses" element={
              <PrivateRoute>
                <ExpenseListing />
              </PrivateRoute>
            } />
            <Route path="/delete-expense/:id" element={
              <PrivateRoute>
                <ExpenseDeletion />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AINativeProvider>
  );
};

export default App;