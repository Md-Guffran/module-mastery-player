// import React, { useEffect, useState } from 'react';
// import { Navigate } from 'react-router-dom';
// import api from '../api'; // Import the custom API client

// interface PrivateRouteProps {
//   children: React.ReactElement;
//   requiredRole?: 'admin' | 'user'; // Optional prop to specify required role
// }

// interface UserData {
//   role: string;
//   // Add other user properties if needed
// }

// const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
//   const [userRole, setUserRole] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       const token = localStorage.getItem('token');
//       const currentPath = window.location.pathname;

//       // If on the signin page, don't make an auth check immediately
//       if (currentPath === '/signin') {
//         setLoading(false);
//         return;
//       }

//       if (!token) {
//         setUserRole(null);
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await api.get<UserData>('/api/auth'); // Use the custom API client
//         setUserRole(res.role);
//       } catch (error) {
//         console.error('Failed to fetch user data or token invalid', error);
//         localStorage.removeItem('token'); // Clear invalid token
//         setUserRole(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuthStatus();
//   }, []); // Empty dependency array to run only once on mount

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   // If no user role is found (not authenticated)
//   if (!userRole) {
//     // alert('Access denied. Please sign in to view this page.');
//     return <Navigate to="/signin" />;
//   }

//   // If a required role is specified and the user's role doesn't match
//   if (requiredRole && userRole !== requiredRole) {
//     alert(`Access denied. You must be a ${requiredRole} to view this page.`);
//     return <Navigate to="/" />; // Redirect to home page for unauthorized roles
//   }

//   return children;

//   return children;
// };

// export default PrivateRoute;


import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext'; // Import UserContext

interface PrivateRouteProps {
  children: React.ReactElement;
  requiredRole?: 'admin' | 'user';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { user } = useContext(UserContext);

  if (!user) return <Navigate to="/signin" />;

  if (requiredRole && user.role !== requiredRole) {
    alert(`Access denied. You must be a ${requiredRole} to view this page.`);
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
