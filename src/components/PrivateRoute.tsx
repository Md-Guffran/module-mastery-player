import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api'; // Import the custom API client

interface PrivateRouteProps {
  children: React.ReactElement;
  requiredRole?: 'admin' | 'user'; // Optional prop to specify required role
}

interface UserData {
  role: string;
  // Add other user properties if needed
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get<UserData>('/api/auth'); // Use the custom API client
        setUserRole(res.role);
      } catch (error) {
        console.error('Failed to fetch user data or token invalid', error);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // If no user role is found (not authenticated)
  if (!userRole) {
    // alert('Access denied. Please sign in to view this page.');
    return <Navigate to="/signin" />;
  }

  // If a required role is specified and the user's role doesn't match
  if (requiredRole && userRole !== requiredRole) {
    alert(`Access denied. You must be a ${requiredRole} to view this page.`);
    return <Navigate to="/" />; // Redirect to home page for unauthorized roles
  }

  return children;

  return children;
};

export default PrivateRoute;
