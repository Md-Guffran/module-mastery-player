import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

const AccountDetails: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await api.get<User>('/api/auth'); // Assuming this endpoint returns current user details
        setUser(res);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        setError('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 pt-24">
          <p>Loading user details...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 pt-24">
          <p className="text-red-500">{error}</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mx-auto p-4 pt-24">
          <p>No user data found. Please sign in.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 pt-24">
        <h1 className="text-2xl font-bold mb-4">My Account Details</h1>
        <div className="bg-card p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <p className="text-muted-foreground">Username:</p>
            <p className="text-lg font-semibold">{user.username}</p>
          </div>
          <div className="mb-4">
            <p className="text-muted-foreground">Email:</p>
            <p className="text-lg font-semibold">{user.email}</p>
          </div>
          <div className="mb-4">
            <p className="text-muted-foreground">Role:</p>
            <p className="text-lg font-semibold">{user.role}</p>
          </div>
          {/* Add more user details here as needed */}
        </div>
      </div>
    </>
  );
};

export default AccountDetails;
